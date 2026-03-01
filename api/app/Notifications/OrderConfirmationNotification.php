<?php

namespace App\Notifications;

class OrderConfirmationNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'order' => ['id' => '...', 'amount' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('order_confirmation_user', $templateData);
    }
}
