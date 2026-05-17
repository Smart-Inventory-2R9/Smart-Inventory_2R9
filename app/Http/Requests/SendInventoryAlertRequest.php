<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendInventoryAlertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['required', 'string', 'in:email,telegram'],
            'to_email' => [
                Rule::requiredIf(fn () => in_array('email', $this->input('channels', []), true)),
                'email',
            ],
            'to_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'chat_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'subject' => ['sometimes', 'nullable', 'string', 'max:255'],
            'message_prefix' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}