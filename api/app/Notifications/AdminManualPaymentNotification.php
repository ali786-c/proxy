<?php

namespace App\Notifications;

class AdminManualPaymentNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['email' => '...'], 'payment' => ['reference' => '...'], 'admin_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('admin_manual_payment', $templateData);
    }
}
