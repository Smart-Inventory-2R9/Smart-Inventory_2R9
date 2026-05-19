<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'recipient',
        'subject',
        'message',
        'status_code',
        'status',
        'response',
        'sent_at',
    ];

    protected $casts = [
        'response' => 'array',
        'sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}