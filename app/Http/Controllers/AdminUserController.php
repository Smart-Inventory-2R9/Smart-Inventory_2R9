<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaginationRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Services\ActivityLogService;
use App\Services\AdminUserService;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(
        private AdminUserService $adminUserService,
        private ActivityLogService $activityLogService
    ) {}

    public function index(PaginationRequest $request)
    {
        return response()->json(
            $this->adminUserService->listUsers($request->validated('per_page') ?? 15)
        );
    }

    public function deleted(PaginationRequest $request)
    {
        return response()->json(
            $this->adminUserService->listDeletedUsers($request->validated('per_page') ?? 15)
        );
    }

    public function show(int $id)
    {
        return response()->json([
            'data' => $this->adminUserService->findUser($id),
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, int $id)
    {
        $user = $this->adminUserService->updateRole($id, $request->validated());

        $this->activityLogService->record(
            $request->user(),
            'updated_role',
            'admin_users',
            "Updated role for user: {$user->email}",
            ['target_user_id' => $user->id, 'role' => $user->role?->name]
        );

        return response()->json([
            'message' => 'User role updated',
            'data' => $user,
        ]);
    }

    public function restore(Request $request, int $id)
    {
        $user = $this->adminUserService->restoreUser($id);

        $this->activityLogService->record(
            $request->user(),
            'restored',
            'admin_users',
            "Restored user: {$user->email}",
            ['target_user_id' => $user->id, 'email' => $user->email]
        );

        return response()->json([
            'message' => 'User restored',
            'data' => $user,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $targetUser = $this->adminUserService->findUser($id);
        $this->adminUserService->deleteUser($request->user(), $id);

        $this->activityLogService->record(
            $request->user(),
            'deleted',
            'admin_users',
            "Soft deleted user: {$targetUser->email}",
            ['target_user_id' => $targetUser->id, 'email' => $targetUser->email]
        );

        return response()->json([
            'message' => 'User deleted',
        ]);
    }
}