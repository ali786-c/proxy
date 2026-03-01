<?php

namespace App\Notifications;

class AdminNewUserNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...', 'email' => '...', 'ip' => '...'], 'app' => ['name' => '...'], 'admin_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('admin_new_user', $templateData);
    }
}
