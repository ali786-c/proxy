<?php
$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
// Handle possible UTF-16 encoding
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);
if (!$data || !isset($data['data'])) { echo "Failed to decode\n"; exit; }

$types = ['rp', 'dc', 'isp', 'mp', 'dc_ipv6', 'dc_unmetered'];
$countries = [];
foreach ($data['data']['continents'] ?? [] as $cont) {
    foreach ($cont['countries'] ?? [] as $name => $code) {
        $countries[strtolower($code)] = $name;
    }
}

$final = [];
foreach ($types as $t) {
    $typeCountries = [];
     if (isset($data['data'][$t]['countries'])) {
        foreach($data['data'][$t]['countries'] as $countryCode => $cdata) {
           $typeCountries[strtolower($countryCode)] = $cdata['name'];
        }
     } elseif (isset($data['data'][$t])) {
         foreach($data['data'][$t] as $k => $v) {
             if (isset($v['countryCode'])) {
                $c = strtolower($v['countryCode']);
                $typeCountries[$c] = $countries[$c] ?? strtoupper($c);
             }
         }
     }
     $final[$t] = $typeCountries;
}
file_put_contents('c:/xampp/htdocs/evomi_countries.json', json_encode($final, JSON_PRETTY_PRINT));
echo "Done";
