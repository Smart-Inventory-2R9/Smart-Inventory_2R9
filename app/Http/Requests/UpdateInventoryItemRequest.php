<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'food_product_id' => ['sometimes', 'nullable', 'exists:food_products,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:50'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'minimum_stock' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'expiration_date' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
