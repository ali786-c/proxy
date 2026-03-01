<?php
$raw = file_get_contents('c:/xampp/htdocs/evomi_settings.json');
if (substr($raw, 0, 2) === "\xff\xfe") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}
$data = json_decode($raw, true);

$types = ['residential', 'sharedDataCenter', 'mobile', 'isp'];
$results = [];

foreach ($types as $t) {
    if (isset($data['data'][$t]['countries'])) {
        $results[$t] = count($data['data'][$t]['countries']);
    } elseif (isset($data['data'][$t])) {
        // e.g. ISP where it's a map of providers
        $count = 0;
        $unique_countries = [];
        foreach ($data['data'][$t] as $ispName => $ispData) {
            if (isset($ispData['countryCode'])) {
                $unique_countries[$ispData['countryCode']] = true;
            }
        }
        $results[$t] = count($unique_countries);
    } else {
        $results[$t] = 0;
    }
}

foreach ($results as $k => $v) {
    echo "$k: $v countries\n";
}
