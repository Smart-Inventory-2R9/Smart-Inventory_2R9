<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to_email' => ['required', 'email'],
            'to_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'html_content' => ['required_without:text_content', 'nullable', 'string'],
            'text_content' => ['required_without:html_content', 'nullable', 'string'],
            'sender_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sender_email' => ['sometimes', 'nullable', 'email'],
        ];
    }
}