<?php

namespace App\Notifications;

class PaymentAcceptedNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'payment' => ['reference' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('manual_payment_accepted_user', $templateData);
    }
}
