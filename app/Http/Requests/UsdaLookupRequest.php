<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsdaLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query' => ['required', 'string', 'max:255'],
            'page_size' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'page_number' => ['sometimes', 'integer', 'min:1'],
            'data_type' => ['sometimes', 'array'],
            'data_type.*' => ['string', 'in:Branded,Foundation,SR Legacy,Survey (FNDDS),Experimental'],
        ];
    }
}