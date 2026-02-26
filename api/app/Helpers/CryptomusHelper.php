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
        // For empty bodies, the signature is based on an empty string Base64
        $payload = empty($data) ? '' : json_encode($data);
        return md5(base64_encode($payload) . $apiKey);
    }

    /**
     * Verify the signature from Cryptomus webhook.
     * 
     * @param string $jsonBody The raw body from the request
     * @param string $signHeader The 'sign' header from the request
     * @param string $apiKey The Cryptomus Payment/Webhook API key
     * @return bool
     */
    public static function verifySignature(string $jsonBody, string $signHeader, string $apiKey): bool
    {
        // Cryptomus webhooks pass the same MD5(Base64(Body) + API_KEY)
        $expectedSign = md5(base64_encode($jsonBody) . $apiKey);
        return hash_equals($expectedSign, $signHeader);
    }
}
