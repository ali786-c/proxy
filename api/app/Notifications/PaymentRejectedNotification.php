<?php

namespace App\Notifications;

class PaymentRejectedNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'payment' => ['reference' => '...'], 'reject_reason' => '...', 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('manual_payment_rejected_user', $templateData);
    }
}
