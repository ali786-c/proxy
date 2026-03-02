<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'type' => $this->faker->randomElement(['residential', 'isp', 'datacenter', 'mobile']),
            'price' => $this->faker->randomFloat(2, 5, 50),
            'evomi_product_id' => 'prod_' . $this->faker->unique()->numberBetween(1000, 9999),
            'is_active' => true,
        ];
    }
}
