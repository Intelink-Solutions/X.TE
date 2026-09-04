<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Feature-level permissions for modules that have real screens today.
     * Every module (built or not) also gets a `{slug}.view` permission
     * so role-based sidebar/module access works for the whole nav.
     */
    protected array $builtModuleActions = [
        'users' => ['view', 'create', 'edit', 'delete', 'impersonate', 'export'],
        'roles' => ['view', 'create', 'edit', 'delete'],
    ];

    protected array $roles = [
        'Super Admin' => 'all',
        'Administrator' => 'admin',
        'Editor' => 'limited',
        'Content Writer' => 'limited',
        'Moderator' => 'limited',
        'Support Agent' => 'limited',
        'Artist' => 'none',
        'Musician' => 'none',
        'Dancer' => 'none',
        'Presenter' => 'none',
        'Sponsor' => 'none',
        'Advertiser' => 'none',
        'Customer' => 'none',
        'Subscriber' => 'none',
        'Guest' => 'none',
    ];

    public function run(): void
    {
        Cache::forget('spatie.permission.cache');

        $modules = config('modules.groups');
        $allPermissions = [];

        foreach ($modules as $group) {
            foreach ($group['items'] as $item) {
                $slug = $item['slug'];
                $actions = $this->builtModuleActions[$slug] ?? ['view'];

                foreach ($actions as $action) {
                    $name = "{$slug}.{$action}";
                    Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
                    $allPermissions[] = $name;
                }
            }
        }

        $adminPermissions = array_values(array_filter($allPermissions, fn ($p) => str_ends_with($p, '.view')
            || str_starts_with($p, 'users.')
            || str_starts_with($p, 'roles.')
        ));

        $limitedPermissions = array_values(array_filter($allPermissions, fn ($p) => str_ends_with($p, '.view')));

        foreach ($this->roles as $name => $tier) {
            $role = Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);

            $role->syncPermissions(match ($tier) {
                'all' => $allPermissions,
                'admin' => $adminPermissions,
                'limited' => $limitedPermissions,
                default => [],
            });
        }
    }
}
