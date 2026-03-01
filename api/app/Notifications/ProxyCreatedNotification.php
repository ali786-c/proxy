<?php

namespace App\Notifications;

class ProxyCreatedNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'product' => ['name' => '...'], 'order' => ['id' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('proxy_created_user', $templateData);
    }
}
