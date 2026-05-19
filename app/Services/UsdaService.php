<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class UsdaService
{
    public function lookup(array $data): Response
    {
        $payload = [
            'query' => $data['query'],
            'pageSize' => $data['page_size'] ?? 10,
            'pageNumber' => $data['page_number'] ?? 1,
        ];

        if (! empty($data['data_type'])) {
            $payload['dataType'] = $data['data_type'];
        }

        return Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post(
            rtrim(config('services.usda.base_uri'), '/') . '/foods/search?api_key=' . urlencode(config('services.usda.api_key')),
            $payload
        );
    }
}
