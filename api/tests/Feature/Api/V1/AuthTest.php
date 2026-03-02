<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;
    public function test_dump_routes(): void
    {
        dd(route('api.v1.balance'));
    }
    public function test_api_key_authentication_works_with_x_api_key_header(): void
    {
        $user = \App\Models\User::factory()->create(['balance' => 100]);
        $plainKey = 'uproxy_test_123';
        
        \App\Models\ApiKey::create([
            'user_id' => $user->id,
            'key_name' => 'Test Key',
            'key_hash' => \App\Models\ApiKey::hash($plainKey),
            'abilities' => ['*'],
            'is_active' => true,
        ]);

        $response = $this->getJson('/v1/me/balance', [
            'X-API-KEY' => $plainKey,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'balance' => 100,
                    'currency' => 'EUR'
                ]
            ]);
    }

    public function test_api_key_authentication_fails_with_invalid_key(): void
    {
        $response = $this->getJson('/v1/me/balance', [
            'X-API-KEY' => 'invalid_key_here',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('error.code', 'invalid_key');
    }

    public function test_api_key_authentication_fails_when_revoked(): void
    {
        $user = \App\Models\User::factory()->create();
        $plainKey = 'uproxy_revoked_test';
        
        \App\Models\ApiKey::create([
            'user_id' => $user->id,
            'key_name' => 'Revoked Key',
            'key_hash' => \App\Models\ApiKey::hash($plainKey),
            'abilities' => ['*'],
            'is_active' => false, // REVOKED
        ]);

        $response = $this->getJson('/v1/me/balance', [
            'X-API-KEY' => $plainKey,
        ]);

        $response->assertStatus(401);
    }
}
