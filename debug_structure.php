<?php
$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);

if (isset($data['data'])) {
    echo "Root keys of data:\n";
    foreach (array_keys($data['data']) as $k) {
        echo "- $k\n";
    }
} else {
    echo "Root keys:\n";
    foreach (array_keys($data) as $k) {
        echo "- $k\n";
    }
}
