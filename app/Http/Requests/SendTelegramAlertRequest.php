<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendTelegramAlertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chat_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:4096'],
            'parse_mode' => ['sometimes', 'nullable', 'in:HTML,Markdown,MarkdownV2'],
            'disable_notification' => ['sometimes', 'boolean'],
        ];
    }
}