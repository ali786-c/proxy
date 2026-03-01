<?php

namespace App\Notifications;

class WelcomeNotification extends BaseDynamicNotification
{
    /**
     * WelcomeNotification constructor.
     * 
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('welcome_user', $templateData);
    }
}
