<?php
/**
 * Fix Laravel Storage Symlink for cPanel
 * Upload this to public_html/api/ and visit: https://upgraderproxy.com/api/fix_storage.php
 */

$currentDir = __DIR__;
if (basename($currentDir) === 'public') {
    // Script is inside api/public/
    $publicStoragePath = $currentDir . '/storage';
    $targetPath = realpath($currentDir . '/../storage/app/public');
} else {
    // Script is inside api/
    $publicStoragePath = $currentDir . '/public/storage';
    $targetPath = $currentDir . '/storage/app/public';
}

echo "<h2>Laravel Storage Link Fixer</h2>";
echo "Public Path: $publicStoragePath <br>";
echo "Target Path: $targetPath <br><br>";

// 1. Remove existing if it's a dead link or folder
if (file_exists($publicStoragePath) || is_link($publicStoragePath)) {
    echo "Found existing storage entry. Removing it...<br>";
    if (is_link($publicStoragePath)) {
        unlink($publicStoragePath);
    } else {
        // If it's a real directory (sometimes happens on move), rename it
        rename($publicStoragePath, $publicStoragePath . '_backup_' . time());
    }
}

// 2. Create the link
try {
    if (symlink($targetPath, $publicStoragePath)) {
        echo "<b style='color:green'>SUCCESS!</b> The storage link has been created.<br>";
        echo "Now try to view your proof image again.";
    } else {
        echo "<b style='color:red'>FAILED!</b> Could not create symlink.";
    }
} catch (Exception $e) {
    echo "<b style='color:red'>ERROR:</b> " . $e->getMessage();
}

// 3. Optional: Verify a file exists
$testFile = $targetPath . '/proofs';
if (is_dir($testFile)) {
    echo "<br><br><b>Verification:</b> 'proofs' folder found in storage.";
} else {
    echo "<br><br><b style='color:orange'>Warning:</b> 'proofs' folder not found in storage. Make sure you have uploaded at least one proof.";
}
