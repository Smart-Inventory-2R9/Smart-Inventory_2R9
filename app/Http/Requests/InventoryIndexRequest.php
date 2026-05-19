<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InventoryIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'in:low_stock,out_of_stock,in_stock,expired,expiring_soon'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:50'],
            'expires_within_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
            'sort_by' => ['sometimes', 'nullable', 'string', 'in:name,quantity,minimum_stock,expiration_date,created_at,updated_at'],
            'sort_direction' => ['sometimes', 'nullable', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}