<?php
$target = __DIR__ . '/api/storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link)) {
    if (is_link($link)) {
        unlink($link);
        echo "Existing link removed.<br>";
    } else {
        echo "A directory or file named 'storage' already exists and is not a link. Please remove it manually.<br>";
        exit;
    }
}

if (symlink($target, $link)) {
    echo "Symlink created successfully: $link -> $target";
} else {
    echo "Failed to create symlink.";
}
?>
