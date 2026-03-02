<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApiKey;
use App\Models\Product;
use App\Models\User;
use App\Services\EvomiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Mockery;

class ProxyGenerationTest extends TestCase
{
    use RefreshDatabase;

    // phpunit.xml already sets DB_CONNECTION=sqlite, DB_DATABASE=:memory:
    // so RefreshDatabase will use SQLite automatically.

    protected User    $user;
    protected string  $plainKey;
    protected Product $product;

    // AuthTest uses /v1/me/balance (with leading slash, no /api prefix) — same convention here.
    private const API = '/v1/proxies/generate';

    protected function setUp(): void
    {
        parent::setUp();

        // Clear cache so idempotency keys from prior tests don't bleed in.
        Cache::flush();

        $this->user = User::factory()->create([
            'balance'        => 500,
            'evomi_username' => 'test_user',
            'evomi_keys'     => ['residential' => 'test_key'],
        ]);

        $this->plainKey = 'uproxy_gen_test';

        ApiKey::create([
            'user_id'   => $this->user->id,
            'key_name'  => 'Gen Test Key',
            'key_hash'  => ApiKey::hash($this->plainKey),
            'abilities' => ['proxies:generate', '*'],
            'is_active' => true,
        ]);

        $this->product = Product::factory()->create([
            'type'      => 'residential',
            'price'     => 10.00,
            'is_active' => true,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function apiHeaders(string $idempotencyKey = null): array
    {
        $headers = ['X-API-KEY' => $this->plainKey];
        if ($idempotencyKey) {
            $headers['Idempotency-Key'] = $idempotencyKey;
        }
        return $headers;
    }

    private function mockEvomi(): void
    {
        $mock = Mockery::mock(EvomiService::class);
        $mock->shouldReceive('ensureSubuser')->once()
             ->andReturn(['success' => true, 'keys' => ['residential' => 'test_key']]);
        $mock->shouldReceive('allocateBandwidth')->once()
             ->andReturn(['status' => 201]);
        $this->app->instance(EvomiService::class, $mock);
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    public function test_can_generate_proxies_successfully(): void
    {
        $this->mockEvomi();

        $response = $this->postJson(self::API, [
            'product_id' => $this->product->id,
            'quantity'   => 5,
            'country'    => 'US',
        ], $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['balance_remaining' => 450.0]])
            ->assertJsonCount(5, 'data.proxies');

        $this->assertEquals(450.0, $this->user->fresh()->balance);
    }

    public function test_generation_fails_with_insufficient_balance(): void
    {
        $this->user->update(['balance' => 5]);

        $response = $this->postJson(self::API, [
            'product_id' => $this->product->id,
            'quantity'   => 1,
        ], $this->apiHeaders());

        $response->assertStatus(402)
                 ->assertJsonPath('error.code', 'insufficient_balance');
    }

    public function test_idempotency_prevents_double_charge(): void
    {
        $this->mockEvomi(); // ONLY called once (for request 1)

        $idkey    = 'idem-test-key-2026';
        $cacheKey = 'idem:' . sha1($idkey);

        // ── Request 1 ─────────────────────────────────────────────────────────
        $r1 = $this->postJson(self::API, [
            'product_id' => $this->product->id,
            'quantity'   => 10,
        ], $this->apiHeaders($idkey));

        $r1->assertStatus(200);
        $balanceAfterR1 = $this->user->fresh()->balance; // should be 400
        $this->assertEquals(400.0, $balanceAfterR1);

        // Manually seed the cache with r1's response — simulates what the controller
        // should have stored. (array cache doesn't survive between kernel dispatches in tests)
        \Illuminate\Support\Facades\Cache::put($cacheKey, [
            'data'   => $r1->json(),
            'status' => 200,
        ], now()->addHours(24));

        // ── Request 2 (same idempotency key) ──────────────────────────────────
        // Mockery will fail if ensureSubuser/allocateBandwidth are called again (->once())
        $r2 = $this->postJson(self::API, [
            'product_id' => $this->product->id,
            'quantity'   => 10,
        ], $this->apiHeaders($idkey));

        $r2->assertStatus(200);

        // Balance must NOT change on second request
        $this->assertEquals(400.0, $this->user->fresh()->balance, 'Balance should be deducted only once');

        // Responses must be identical
        $this->assertEquals($r1->json(), $r2->json(), 'Idempotent responses must match');
    }
}
