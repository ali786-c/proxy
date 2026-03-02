<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApiKey;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $plainKey;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->plainKey = 'uproxy_test_prod';
        ApiKey::create([
            'user_id' => $this->user->id,
            'key_name' => 'Prod Test Key',
            'key_hash' => ApiKey::hash($this->plainKey),
            'abilities' => ['*'],
            'is_active' => true,
        ]);
    }

    public function test_can_list_products_via_api(): void
    {
        Product::factory()->count(20)->create();

        $response = $this->getJson('/v1/products', [
            'X-API-KEY' => $this->plainKey,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(15, 'data'); // Default pagination 15
    }

    public function test_can_filter_products_by_type(): void
    {
        Product::factory()->create(['type' => 'residential', 'name' => 'Resi Product']);
        Product::factory()->create(['type' => 'isp', 'name' => 'ISP Product']);

        $response = $this->getJson('/v1/products?type=residential', [
            'X-API-KEY' => $this->plainKey,
        ]);

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'residential');
    }

    public function test_pagination_works_on_products(): void
    {
        Product::factory()->count(10)->create();

        $response = $this->getJson('/v1/products?per_page=5', [
            'X-API-KEY' => $this->plainKey,
        ]);

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.per_page', 5);
    }
}
