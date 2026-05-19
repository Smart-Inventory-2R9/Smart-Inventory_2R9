<?php

namespace App\Http\Controllers;

use App\Models\Role;

class AdminRoleController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Role::withCount('users')->orderBy('name')->get(),
        ]);
    }
}