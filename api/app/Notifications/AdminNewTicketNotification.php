<?php

namespace App\Notifications;

class AdminNewTicketNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['email' => '...'], 'ticket' => ['subject' => '...', 'priority' => '...'], 'admin_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('admin_new_ticket', $templateData);
    }
}
