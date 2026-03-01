<?php
$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);

// the structure is $data['data']['continents'] right?
$codeToName = [];
foreach ($data['data']['continents'] ?? [] as $cont) {
    // $cont is an array like ["name" => "Asia", "countries" => ["Lebanon" => "LB"]]
    if (isset($cont['countries'])) {
        foreach ($cont['countries'] as $name => $code) {
            $codeToName[strtoupper($code)] = $name;
        }
    }
}
echo "Number of mapped countries: " . count($codeToName) . "\n";
if (isset($codeToName['AD'])) {
    echo "AD = " . $codeToName['AD'] . "\n";
} else {
    echo "AD not found!\n";
}
