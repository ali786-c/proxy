<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-route', function () {
    return response()->json(['message' => 'Web route is working']);
});

Route::get('/', function () {
    return view('welcome');
});
