<?php
$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);

$evomi_map = [
    'rp' => 'residential',
    'dc' => 'sharedDataCenter',
    'mp' => 'mobile',
    'isp' => 'isp',
    'dc_ipv6' => 'sharedDataCenter', // Assuming falls under same if not explicitly provided
    'dc_unmetered' => 'sharedDataCenter'
];

$final = [];

foreach ($evomi_map as $appType => $evomiType) {
    $typeCountries = [];
    if (isset($data['data'][$evomiType]['countries'])) {
        foreach($data['data'][$evomiType]['countries'] as $code => $cdata) {
           $typeCountries[$code] = $cdata['name'] ?? $code;
        }
    } elseif (isset($data['data'][$evomiType])) {
        // Handle ISP structure where it's a map of providers
        $seen = [];
        foreach($data['data'][$evomiType] as $ispName => $ispData) {
             if (isset($ispData['countryCode'])) {
                $c = $ispData['countryCode'];
                if (!isset($seen[$c])) {
                    $seen[$c] = $c; 
                    // To get full name, we might lookup continents
                    $foundName = $c;
                    foreach ($data['data']['continents'] ?? [] as $cont) {
                        foreach ($cont['countries'] ?? [] as $n => $cd) {
                            if (strtolower($cd) === strtolower($c)) {
                                $foundName = $n;
                                break 2;
                            }
                        }
                    }
                    $typeCountries[$c] = $foundName;
                }
             }
         }
    }
    // Sort array by country name
    asort($typeCountries);
    $final[$appType] = $typeCountries;
}

$dir = 'c:/xampp/htdocs/lovable-export-d31f97fa/src/lib/data';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}
file_put_contents($dir . '/countries.json', json_encode($final, JSON_PRETTY_PRINT));
echo "Generated $dir/countries.json\n";
