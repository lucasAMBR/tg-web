import { redirect } from "@tanstack/react-router";
import { getStoredToken } from "@/lib/auth";
import type { Permission } from "@/lib/permission";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissionStore } from "@/stores/permission-store";
import type { UserRole } from "@/types/AuthenticatedUser";

export type RoutePermissionsStaticData = {
	requiredPermission?: Permission;
	requiredPermissions?: Permission[];
	requireAll?: boolean;
};

export async function ensureAuthenticated(): Promise<void> {
	await useAuthStore.getState().initialize();

	if (!useAuthStore.getState().isAuthenticated) {
		throw redirect({ to: "/auth/login" });
	}
}

export async function ensureProfileCreated(): Promise<void> {
    await useAuthStore.getState().initialize();
    
    const { user, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !user) return;

    const role = user.role[0];
    
    const hasProfile = 
        (role === 'dev' && user.dev_profile) || 
        (role === 'company' && user.company_profile) ||
        (role === 'client' && user.client_profile);

    if (!hasProfile) {
        if(role === 'dev'){
            throw redirect({ to: `/create/profile/dev` });
        }
        if(role === 'company'){
            throw redirect({ to: `/create/profile/company` });
        }
        if(role === 'client'){
            throw redirect({ to: `/create/profile/client` });
        }
    }
}

export async function redirectIfAuthenticated(): Promise<void> {
	const token = getStoredToken();
	if (!token) return;

	await useAuthStore.getState().initialize();

    const { user, isAuthenticated } = useAuthStore.getState();

	if (isAuthenticated && user) {
       const role = user.role[0] as UserRole;
    
        const hasProfile = 
            (role === 'dev' && user.dev_profile) || 
            (role === 'company' && user.company_profile) ||
            (role === 'client' && user.client_profile);

        if (!hasProfile) {
            throw redirect({ to: `/create/profile/${role}` });
        }

        const homeRoutes: Record<UserRole, string> = {
            dev: "/dashboard/developer",
            company: "/dashboard/company",
            client: "/dashboard/client",
        };

        throw redirect({ to: homeRoutes[role] || "/dashboard" });
	}
}

export function ensureRoutePermissions(
	staticData: RoutePermissionsStaticData | undefined,
): void {
	if (!staticData) return;

	const {
		requiredPermission,
		requiredPermissions,
		requireAll = false,
	} = staticData;
	const permissionStore = usePermissionStore.getState();

	if (requiredPermission) {
		const hasPermission = permissionStore.hasPermission(requiredPermission);
		if (hasPermission) {
			return;
		}
	}

	if (requiredPermissions && requiredPermissions.length > 0) {
		const hasPermissions = requireAll
			? permissionStore.hasAllPermissions(requiredPermissions)
			: permissionStore.hasAnyPermission(requiredPermissions);

		if (hasPermissions) {
			return;
		}
	}

	if (
		requiredPermission ||
		(requiredPermissions && requiredPermissions.length > 0)
	) {
		throw redirect({ to: "/" });
	}
}