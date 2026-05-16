<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsdaLookupRequest;
use App\Services\UsdaService;

class UsdaController extends Controller
{
    public function lookup(UsdaLookupRequest $request, UsdaService $usdaService)
    {
        $response = $usdaService->lookup($request->validated());

        return response()->json($response->json(), $response->status());
    }
}