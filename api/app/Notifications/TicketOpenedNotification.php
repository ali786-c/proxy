<?php

namespace App\Notifications;

class TicketOpenedNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'ticket' => ['id' => '...', 'subject' => '...'], 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('support_ticket_opened_user', $templateData);
    }
}
