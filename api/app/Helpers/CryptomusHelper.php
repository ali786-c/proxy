<?php

namespace App\Helpers;

class CryptomusHelper
{
    /**
     * Generate the signature for Cryptomus API requests.
     * Logic: md5(base64_encode(json_encode($data)) . $API_KEY)
     * 
     * @param array $data The request body
     * @param string $apiKey The Cryptomus API key
     * @return string
     */
    public static function generateSignature(array $data, string $apiKey): string
    {
        // Remove 'sign' if present during generation (though usually not there yet)
        unset($data['sign']);
        
        // Cryptomus requires JSON without escaped slashes for signature consistency
        $payload = empty($data) ? '' : json_encode($data, JSON_UNESCAPED_SLASHES);
        return md5(base64_encode($payload) . $apiKey);
    }

    /**
     * Verify the signature from Cryptomus webhook.
     * 
     * @param array $data The payload array
     * @param string $apiKey The Cryptomus Payment/Webhook API key
     * @return bool
     */
    public static function verifySignature(array $data, string $apiKey): bool
    {
        if (!isset($data['sign'])) {
            return false;
        }

        $receivedSign = $data['sign'];
        
        // Prepare data for verification by removing 'sign'
        $verifyData = $data;
        unset($verifyData['sign']);

        // Generate expected signature using the same algorithm
        $payload = json_encode($verifyData, JSON_UNESCAPED_SLASHES);
        $expectedSign = md5(base64_encode($payload) . $apiKey);

        return hash_equals($expectedSign, $receivedSign);
    }
}
