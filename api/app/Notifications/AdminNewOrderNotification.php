<?php

namespace App\Notifications;

class AdminNewOrderNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['email' => '...'], 'order' => ['id' => '...', 'amount' => '...'], 'admin_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('admin_new_order', $templateData);
    }
}
