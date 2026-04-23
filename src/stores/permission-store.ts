import {
	checkPermission,
	getModulePermissions,
	hasAllPermissions,
	hasAnyPermission,
	type Permission,
	type Role,
} from "@/lib/permission";
import { create, type StateCreator } from "zustand";

interface PermissionState {
	roles: Role[];
	permissions: Set<Permission>;
	permissionMap: Map<string, Set<Permission>>;
}

interface PermissionActions {
	setPermissions: (permissions: Permission[], roles: Role[]) => void;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (permissions: Permission[]) => boolean;
	hasAllPermissions: (permissions: Permission[]) => boolean;
	getModulePermissions: (module: string) => Set<Permission>;
	clearPermissions: () => void;
}

type PermissionStore = PermissionState & PermissionActions;

const permissionStoreCreator: StateCreator<PermissionStore> = (set, get) => ({
	roles: [],
	permissions: new Set<Permission>(),
	permissionMap: new Map<string, Set<Permission>>(),

	setPermissions: (permissions: Permission[], roles: Role[]) => {
		const permissionSet = new Set<Permission>(permissions);
		const moduleMap = new Map<string, Set<Permission>>();

		for (const permission of permissions) {
			const [module] = permission.split(".");
			if (!moduleMap.has(module)) {
				moduleMap.set(module, new Set<Permission>());
			}
			moduleMap.get(module)?.add(permission);
		}

		set({
			roles,
			permissions: permissionSet,
			permissionMap: moduleMap,
		});
	},

	hasPermission: (permission: Permission) => {
		const { permissions } = get();
		return checkPermission(permissions, permission);
	},

	hasAnyPermission: (permissions: Permission[]) => {
		const { permissions: userPermissions } = get();
		return hasAnyPermission(permissions, userPermissions);
	},

	hasAllPermissions: (permissions: Permission[]) => {
		const { permissions: userPermissions } = get();
		return hasAllPermissions(permissions, userPermissions);
	},

	getModulePermissions: (module: string) => {
		const { permissions } = get();
		return getModulePermissions(permissions, module);
	},

	clearPermissions: () => {
		set({
			roles: [],
			permissions: new Set<Permission>(),
			permissionMap: new Map<string, Set<Permission>>(),
		});
	},
});

export const usePermissionStore = create<PermissionStore>(
	permissionStoreCreator,
);
