<?php

namespace App\Http\Controllers;

use App\Models\SupportedCurrency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index()
    {
        $currencies = SupportedCurrency::where('is_active', true)->get();
        return response()->json($currencies);
    }
}
