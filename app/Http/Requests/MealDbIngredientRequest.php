<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MealDbIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ingredient' => ['required', 'string', 'max:255'],
        ];
    }
}