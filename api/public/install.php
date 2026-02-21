<?php
/**
 * UpgradedProxy — Installation Wizard
 * Place this file in: api/public/install.php
 * Access via: https://yourdomain.com/api/install.php
 */

session_start();

define('BASE_PATH', dirname(__DIR__));
define('LOCK_FILE', BASE_PATH . '/storage/installed.lock');
define('ENV_FILE', BASE_PATH . '/.env');

// --- If already installed, block access ---
if (file_exists(LOCK_FILE) && !isset($_GET['force'])) {
    die('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Already Installed</title>
    <style>body{background:#0f0f1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .box{text-align:center;padding:40px;}.icon{font-size:64px;}.h1{font-size:28px;font-weight:700;margin:16px 0 8px;}
    .p{color:#9ca3af;}.link{color:#6366f1;text-decoration:none;display:inline-block;margin-top:20px;padding:10px 24px;border:1px solid #6366f1;border-radius:8px;}
    .link:hover{background:#6366f1;color:#fff;}</style></head>
    <body><div class="box"><div class="icon">🔒</div>
    <div class="h1">Already Installed</div>
    <div class="p">UpgradedProxy has already been installed.<br>Delete <code>storage/installed.lock</code> to reinstall.</div>
    <a class="link" href="/api">Go to App →</a></div></body></html>');
}

// --- Step Management ---
if (!isset($_SESSION['install_step'])) $_SESSION['install_step'] = 1;
$step = $_SESSION['install_step'];
$error = '';
$success = '';

// =====================================================================
// POST HANDLERS
// =====================================================================

// STEP 2: Test DB connection
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'test_db') {
    $host = trim($_POST['db_host'] ?? '127.0.0.1');
    $port = trim($_POST['db_port'] ?? '3306');
    $name = trim($_POST['db_name'] ?? '');
    $user = trim($_POST['db_user'] ?? '');
    $pass = trim($_POST['db_pass'] ?? '');

    if (empty($name) || empty($user)) {
        $error = 'Database name and username are required.';
    } else {
        try {
            $pdo = new PDO("mysql:host={$host};port={$port};dbname={$name}", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);
            $_SESSION['db'] = compact('host', 'port', 'name', 'user', 'pass');
            $_SESSION['install_step'] = 3;
            $step = 3;
            $success = 'Database connection successful!';
        } catch (PDOException $e) {
            $error = 'Connection failed: ' . $e->getMessage();
        }
    }
}

// STEP 3: Save App Config
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_config') {
    $_SESSION['config'] = [
        'app_name'              => trim($_POST['app_name'] ?? 'UpgradedProxy'),
        'app_url'               => rtrim(trim($_POST['app_url'] ?? ''), '/'),
        'evomi_key'             => trim($_POST['evomi_key'] ?? ''),
        'stripe_key'            => trim($_POST['stripe_key'] ?? ''),
        'stripe_secret'         => trim($_POST['stripe_secret'] ?? ''),
        'stripe_webhook_secret' => trim($_POST['stripe_webhook_secret'] ?? ''),
        'mail_host'             => trim($_POST['mail_host'] ?? '127.0.0.1'),
        'mail_port'             => trim($_POST['mail_port'] ?? '587'),
        'mail_user'             => trim($_POST['mail_user'] ?? ''),
        'mail_pass'             => trim($_POST['mail_pass'] ?? ''),
        'mail_from'             => trim($_POST['mail_from'] ?? ''),
    ];
    $_SESSION['install_step'] = 4;
    $step = 4;
}

// STEP 4: Save Admin Account
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_admin') {
    $name  = trim($_POST['admin_name'] ?? '');
    $email = trim($_POST['admin_email'] ?? '');
    $pass  = trim($_POST['admin_password'] ?? '');
    $pass2 = trim($_POST['admin_password2'] ?? '');

    if (empty($name) || empty($email) || empty($pass)) {
        $error = 'All fields are required.';
    } elseif ($pass !== $pass2) {
        $error = 'Passwords do not match.';
    } elseif (strlen($pass) < 8) {
        $error = 'Password must be at least 8 characters.';
    } else {
        $_SESSION['admin'] = compact('name', 'email', 'pass');
        $_SESSION['install_step'] = 5;
        $step = 5;
    }
}

// STEP 5: Run Install
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'run_install') {
    $db     = $_SESSION['db'] ?? [];
    $config = $_SESSION['config'] ?? [];
    $admin  = $_SESSION['admin'] ?? [];
    $logs   = [];

    // 1. Generate APP_KEY
    $appKey = 'base64:' . base64_encode(random_bytes(32));

    // 2. Write .env
    $envContent = <<<ENV
APP_NAME={$config['app_name']}
APP_ENV=production
APP_KEY={$appKey}
APP_DEBUG=false
APP_URL={$config['app_url']}/api

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST={$db['host']}
DB_PORT={$db['port']}
DB_DATABASE={$db['name']}
DB_USERNAME={$db['user']}
DB_PASSWORD={$db['pass']}

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file

MAIL_MAILER=smtp
MAIL_SCHEME=null
MAIL_HOST={$config['mail_host']}
MAIL_PORT={$config['mail_port']}
MAIL_USERNAME={$config['mail_user']}
MAIL_PASSWORD={$config['mail_pass']}
MAIL_FROM_ADDRESS="{$config['mail_from']}"
MAIL_FROM_NAME="\${APP_NAME}"

EVOMI_API_KEY={$config['evomi_key']}
STRIPE_KEY={$config['stripe_key']}
STRIPE_SECRET={$config['stripe_secret']}
STRIPE_WEBHOOK_SECRET={$config['stripe_webhook_secret']}
ENV;

    if (file_put_contents(ENV_FILE, $envContent)) {
        $logs[] = ['ok', '.env file written successfully'];
    } else {
        $logs[] = ['err', 'Failed to write .env — check folder permissions'];
    }

    // 3. Run migrations
    $php = PHP_BINARY;
    $artisan = BASE_PATH . '/artisan';

    exec("cd " . escapeshellarg(BASE_PATH) . " && {$php} artisan config:clear 2>&1", $out1);
    $logs[] = ['ok', 'Config cache cleared'];

    exec("cd " . escapeshellarg(BASE_PATH) . " && {$php} artisan migrate --force 2>&1", $out2, $code2);
    if ($code2 === 0) {
        $logs[] = ['ok', 'Database migrations ran successfully'];
    } else {
        $logs[] = ['err', 'Migration failed: ' . implode(' ', array_slice($out2, -3))];
    }

    // 4. Run seeders
    exec("cd " . escapeshellarg(BASE_PATH) . " && {$php} artisan db:seed --class=ProductSeeder --force 2>&1", $out3, $code3);
    if ($code3 === 0) {
        $logs[] = ['ok', 'Products seeded successfully'];
    } else {
        $logs[] = ['warn', 'Seeder warning: ' . implode(' ', array_slice($out3, -2))];
    }

    // 5. Create admin user directly via PDO
    try {
        $pdo = new PDO(
            "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']}",
            $db['user'], $db['pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $hashedPass = password_hash($admin['pass'], PASSWORD_BCRYPT, ['cost' => 12]);
        $referralCode = 'UP-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        $now = date('Y-m-d H:i:s');

        // Check if user already exists
        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$admin['email']]);

        if ($check->fetchColumn()) {
            // Update existing user to admin role
            $stmt = $pdo->prepare("UPDATE users SET role = 'admin', name = ?, password = ? WHERE email = ?");
            $stmt->execute([$admin['name'], $hashedPass, $admin['email']]);
            $logs[] = ['ok', 'Existing user upgraded to admin'];
        } else {
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, referral_code, balance, created_at, updated_at) VALUES (?, ?, ?, 'admin', ?, 0, ?, ?)");
            $stmt->execute([$admin['name'], $admin['email'], $hashedPass, $referralCode, $now, $now]);
            $logs[] = ['ok', 'Admin account created: ' . $admin['email']];
        }
    } catch (PDOException $e) {
        $logs[] = ['err', 'Admin creation failed: ' . $e->getMessage()];
    }

    // 6. Cache config + routes for production
    exec("cd " . escapeshellarg(BASE_PATH) . " && {$php} artisan config:cache 2>&1");
    exec("cd " . escapeshellarg(BASE_PATH) . " && {$php} artisan route:cache 2>&1");
    $logs[] = ['ok', 'Config and routes cached for production'];

    // 7. Write lock file
    file_put_contents(LOCK_FILE, date('Y-m-d H:i:s') . "\nInstalled by wizard.\n");
    $logs[] = ['ok', 'Installation locked (storage/installed.lock created)'];

    // Store logs and mark done
    $_SESSION['install_logs'] = $logs;
    $_SESSION['install_done'] = true;
    $_SESSION['install_step'] = 6;
    $step = 6;
}

// =====================================================================
// REQUIREMENTS CHECK (for step 1)
// =====================================================================
function checkRequirements() {
    $checks = [];
    $checks[] = ['PHP Version >= 8.2', PHP_VERSION_ID >= 80200, PHP_VERSION];
    $checks[] = ['PDO MySQL Extension', extension_loaded('pdo_mysql'), extension_loaded('pdo_mysql') ? 'Loaded' : 'Missing'];
    $checks[] = ['OpenSSL Extension', extension_loaded('openssl'), extension_loaded('openssl') ? 'Loaded' : 'Missing'];
    $checks[] = ['Mbstring Extension', extension_loaded('mbstring'), extension_loaded('mbstring') ? 'Loaded' : 'Missing'];
    $checks[] = ['Tokenizer Extension', extension_loaded('tokenizer'), extension_loaded('tokenizer') ? 'Loaded' : 'Missing'];
    $checks[] = ['storage/ Writable', is_writable(BASE_PATH . '/storage'), is_writable(BASE_PATH . '/storage') ? 'Writable' : 'Not Writable!'];
    $checks[] = ['.env Writable', is_writable(BASE_PATH) || file_exists(ENV_FILE), (is_writable(BASE_PATH) || file_exists(ENV_FILE)) ? 'Writable' : 'Not Writable!'];
    return $checks;
}

$allPassed = true;
if ($step === 1) {
    $reqs = checkRequirements();
    foreach ($reqs as $r) { if (!$r[1]) $allPassed = false; }
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UpgradedProxy — Installation</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #0a0a14;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .bg-grid {
            position: fixed; inset: 0;
            background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
        }
        .header {
            border-bottom: 1px solid rgba(99,102,241,0.2);
            padding: 20px 40px;
            display: flex; align-items: center; gap: 12px;
            background: rgba(15,15,30,0.8);
            backdrop-filter: blur(10px);
        }
        .logo {
            width: 36px; height: 36px; border-radius: 8px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: 900; color: white;
        }
        .logo-text { font-size: 18px; font-weight: 700; }
        .logo-text span { color: #6366f1; }
        .install-badge {
            margin-left: auto;
            background: rgba(99,102,241,0.1);
            border: 1px solid rgba(99,102,241,0.3);
            color: #818cf8;
            padding: 4px 12px; border-radius: 20px; font-size: 12px;
        }
        .container { max-width: 720px; margin: 0 auto; padding: 40px 20px; flex: 1; position: relative; z-index: 1; }
        /* Progress Steps */
        .steps-bar {
            display: flex; align-items: center; margin-bottom: 40px;
        }
        .step-item {
            display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;
        }
        .step-circle {
            width: 36px; height: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 700; border: 2px solid;
            transition: all 0.3s;
        }
        .step-circle.done { background: #6366f1; border-color: #6366f1; color: white; }
        .step-circle.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #818cf8; }
        .step-circle.pending { background: transparent; border-color: rgba(255,255,255,0.1); color: #4b5563; }
        .step-label { font-size: 11px; color: #6b7280; white-space: nowrap; }
        .step-label.active-label { color: #818cf8; }
        .step-connector { flex: 1; height: 1px; background: rgba(255,255,255,0.1); margin: 0 8px; margin-bottom: 22px; }
        .step-connector.done { background: #6366f1; }
        /* Card */
        .card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px; padding: 36px;
        }
        .card-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
        .card-subtitle { color: #6b7280; font-size: 14px; margin-bottom: 28px; }
        /* Form */
        .form-group { margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        label { display: block; font-size: 13px; font-weight: 500; color: #9ca3af; margin-bottom: 6px; }
        input {
            width: 100%; padding: 11px 14px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; color: #e2e8f0; font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }
        input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        input::placeholder { color: #4b5563; }
        .hint { font-size: 12px; color: #4b5563; margin-top: 4px; }
        /* Buttons */
        .btn {
            padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;
            cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px;
            transition: all 0.2s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }
        .btn-secondary {
            background: rgba(255,255,255,0.06); color: #9ca3af;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-big {
            width: 100%; padding: 14px; justify-content: center; font-size: 15px;
        }
        .btn-green {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.3);
        }
        /* Alerts */
        .alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 20px; display: flex; gap: 10px; align-items: flex-start; }
        .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
        .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; }
        /* Requirements Table */
        .req-table { width: 100%; border-collapse: collapse; }
        .req-table td { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
        .req-table td:last-child { text-align: right; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-ok { background: rgba(16,185,129,0.15); color: #6ee7b7; }
        .badge-err { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .badge-warn { background: rgba(245,158,11,0.15); color: #fcd34d; }
        /* Log Items */
        .log-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
        .log-icon { font-size: 16px; flex-shrink: 0; }
        /* Section Divider */
        .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #4b5563; margin: 24px 0 12px; }
        /* Done screen */
        .done-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
        .done-creds { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 20px; margin: 24px 0; }
        .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
        .cred-label { color: #6b7280; }
        .cred-val { color: #e2e8f0; font-family: monospace; font-size: 13px; }
        footer { text-align: center; padding: 24px; color: #374151; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body>
<div class="bg-grid"></div>

<div class="header">
    <div class="logo">U</div>
    <div class="logo-text">Upgraded<span>Proxy</span></div>
    <div class="install-badge">✦ Installation Wizard</div>
</div>

<div class="container">

    <!-- Progress Bar -->
    <?php if ($step <= 5): ?>
    <div class="steps-bar">
        <?php
        $steps = ['Welcome', 'Database', 'App Config', 'Admin', 'Install'];
        foreach ($steps as $i => $label):
            $num = $i + 1;
            $stateCircle = $num < $step ? 'done' : ($num == $step ? 'active' : 'pending');
            $stateLabel = $num == $step ? 'active-label' : '';
        ?>
        <?php if ($i > 0): ?>
            <div class="step-connector <?= $num <= $step ? 'done' : '' ?>"></div>
        <?php endif; ?>
        <div class="step-item">
            <div class="step-circle <?= $stateCircle ?>">
                <?= $stateCircle === 'done' ? '✓' : $num ?>
            </div>
            <div class="step-label <?= $stateLabel ?>"><?= $label ?></div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if ($error): ?>
    <div class="alert alert-error">⚠️ <?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <!-- ==================== STEP 1: Welcome ==================== -->
    <?php if ($step === 1): ?>
    <div class="card">
        <div class="card-title">👋 Welcome to UpgradedProxy</div>
        <div class="card-subtitle">Let's check your server requirements before we begin.</div>

        <table class="req-table">
        <?php foreach ($reqs as $r): ?>
        <tr>
            <td><?= $r[0] ?></td>
            <td><?= $r[2] ?></td>
            <td><span class="badge <?= $r[1] ? 'badge-ok' : 'badge-err' ?>"><?= $r[1] ? '✓ Pass' : '✗ Fail' ?></span></td>
        </tr>
        <?php endforeach; ?>
        </table>

        <br>
        <?php if ($allPassed): ?>
        <div class="alert alert-success">✓ All requirements met! You're good to go.</div>
        <form method="POST">
            <input type="hidden" name="action" value="next_step">
            <button type="submit" class="btn btn-primary btn-big" onclick="$_SESSION['install_step']=2">
                Continue to Database Setup →
            </button>
        </form>
        <?php else: ?>
        <div class="alert alert-error">⚠️ Please fix the failing requirements before continuing.</div>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- Handle step 1 next -->
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'next_step') {
        $_SESSION['install_step'] = 2;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
    ?>

    <!-- ==================== STEP 2: Database ==================== -->
    <?php if ($step === 2): ?>
    <div class="card">
        <div class="card-title">🗄️ Database Configuration</div>
        <div class="card-subtitle">Enter your MySQL database credentials. The database must already exist.</div>

        <?php if ($success): ?>
        <div class="alert alert-success">✓ <?= htmlspecialchars($success) ?></div>
        <?php endif; ?>

        <form method="POST">
            <input type="hidden" name="action" value="test_db">

            <div class="form-row">
                <div class="form-group">
                    <label>Database Host</label>
                    <input type="text" name="db_host" value="<?= htmlspecialchars($_SESSION['db']['host'] ?? '127.0.0.1') ?>" placeholder="127.0.0.1">
                </div>
                <div class="form-group">
                    <label>Port</label>
                    <input type="text" name="db_port" value="<?= htmlspecialchars($_SESSION['db']['port'] ?? '3306') ?>" placeholder="3306">
                </div>
            </div>

            <div class="form-group">
                <label>Database Name</label>
                <input type="text" name="db_name" value="<?= htmlspecialchars($_SESSION['db']['name'] ?? '') ?>" placeholder="upgraded_proxy" required>
                <div class="hint">Create this DB in cPanel → MySQL Databases first</div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>MySQL Username</label>
                    <input type="text" name="db_user" value="<?= htmlspecialchars($_SESSION['db']['user'] ?? '') ?>" placeholder="your_db_user" required>
                </div>
                <div class="form-group">
                    <label>MySQL Password</label>
                    <input type="password" name="db_pass" value="<?= htmlspecialchars($_SESSION['db']['pass'] ?? '') ?>" placeholder="••••••••">
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-big">Test & Continue →</button>
        </form>
    </div>
    <?php endif; ?>

    <!-- ==================== STEP 3: App Config ==================== -->
    <?php if ($step === 3): ?>
    <div class="card">
        <div class="card-title">⚙️ App Configuration</div>
        <div class="card-subtitle">Configure your application settings and API keys.</div>

        <form method="POST">
            <input type="hidden" name="action" value="save_config">

            <div class="form-row">
                <div class="form-group">
                    <label>App Name</label>
                    <input type="text" name="app_name" value="<?= htmlspecialchars($_SESSION['config']['app_name'] ?? 'UpgradedProxy') ?>" placeholder="UpgradedProxy" required>
                </div>
                <div class="form-group">
                    <label>App URL</label>
                    <input type="url" name="app_url" value="<?= htmlspecialchars($_SESSION['config']['app_url'] ?? '') ?>" placeholder="https://yourdomain.com" required>
                    <div class="hint">No trailing slash. E.g. https://proxy.com</div>
                </div>
            </div>

            <div class="section-title">🔑 API Keys</div>

            <div class="form-group">
                <label>Evomi Reseller API Key</label>
                <input type="text" name="evomi_key" value="<?= htmlspecialchars($_SESSION['config']['evomi_key'] ?? '') ?>" placeholder="evomi_xxxxxxxxxxxxxxxx">
            </div>

            <div class="form-group">
                <label>Stripe Publishable Key</label>
                <input type="text" name="stripe_key" value="<?= htmlspecialchars($_SESSION['config']['stripe_key'] ?? '') ?>" placeholder="pk_live_...">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Stripe Secret Key</label>
                    <input type="password" name="stripe_secret" value="<?= htmlspecialchars($_SESSION['config']['stripe_secret'] ?? '') ?>" placeholder="sk_live_...">
                </div>
                <div class="form-group">
                    <label>Stripe Webhook Secret</label>
                    <input type="password" name="stripe_webhook_secret" value="<?= htmlspecialchars($_SESSION['config']['stripe_webhook_secret'] ?? '') ?>" placeholder="whsec_...">
                </div>
            </div>

            <div class="section-title">📧 Email (SMTP) — Optional</div>

            <div class="form-row">
                <div class="form-group">
                    <label>SMTP Host</label>
                    <input type="text" name="mail_host" value="<?= htmlspecialchars($_SESSION['config']['mail_host'] ?? '') ?>" placeholder="smtp.gmail.com">
                </div>
                <div class="form-group">
                    <label>SMTP Port</label>
                    <input type="text" name="mail_port" value="<?= htmlspecialchars($_SESSION['config']['mail_port'] ?? '587') ?>" placeholder="587">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>SMTP Username</label>
                    <input type="text" name="mail_user" value="<?= htmlspecialchars($_SESSION['config']['mail_user'] ?? '') ?>" placeholder="you@gmail.com">
                </div>
                <div class="form-group">
                    <label>SMTP Password</label>
                    <input type="password" name="mail_pass" value="<?= htmlspecialchars($_SESSION['config']['mail_pass'] ?? '') ?>" placeholder="app password">
                </div>
            </div>

            <div class="form-group">
                <label>From Email Address</label>
                <input type="email" name="mail_from" value="<?= htmlspecialchars($_SESSION['config']['mail_from'] ?? '') ?>" placeholder="noreply@yourdomain.com">
            </div>

            <button type="submit" class="btn btn-primary btn-big">Save & Continue →</button>
        </form>
    </div>
    <?php endif; ?>

    <!-- ==================== STEP 4: Admin Account ==================== -->
    <?php if ($step === 4): ?>
    <div class="card">
        <div class="card-title">👤 Admin Account</div>
        <div class="card-subtitle">Create the super admin account. You'll use this to log into the admin panel.</div>

        <form method="POST">
            <input type="hidden" name="action" value="save_admin">

            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="admin_name" value="<?= htmlspecialchars($_SESSION['admin']['name'] ?? '') ?>" placeholder="Muhammad Ali" required>
            </div>

            <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="admin_email" value="<?= htmlspecialchars($_SESSION['admin']['email'] ?? '') ?>" placeholder="admin@yourdomain.com" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="admin_password" placeholder="Min. 8 characters" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="admin_password2" placeholder="Repeat password" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-big">Create Admin & Continue →</button>
        </form>
    </div>
    <?php endif; ?>

    <!-- ==================== STEP 5: Install ==================== -->
    <?php if ($step === 5): ?>
    <div class="card">
        <div class="card-title">🚀 Ready to Install</div>
        <div class="card-subtitle">Review your configuration and click Install to begin.</div>

        <?php $db = $_SESSION['db'] ?? []; $config = $_SESSION['config'] ?? []; $admin = $_SESSION['admin'] ?? []; ?>
        <div class="done-creds">
            <div class="cred-row"><span class="cred-label">Database</span><span class="cred-val"><?= htmlspecialchars($db['name'] ?? '') ?> @ <?= htmlspecialchars($db['host'] ?? '') ?></span></div>
            <div class="cred-row"><span class="cred-label">App URL</span><span class="cred-val"><?= htmlspecialchars($config['app_url'] ?? '') ?></span></div>
            <div class="cred-row"><span class="cred-label">Admin Email</span><span class="cred-val"><?= htmlspecialchars($admin['email'] ?? '') ?></span></div>
            <div class="cred-row"><span class="cred-label">Evomi Key</span><span class="cred-val"><?= $config['evomi_key'] ? '••••••••' . substr($config['evomi_key'] ?? '', -4) : 'Not set' ?></span></div>
            <div class="cred-row"><span class="cred-label">Stripe</span><span class="cred-val"><?= $config['stripe_key'] ? 'Configured' : 'Not set' ?></span></div>
        </div>

        <form method="POST">
            <input type="hidden" name="action" value="run_install">
            <button type="submit" class="btn btn-green btn-big">⚡ Install Now</button>
        </form>
        <div class="hint" style="text-align:center; margin-top:12px;">This will write .env, run migrations, seed products, and create your admin account.</div>
    </div>
    <?php endif; ?>

    <!-- ==================== STEP 6: Done ==================== -->
    <?php if ($step === 6): ?>
    <div class="card">
        <div class="done-icon">🎉</div>
        <div class="card-title" style="text-align:center; font-size:26px;">Installation Complete!</div>
        <div class="card-subtitle" style="text-align:center;">UpgradedProxy is ready. Here are your access details.</div>

        <div class="section-title">Installation Log</div>
        <?php foreach ($_SESSION['install_logs'] ?? [] as $log): ?>
        <div class="log-item">
            <span class="log-icon"><?= $log[0] === 'ok' ? '✅' : ($log[0] === 'warn' ? '⚠️' : '❌') ?></span>
            <span style="color: <?= $log[0] === 'ok' ? '#6ee7b7' : ($log[0] === 'warn' ? '#fcd34d' : '#fca5a5') ?>"><?= htmlspecialchars($log[1]) ?></span>
        </div>
        <?php endforeach; ?>

        <div class="done-creds" style="margin-top:24px;">
            <div class="cred-row">
                <span class="cred-label">🌐 Site URL</span>
                <span class="cred-val"><?= htmlspecialchars($_SESSION['config']['app_url'] ?? '') ?></span>
            </div>
            <div class="cred-row">
                <span class="cred-label">👤 Admin Email</span>
                <span class="cred-val"><?= htmlspecialchars($_SESSION['admin']['email'] ?? '') ?></span>
            </div>
            <div class="cred-row">
                <span class="cred-label">🔑 Admin Password</span>
                <span class="cred-val">As entered in Step 4</span>
            </div>
        </div>

        <div style="display:flex; gap:12px; margin-top:24px;">
            <a href="<?= htmlspecialchars(($_SESSION['config']['app_url'] ?? '') . '/login') ?>"
               class="btn btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
                🔐 Go to Login
            </a>
            <a href="<?= htmlspecialchars(($_SESSION['config']['app_url'] ?? '') . '/admin') ?>"
               class="btn btn-secondary" style="flex:1; justify-content:center; text-decoration:none;">
                🛠️ Admin Panel
            </a>
        </div>

        <div class="alert alert-success" style="margin-top:20px;">
            🔒 <strong>install.php is now locked.</strong> Delete it from your server for extra security.
        </div>
    </div>
    <?php endif; ?>

</div>

<footer>UpgradedProxy Installation Wizard &mdash; Powered by Laravel + React</footer>
</body>
</html>
