<?php

namespace App\Http\Controllers;

class AdminTestController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'message' => 'Admin access granted',
        ]);
    }
}
