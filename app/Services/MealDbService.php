<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class MealDbService
{
    public function searchByName(array $data): Response
    {
        return $this->get('/search.php', [
            's' => $data['query'],
        ]);
    }

    public function filterByIngredient(array $data): Response
    {
        return $this->get('/filter.php', [
            'i' => $data['ingredient'],
        ]);
    }

    public function lookupById(array $data): Response
    {
        return $this->get('/lookup.php', [
            'i' => $data['meal_id'],
        ]);
    }

    private function get(string $endpoint, array $query): Response
    {
        $baseUri = rtrim(config('services.themealdb.base_uri'), '/');
        $apiKey = trim(config('services.themealdb.api_key', '1'), '/');

        return Http::withHeaders([
            'Accept' => 'application/json',
        ])->get("{$baseUri}/{$apiKey}{$endpoint}", $query);
    }
}