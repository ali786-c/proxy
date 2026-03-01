<?php

namespace App\Notifications;

class ResetPasswordNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('reset_password_user', $templateData);
    }
}
