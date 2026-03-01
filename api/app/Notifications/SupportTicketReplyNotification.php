<?php

namespace App\Notifications;

class SupportTicketReplyNotification extends BaseDynamicNotification
{
    /**
     * @param array $templateData Expected: ['user' => ['name' => '...'], 'ticket' => ['id' => '...', 'subject' => '...'], 'reply_content' => '...', 'action_url' => '...']
     */
    public function __construct(array $templateData)
    {
        parent::__construct('support_ticket_reply_user', $templateData);
    }
}
