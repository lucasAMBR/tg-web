export type Role = string;

export type Permission = string;

/**
 * Converte o `user_type` vindo da API em um `Role` interno.
 * Por padrão, apenas repassa a string, permitindo que a API
 * controle os valores possíveis.
 */
export function mapUserTypeToRole(userType: string): Role {
	return userType;
}

/**
 * Verifica se o usuário possui uma permissão específica.
 */
export function checkPermission(
	permissions: Set<Permission>,
	permission: Permission,
): boolean {
	return permissions.has(permission);
}

/**
 * Verifica se o usuário possui pelo menos uma das permissões exigidas.
 */
export function hasAnyPermission(
	required: Permission[],
	userPermissions: Set<Permission>,
): boolean {
	if (required.length === 0) return true;
	for (const permission of required) {
		if (userPermissions.has(permission)) {
			return true;
		}
	}
	return false;
}

/**
 * Verifica se o usuário possui todas as permissões exigidas.
 */
export function hasAllPermissions(
	required: Permission[],
	userPermissions: Set<Permission>,
): boolean {
	for (const permission of required) {
		if (!userPermissions.has(permission)) {
			return false;
		}
	}
	return true;
}

/**
 * Retorna todas as permissões de um determinado módulo.
 * Exemplo: módulo "users" casa com permissões "users.create", "users.edit", etc.
 */
export function getModulePermissions(
	permissions: Set<Permission>,
	module: string,
): Set<Permission> {
	const result = new Set<Permission>();
	const prefix = `${module}.`;
	for (const permission of permissions) {
		if (permission.startsWith(prefix)) {
			result.add(permission);
		}
	}
	return result;
}
