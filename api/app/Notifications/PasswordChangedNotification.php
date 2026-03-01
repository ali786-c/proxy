<?php

namespace App\Notifications;

class PasswordChangedNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...']]
     */
    public function __construct(array $templateData)
    {
        parent::__construct('password_changed_user', $templateData);
    }
}
