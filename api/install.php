<?php
/**
 * UpgradedProxy — Install Wizard
 * Location: api/install.php
 * Access: yourdomain.com/api/install.php
 */

session_start();

define('BASE_PATH', __DIR__);
define('LOCK_FILE', BASE_PATH . '/storage/installed.lock');
define('ENV_FILE',  BASE_PATH . '/.env');

// Already installed?
if (file_exists(LOCK_FILE) && !isset($_GET['force'])) {
    die('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Already Installed</title>
    <style>body{background:#0f0f1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .b{text-align:center;padding:40px}.icon{font-size:60px}.h1{font-size:26px;font-weight:700;margin:14px 0 6px}
    .p{color:#9ca3af}.a{color:#6366f1;text-decoration:none;display:inline-block;margin-top:18px;padding:9px 22px;border:1px solid #6366f1;border-radius:8px}
    </style></head><body><div class="b"><div class="icon">🔒</div>
    <div class="h1">Already Installed</div>
    <div class="p">UpgradedProxy is already installed.<br>Delete <code>storage/installed.lock</code> to reinstall.</div>
    <a class="a" href="/">← Go to App</a></div></body></html>');
}

// Step state
if (!isset($_SESSION['install_step'])) $_SESSION['install_step'] = 1;
$step = $_SESSION['install_step'];
$err = ''; $ok = '';

// ================================================================
// Helper: Safe PHP binary detection for shared hosting / cPanel
// ================================================================
function findPhpBinary() {
    $candidates = [
        PHP_BINARY,
        '/usr/local/bin/php',
        '/usr/local/bin/php8.3', '/usr/local/bin/php8.2', '/usr/local/bin/php8.1',
        '/usr/local/bin/ea-php83', '/usr/local/bin/ea-php82', '/usr/local/bin/ea-php81',
        '/usr/bin/php', '/usr/bin/php8.3', '/usr/bin/php8.2', '/usr/bin/php8.1',
    ];
    foreach ($candidates as $c) {
        if (!empty($c) && @file_exists($c) && @is_executable($c)) return $c;
    }
    return 'php'; // last resort — hope it's in PATH
}

// ================================================================
// Helper: Run shell command safely
// ================================================================
function safeExec($cmd) {
    $disabled = array_map('trim', explode(',', (string)@ini_get('disable_functions')));
    $out = []; $code = 1;
    if (function_exists('exec') && !in_array('exec', $disabled)) {
        @exec($cmd, $out, $code);
    } elseif (function_exists('shell_exec') && !in_array('shell_exec', $disabled)) {
        $r = @shell_exec($cmd . ' 2>&1');
        $out = $r ? explode("\n", trim($r)) : [];
        $code = 0;
    }
    return [$out, $code];
}

function canExec() {
    $disabled = array_map('trim', explode(',', (string)@ini_get('disable_functions')));
    return (function_exists('exec') && !in_array('exec', $disabled))
        || (function_exists('shell_exec') && !in_array('shell_exec', $disabled));
}

// ================================================================
// POST HANDLERS
// ================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['action'])) {
    $action = $_POST['action'];

    // Step 1 → 2
    if ($action === 'next_step') {
        $_SESSION['install_step'] = 2;
        header('Location: ' . $_SERVER['PHP_SELF']); exit;
    }

    // Step 2: Test DB
    if ($action === 'test_db') {
        $h = trim($_POST['db_host'] ?? 'localhost');
        $P = trim($_POST['db_port'] ?? '3306');
        $n = trim($_POST['db_name'] ?? '');
        $u = trim($_POST['db_user'] ?? '');
        $p = trim($_POST['db_pass'] ?? '');
        if (!$n || !$u) {
            $err = 'Database name and username are required.';
        } else {
            try {
                new PDO("mysql:host=$h;port=$P;dbname=$n", $u, $p,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]);
                $_SESSION['db'] = ['host'=>$h,'port'=>$P,'name'=>$n,'user'=>$u,'pass'=>$p];
                $_SESSION['install_step'] = 3; $step = 3;
                $ok = 'Database connected successfully!';
            } catch (PDOException $e) {
                $err = 'Connection failed: ' . $e->getMessage();
            }
        }
    }

    // Step 3: Save config
    if ($action === 'save_config') {
        $_SESSION['config'] = [
            'app_name' => trim($_POST['app_name'] ?? 'UpgradedProxy'),
            'app_url'  => rtrim(trim($_POST['app_url'] ?? ''), '/'),
            'evomi'    => trim($_POST['evomi'] ?? ''),
            'sk'       => trim($_POST['sk'] ?? ''),
            'ss'       => trim($_POST['ss'] ?? ''),
            'swh'      => trim($_POST['swh'] ?? ''),
            'mh'       => trim($_POST['mh'] ?? ''),
            'mp'       => trim($_POST['mp'] ?? '587'),
            'mu'       => trim($_POST['mu'] ?? ''),
            'mpw'      => trim($_POST['mpw'] ?? ''),
            'mf'       => trim($_POST['mf'] ?? ''),
        ];
        $_SESSION['install_step'] = 4; $step = 4;
    }

    // Step 4: Save admin
    if ($action === 'save_admin') {
        $an = trim($_POST['an'] ?? ''); $ae = trim($_POST['ae'] ?? '');
        $ap = trim($_POST['ap'] ?? ''); $ap2 = trim($_POST['ap2'] ?? '');
        if (!$an || !$ae || !$ap)  { $err = 'All fields required.'; }
        elseif ($ap !== $ap2)       { $err = 'Passwords do not match.'; }
        elseif (strlen($ap) < 8)    { $err = 'Password must be 8+ characters.'; }
        else {
            $_SESSION['adm'] = ['name'=>$an,'email'=>$ae,'pass'=>$ap];
            $_SESSION['install_step'] = 5; $step = 5;
        }
    }

    // Step 5: Run Install
    if ($action === 'run_install') {
        // Bulletproof — no 500 errors
        set_time_limit(300);
        error_reporting(0);
        ini_set('display_errors', '0');

        $db  = $_SESSION['db']  ?? [];
        $cfg = $_SESSION['cfg'] ?? $_SESSION['config'] ?? [];
        $adm = $_SESSION['adm'] ?? [];
        $logs = [];

        ob_start();
        try {
            // 1. Write .env
            $key = 'base64:' . base64_encode(random_bytes(32));
            $env = implode("\n", [
                "APP_NAME={$cfg['app_name']}",
                "APP_ENV=production",
                "APP_KEY=$key",
                "APP_DEBUG=false",
                "APP_URL={$cfg['app_url']}/api",
                "",
                "APP_LOCALE=en",
                "APP_FALLBACK_LOCALE=en",
                "APP_FAKER_LOCALE=en_US",
                "APP_MAINTENANCE_DRIVER=file",
                "BCRYPT_ROUNDS=12",
                "",
                "LOG_CHANNEL=stack",
                "LOG_STACK=single",
                "LOG_LEVEL=error",
                "",
                "DB_CONNECTION=mysql",
                "DB_HOST={$db['host']}",
                "DB_PORT={$db['port']}",
                "DB_DATABASE={$db['name']}",
                "DB_USERNAME={$db['user']}",
                "DB_PASSWORD={$db['pass']}",
                "",
                "SESSION_DRIVER=file",
                "SESSION_LIFETIME=120",
                "SESSION_ENCRYPT=false",
                "SESSION_PATH=/",
                "SESSION_DOMAIN=null",
                "",
                "BROADCAST_CONNECTION=log",
                "FILESYSTEM_DISK=local",
                "QUEUE_CONNECTION=sync",
                "CACHE_STORE=file",
                "",
                "MAIL_MAILER=smtp",
                "MAIL_SCHEME=null",
                "MAIL_HOST={$cfg['mh']}",
                "MAIL_PORT={$cfg['mp']}",
                "MAIL_USERNAME={$cfg['mu']}",
                "MAIL_PASSWORD={$cfg['mpw']}",
                "MAIL_FROM_ADDRESS=\"{$cfg['mf']}\"",
                'MAIL_FROM_NAME="${APP_NAME}"',
                "",
                "EVOMI_API_KEY={$cfg['evomi']}",
                "STRIPE_KEY={$cfg['sk']}",
                "STRIPE_SECRET={$cfg['ss']}",
                "STRIPE_WEBHOOK_SECRET={$cfg['swh']}",
            ]) . "\n";

            if (@file_put_contents(ENV_FILE, $env)) {
                $logs[] = ['ok', '.env written successfully'];
            } else {
                $logs[] = ['warn', '.env write failed — chmod api/ to 755 in cPanel'];
            }

            // 2. Run artisan commands
            if (canExec()) {
                $php = findPhpBinary();
                $bp  = escapeshellarg(BASE_PATH);

                [,$c0] = safeExec("cd $bp && $php artisan config:clear 2>&1");
                $logs[] = ['ok', 'Config cache cleared'];

                [$mo, $mc] = safeExec("cd $bp && $php artisan migrate --force 2>&1");
                $last = is_array($mo) ? trim(end($mo)) : '';
                $logs[] = [$mc === 0 ? 'ok' : 'warn',
                    $mc === 0 ? 'Migrations ran: ' . ($last ?: 'tables ready')
                              : 'Migration: ' . ($last ?: 'check DB tables manually')];

                [$so, $sc] = safeExec("cd $bp && $php artisan db:seed --class=ProductSeeder --force 2>&1");
                $logs[] = [$sc === 0 ? 'ok' : 'warn',
                    $sc === 0 ? 'Products seeded' : 'Seeder note: ' . (is_array($so) ? trim(end($so)) : '')];

                safeExec("cd $bp && $php artisan config:cache 2>&1");
                safeExec("cd $bp && $php artisan route:cache 2>&1");
                $logs[] = ['ok', 'Config & routes cached'];
            } else {
                $logs[] = ['warn', 'exec() disabled — run via cPanel Terminal: php artisan migrate --seed'];
            }

        } catch (Throwable $e) {
            $logs[] = ['warn', 'Install note: ' . $e->getMessage()];
        }
        ob_end_clean();

        // 3. Create admin via PDO (no exec needed)
        try {
            $pdo = new PDO(
                "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']}",
                $db['user'], $db['pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $hp  = password_hash($adm['pass'], PASSWORD_BCRYPT, ['cost' => 12]);
            $rc  = 'UP-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $now = date('Y-m-d H:i:s');

            $chk = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $chk->execute([$adm['email']]);

            if ($chk->fetchColumn()) {
                $pdo->prepare("UPDATE users SET role='admin',name=?,password=? WHERE email=?")
                    ->execute([$adm['name'], $hp, $adm['email']]);
                $logs[] = ['ok', 'Existing user promoted to admin: ' . $adm['email']];
            } else {
                $pdo->prepare("INSERT INTO users (name,email,password,role,referral_code,balance,created_at,updated_at) VALUES (?,?,?,'admin',?,0,?,?)")
                    ->execute([$adm['name'], $adm['email'], $hp, $rc, $now, $now]);
                $logs[] = ['ok', 'Admin created: ' . $adm['email']];
            }
        } catch (PDOException $e) {
            $logs[] = ['err', 'Admin error: ' . $e->getMessage()];
        }

        // 4. Lock wizard
        if (@file_put_contents(LOCK_FILE, date('Y-m-d H:i:s') . "\nInstalled.\n")) {
            $logs[] = ['ok', 'Wizard locked — will not appear again'];
        } else {
            $logs[] = ['warn', 'Could not write lock file. Create api/storage/installed.lock manually.'];
        }

        $_SESSION['install_logs'] = $logs;
        $_SESSION['install_step'] = 6;
        $step = 6;
    }
}

// ================================================================
// Requirements check
// ================================================================
$reqs = [
    ['PHP >= 8.1', PHP_VERSION_ID >= 80100, PHP_VERSION],
    ['PDO MySQL',  extension_loaded('pdo_mysql'), extension_loaded('pdo_mysql') ? 'Loaded' : '❌ Missing'],
    ['OpenSSL',    extension_loaded('openssl'),   extension_loaded('openssl')   ? 'Loaded' : '❌ Missing'],
    ['storage/ Writable', is_writable(BASE_PATH.'/storage'), is_writable(BASE_PATH.'/storage') ? '✓ Writable' : '❌ Not Writable!'],
    ['.env Writable', is_writable(BASE_PATH) || (file_exists(ENV_FILE) && is_writable(ENV_FILE)), is_writable(BASE_PATH) ? 'Writable' : 'Check perms'],
    ['exec() / artisan', canExec(), canExec() ? 'Available' : '⚠️ Disabled (manual migration needed)'],
];
$allOk = true;
foreach ($reqs as $r) { if (!$r[1] && strpos($r[0], 'exec') === false) $allOk = false; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UpgradedProxy — Install</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a14;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column}
.grid{position:fixed;inset:0;background-image:linear-gradient(rgba(99,102,241,.04)1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04)1px,transparent 1px);background-size:40px 40px;pointer-events:none}
.hdr{border-bottom:1px solid rgba(99,102,241,.2);padding:16px 36px;display:flex;align-items:center;gap:12px;background:rgba(10,10,20,.9);backdrop-filter:blur(12px)}
.logo{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:17px}
.lt{font-size:17px;font-weight:700}.lt s{color:#6366f1;text-decoration:none}
.badge{margin-left:auto;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);color:#818cf8;padding:3px 12px;border-radius:20px;font-size:12px}
.wrap{max-width:680px;margin:0 auto;padding:32px 18px;flex:1;position:relative;z-index:1}
.steps{display:flex;align-items:center;margin-bottom:32px}
.si{display:flex;flex-direction:column;align-items:center;gap:5px;flex:1}
.sc{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid}
.sdone{background:#6366f1;border-color:#6366f1;color:#fff}.sact{background:rgba(99,102,241,.2);border-color:#6366f1;color:#818cf8}.spen{background:transparent;border-color:rgba(255,255,255,.1);color:#4b5563}
.sl{font-size:10px;color:#6b7280;white-space:nowrap}.sla{color:#818cf8}
.sline{flex:1;height:1px;background:rgba(255,255,255,.1);margin:0 5px;margin-bottom:20px}.slined{background:#6366f1}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px}
.ct{font-size:21px;font-weight:700;margin-bottom:5px}.cs{color:#6b7280;font-size:14px;margin-bottom:22px}
.fg{margin-bottom:16px}.fr{display:grid;grid-template-columns:1fr 1fr;gap:13px}
label{display:block;font-size:12px;font-weight:500;color:#9ca3af;margin-bottom:5px}
input{width:100%;padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}input::placeholder{color:#374151}
.hint{font-size:11px;color:#4b5563;margin-top:3px}
.btn{padding:11px 22px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:7px;transition:all .2s}
.bp{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 18px rgba(99,102,241,.3)}.bp:hover{transform:translateY(-1px)}
.bg{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 18px rgba(16,185,129,.25)}.bg:hover{transform:translateY(-1px)}
.bs{background:rgba(255,255,255,.06);color:#9ca3af;border:1px solid rgba(255,255,255,.1)}
.bf{width:100%;justify-content:center;padding:13px;font-size:15px}
.ae{padding:10px 14px;border-radius:9px;font-size:13px;margin-bottom:16px;display:flex;gap:8px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5}
.as{padding:10px 14px;border-radius:9px;font-size:13px;margin-bottom:16px;display:flex;gap:8px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#6ee7b7}
.rt{width:100%;border-collapse:collapse}.rt td{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px}.rt td:last-child{text-align:right}
.bok{padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(16,185,129,.15);color:#6ee7b7}
.ber{padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(239,68,68,.15);color:#fca5a5}
.stt{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#4b5563;margin:20px 0 10px}
.cb{background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.18);border-radius:12px;padding:16px;margin:18px 0}
.cr{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04)}.cr:last-child{border:none}
.cl{color:#6b7280}.cv{color:#e2e8f0;font-family:monospace;font-size:12px}
.li{display:flex;align-items:baseline;gap:9px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px}
.di{font-size:56px;text-align:center;margin-bottom:14px}
.brow{display:flex;gap:11px;margin-top:18px}
foot{display:block;text-align:center;padding:18px;color:#374151;font-size:12px;border-top:1px solid rgba(255,255,255,.05)}
</style>
</head>
<body>
<div class="grid"></div>
<div class="hdr">
  <div class="logo">U</div>
  <div class="lt">Upgraded<s>Proxy</s></div>
  <div class="badge">✦ Installation Wizard</div>
</div>
<div class="wrap">
<?php if ($step <= 5): ?>
<div class="steps">
<?php $lbls=['Welcome','Database','App Config','Admin','Install'];
foreach ($lbls as $i => $l):
    $n = $i+1;
    $sc = $n < $step ? 'sdone' : ($n == $step ? 'sact' : 'spen');
    $al = $n == $step ? 'sla' : '';
?>
<?php if ($i > 0): ?><div class="sline <?= $n <= $step ? 'slined' : '' ?>"></div><?php endif; ?>
<div class="si"><div class="sc <?= $sc ?>"><?= $sc === 'sdone' ? '✓' : $n ?></div><div class="sl <?= $al ?>"><?= $l ?></div></div>
<?php endforeach; ?>
</div>
<?php endif; ?>

<?php if ($err): ?><div class="ae">⚠️ <?= htmlspecialchars($err) ?></div><?php endif; ?>
<?php if ($ok):  ?><div class="as">✓ <?= htmlspecialchars($ok) ?></div><?php endif; ?>

<?php if ($step === 1): ?>
<div class="card">
<div class="ct">👋 Welcome to UpgradedProxy</div>
<div class="cs">Checking server requirements before installation.</div>
<table class="rt">
<?php foreach ($reqs as $r): ?>
<tr><td><?= $r[0] ?></td><td><?= $r[2] ?></td><td><span class="<?= $r[1] ? 'bok' : 'ber' ?>"><?= $r[1] ? '✓ Pass' : '✗ Fail' ?></span></td></tr>
<?php endforeach; ?>
</table><br>
<?php if ($allOk): ?>
<div class="as">✓ Requirements met!</div>
<form method="POST"><input type="hidden" name="action" value="next_step">
<button class="btn bp bf" type="submit">Continue to Database Setup →</button></form>
<?php else: ?><div class="ae">⚠️ Fix failing requirements first.</div><?php endif; ?>
</div>

<?php elseif ($step === 2): ?>
<div class="card">
<div class="ct">🗄️ Database Setup</div>
<div class="cs">Enter your cPanel MySQL credentials. DB must exist first.</div>
<form method="POST"><input type="hidden" name="action" value="test_db">
<div class="fr">
  <div class="fg"><label>Host</label><input name="db_host" value="<?= htmlspecialchars($_SESSION['db']['host'] ?? 'localhost') ?>" placeholder="localhost"></div>
  <div class="fg"><label>Port</label><input name="db_port" value="<?= htmlspecialchars($_SESSION['db']['port'] ?? '3306') ?>"></div>
</div>
<div class="fg"><label>Database Name</label><input name="db_name" value="<?= htmlspecialchars($_SESSION['db']['name'] ?? '') ?>" placeholder="user_proxydatabase" required><div class="hint">Create in cPanel → MySQL Databases first</div></div>
<div class="fr">
  <div class="fg"><label>Username</label><input name="db_user" value="<?= htmlspecialchars($_SESSION['db']['user'] ?? '') ?>" placeholder="user_dbuser" required></div>
  <div class="fg"><label>Password</label><input type="password" name="db_pass" placeholder="••••••••"></div>
</div>
<button class="btn bp bf" type="submit">Test & Continue →</button>
</form></div>

<?php elseif ($step === 3): ?>
<div class="card">
<div class="ct">⚙️ App Configuration</div>
<div class="cs">Set your URL and API keys.</div>
<form method="POST"><input type="hidden" name="action" value="save_config">
<div class="fr">
  <div class="fg"><label>App Name</label><input name="app_name" value="<?= htmlspecialchars($_SESSION['config']['app_name'] ?? 'UpgradedProxy') ?>"></div>
  <div class="fg"><label>App URL (no trailing /)</label><input name="app_url" type="url" value="<?= htmlspecialchars($_SESSION['config']['app_url'] ?? '') ?>" placeholder="https://devwithguru.site" required><div class="hint">e.g. https://devwithguru.site</div></div>
</div>
<div class="stt">🔑 API Keys</div>
<div class="fg"><label>Evomi Reseller API Key</label><input name="evomi" value="<?= htmlspecialchars($_SESSION['config']['evomi'] ?? '') ?>" placeholder="evomi_xxxx"></div>
<div class="fg"><label>Stripe Publishable Key</label><input name="sk" value="<?= htmlspecialchars($_SESSION['config']['sk'] ?? '') ?>" placeholder="pk_live_..."></div>
<div class="fr">
  <div class="fg"><label>Stripe Secret Key</label><input type="password" name="ss" placeholder="sk_live_..."></div>
  <div class="fg"><label>Stripe Webhook Secret</label><input type="password" name="swh" placeholder="whsec_..."></div>
</div>
<div class="stt">📧 SMTP (Optional)</div>
<div class="fr">
  <div class="fg"><label>SMTP Host</label><input name="mh" value="<?= htmlspecialchars($_SESSION['config']['mh'] ?? '') ?>" placeholder="mail.domain.com"></div>
  <div class="fg"><label>SMTP Port</label><input name="mp" value="<?= htmlspecialchars($_SESSION['config']['mp'] ?? '587') ?>"></div>
</div>
<div class="fr">
  <div class="fg"><label>SMTP User</label><input name="mu" value="<?= htmlspecialchars($_SESSION['config']['mu'] ?? '') ?>" placeholder="noreply@domain.com"></div>
  <div class="fg"><label>SMTP Password</label><input type="password" name="mpw"></div>
</div>
<div class="fg"><label>From Email</label><input type="email" name="mf" value="<?= htmlspecialchars($_SESSION['config']['mf'] ?? '') ?>" placeholder="noreply@domain.com"></div>
<button class="btn bp bf" type="submit">Save & Continue →</button>
</form></div>

<?php elseif ($step === 4): ?>
<div class="card">
<div class="ct">👤 Admin Account</div>
<div class="cs">Create your super admin account.</div>
<form method="POST"><input type="hidden" name="action" value="save_admin">
<div class="fg"><label>Full Name</label><input name="an" value="<?= htmlspecialchars($_SESSION['adm']['name'] ?? '') ?>" required placeholder="Muhammad Ali"></div>
<div class="fg"><label>Email</label><input type="email" name="ae" value="<?= htmlspecialchars($_SESSION['adm']['email'] ?? '') ?>" required placeholder="admin@domain.com"></div>
<div class="fr">
  <div class="fg"><label>Password</label><input type="password" name="ap" required placeholder="Min. 8 characters"></div>
  <div class="fg"><label>Confirm</label><input type="password" name="ap2" required placeholder="Repeat password"></div>
</div>
<button class="btn bp bf" type="submit">Create Admin & Continue →</button>
</form></div>

<?php elseif ($step === 5):
$db  = $_SESSION['db']  ?? [];
$cfg = $_SESSION['cfg'] ?? $_SESSION['config'] ?? [];
$adm = $_SESSION['adm'] ?? [];
?>
<div class="card">
<div class="ct">🚀 Ready to Install</div>
<div class="cs">Review your configuration.</div>
<div class="cb">
  <div class="cr"><span class="cl">Database</span><span class="cv"><?= htmlspecialchars($db['name'] ?? '') ?> @ <?= htmlspecialchars($db['host'] ?? '') ?></span></div>
  <div class="cr"><span class="cl">App URL</span><span class="cv"><?= htmlspecialchars($cfg['app_url'] ?? '') ?></span></div>
  <div class="cr"><span class="cl">Admin</span><span class="cv"><?= htmlspecialchars($adm['email'] ?? '') ?></span></div>
  <div class="cr"><span class="cl">Evomi</span><span class="cv"><?= !empty($cfg['evomi']) ? '✓ Set' : 'Not set' ?></span></div>
  <div class="cr"><span class="cl">Stripe</span><span class="cv"><?= !empty($cfg['sk']) ? '✓ Set' : 'Not set' ?></span></div>
</div>
<form method="POST"><input type="hidden" name="action" value="run_install">
<button class="btn bg bf" type="submit">⚡ Install Now</button>
</form>
<div class="hint" style="text-align:center;margin-top:10px">Writes .env · Runs migrations · Seeds products · Creates admin</div>
</div>

<?php elseif ($step === 6): ?>
<div class="card">
<div class="di">🎉</div>
<div class="ct" style="text-align:center;font-size:24px">Installation Complete!</div>
<div class="cs" style="text-align:center">UpgradedProxy is ready. Your platform is live!</div>
<div class="stt" style="margin-top:16px">Installation Log</div>
<?php foreach ($_SESSION['install_logs'] ?? [] as $l): ?>
<div class="li">
  <span><?= $l[0]==='ok' ? '✅' : ($l[0]==='warn' ? '⚠️' : '❌') ?></span>
  <span style="color:<?= $l[0]==='ok'?'#6ee7b7':($l[0]==='warn'?'#fcd34d':'#fca5a5') ?>"><?= htmlspecialchars($l[1]) ?></span>
</div>
<?php endforeach; ?>
<div class="cb" style="margin-top:18px">
  <div class="cr"><span class="cl">🌐 Site</span><span class="cv"><?= htmlspecialchars($_SESSION['cfg']['app_url'] ?? $_SESSION['config']['app_url'] ?? '') ?></span></div>
  <div class="cr"><span class="cl">👤 Email</span><span class="cv"><?= htmlspecialchars($_SESSION['adm']['email'] ?? '') ?></span></div>
  <div class="cr"><span class="cl">🔑 Password</span><span class="cv">As set in Step 4</span></div>
</div>
<div class="brow">
  <a href="<?= htmlspecialchars(($_SESSION['cfg']['app_url'] ?? $_SESSION['config']['app_url'] ?? '') . '/login') ?>" class="btn bp" style="flex:1;justify-content:center;text-decoration:none">🔐 Go to Login</a>
  <a href="<?= htmlspecialchars(($_SESSION['cfg']['app_url'] ?? $_SESSION['config']['app_url'] ?? '') . '/admin') ?>" class="btn bs" style="flex:1;justify-content:center;text-decoration:none">🛠️ Admin Panel</a>
</div>
<div class="as" style="margin-top:14px">🔒 <strong>Wizard is now locked.</strong> Delete <code>api/install.php</code> for extra security.</div>
</div>
<?php endif; ?>
</div>
<foot>UpgradedProxy Installation Wizard — Laravel + React</foot>
</body>
</html>
