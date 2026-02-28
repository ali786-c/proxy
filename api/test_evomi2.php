<?php
$data = json_decode(file_get_contents('evomi_data.json'), true);
echo implode(', ', array_keys($data['data']));
