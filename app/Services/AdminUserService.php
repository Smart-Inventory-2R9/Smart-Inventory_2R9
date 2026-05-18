<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AdminUserService
{
    public function listUsers(int $perPage = 15)
    {
        return User::with('role')->latest()->paginate($perPage)->withQueryString();
    }

    public function listDeletedUsers(int $perPage = 15)
    {
        return User::onlyTrashed()
            ->with('role')
            ->latest('deleted_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findUser(int $id): User
    {
        return User::with('role')->findOrFail($id);
    }

    public function updateRole(int $id, array $data): User
    {
        $user = User::with('role')->findOrFail($id);
        $role = isset($data['role_id'])
            ? Role::find($data['role_id'])
            : Role::where('name', $data['role'])->first();

        if (! $role) {
            throw ValidationException::withMessages([
                'role' => ['The selected role is invalid.'],
            ]);
        }

        if ((int) $user->role_id === (int) $role->id) {
            $message = $role->name === 'admin'
                ? 'The selected user is already an admin.'
                : "The selected user already has the {$role->name} role.";

            throw ValidationException::withMessages([
                'role' => [$message],
            ]);
        }

        $user->update([
            'role_id' => $role->id,
        ]);

        return $user->fresh('role');
    }

    public function deleteUser(User $admin, int $id): void
    {
        if ($admin->id === $id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own admin account.'],
            ]);
        }

        User::findOrFail($id)->delete();
    }

    public function restoreUser(int $id): User
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return $user->fresh('role');
    }
}