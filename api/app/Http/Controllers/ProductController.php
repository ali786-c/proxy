<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        try {
            $products = Product::all()->map(function($product) {
                return [
                    'id'          => (string) $product->id,
                    'name'        => $product->name,
                    'price_cents' => (int) ($product->price * 100),
                    'type'        => $product->type,
                    'included_gb' => 1,
                    'features'    => ['High Speed', '99.9% Uptime', 'Global Locations'],
                ];
            });
            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'type'             => 'required|string|max:100',
            'price'            => 'required|numeric|min:0',
            'evomi_product_id' => 'required|string|max:255',
            'is_active'        => 'boolean',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'type'             => 'sometimes|required|string|max:100',
            'price'            => 'sometimes|required|numeric|min:0',
            'evomi_product_id' => 'sometimes|required|string|max:255',
            'is_active'        => 'sometimes|boolean',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
