<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\JsonResponse;

class ApiBaseController extends Controller
{
    /**
     * Send a standardized success response.
     */
    protected function sendSuccess($data, string $message = null, int $code = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'data'    => $data,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Send a standardized error response.
     */
    protected function sendError(string $message, string $code = 'error', int $httpCode = 400, array $fields = []): JsonResponse
    {
        $response = [
            'success' => false,
            'error'   => [
                'code'    => $code,
                'message' => $message,
            ],
        ];

        if (!empty($fields)) {
            $response['error']['fields'] = $fields;
        }

        return response()->json($response, $httpCode);
    }
}
