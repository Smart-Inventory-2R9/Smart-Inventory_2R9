<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id' => ['required_without:role', 'integer', 'exists:roles,id'],
            'role' => ['required_without:role_id', 'string', 'exists:roles,name'],
        ];
    }
}