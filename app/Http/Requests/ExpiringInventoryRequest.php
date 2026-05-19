<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpiringInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'days' => ['sometimes', 'integer', 'min:1', 'max:365'],
        ];
    }
}