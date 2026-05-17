<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MealDbLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meal_id' => ['required', 'string', 'max:50'],
        ];
    }
}