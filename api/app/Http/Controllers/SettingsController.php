<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * GET /admin/settings - Get all settings
     */
    public function index()
    {
        return response()->json(Setting::all()->pluck('value', 'key'));
    }

    /**
     * POST /admin/settings - Update bulk settings
     */
    public function update(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
