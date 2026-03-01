<?php
// Let's just download the standard country map
$json = file_get_contents('https://flagcdn.com/en/codes.json');
if (!$json) {
    die("Could not fetch standard country codes.");
}
$standardCodes = json_decode($json, true);

$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);

$codeToName = [];
// Convert flagcdn codes to UPPERCASE
foreach ($standardCodes as $k => $v) {
    // flagcdn has things like 'us': 'United States'
    // but also US states like 'us-ca' which we don't need
    if (strpos($k, '-') === false) {
        $codeToName[strtoupper($k)] = $v;
    }
}

$evomi_map = [
    'rp' => 'residential',
    'dc' => 'sharedDataCenter',
    'mp' => 'mobile',
    'isp' => 'isp',
    'dc_ipv6' => 'sharedDataCenter',
    'dc_unmetered' => 'sharedDataCenter'
];

$final = [];

foreach ($evomi_map as $appType => $evomiType) {
    $typeCountries = [];
    
    if (isset($data['data'][$evomiType]['countries'])) {
        $countriesNode = $data['data'][$evomiType]['countries'];
        foreach($countriesNode as $key => $val) {
            $code = is_array($val) && isset($val['id']) ? strtoupper($val['id']) : (is_string($key) ? strtoupper($key) : strtoupper($val));
            $name = $codeToName[$code] ?? (is_array($val) && isset($val['name']) ? $val['name'] : $code);
            $typeCountries[$code] = $name;
        }
    } elseif (isset($data['data'][$evomiType])) {
        foreach($data['data'][$evomiType] as $ispName => $ispData) {
             if (isset($ispData['countryCode'])) {
                $code = strtoupper($ispData['countryCode']);
                $typeCountries[$code] = $codeToName[$code] ?? $code;
             }
         }
    }
    
    asort($typeCountries);
    $final[$appType] = $typeCountries;
}

$dir = 'c:/xampp/htdocs/lovable-export-d31f97fa/src/lib/data';
file_put_contents($dir . '/countries.json', json_encode($final, JSON_PRETTY_PRINT));
echo "Successfully mapped " . count($codeToName) . " total global countries.\n";
echo "Generated $dir/countries.json\n";
