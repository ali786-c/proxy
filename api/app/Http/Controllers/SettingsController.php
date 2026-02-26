<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * List of settings allowed to be managed via general settings.
     */
    protected $allowedKeys = [
        'site_name',
        'support_email',
        'maintenance_mode',
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_pass',
        'admin_2fa_required',
        'rate_limiting_enabled'
    ];

    /**
     * GET /admin/settings - Get all settings
     */
    public function index()
    {
        return response()->json(
            Setting::whereIn('key', $this->allowedKeys)
                ->get()
                ->pluck('value', 'key')
        );
    }

    /**
     * POST /admin/settings - Update bulk settings
     */
    public function update(Request $request)
    {
        $settings = $request->only($this->allowedKeys);

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return response()->json(['message' => 'General settings updated successfully']);
    }
}
