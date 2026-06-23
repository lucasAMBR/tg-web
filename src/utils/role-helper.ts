import type { AuthenticatedUser, UserRole } from "@/types/AuthenticatedUser";

export const getRole = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	return user.role[0] as UserRole;
}

export const getNameFromProfile = (user: AuthenticatedUser | null) => {
	if (user === null) {
		// #region agent log
		fetch('http://127.0.0.1:7709/ingest/6f6f8fe5-a806-45bf-83a1-1de251fbb200',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'351e2d'},body:JSON.stringify({sessionId:'351e2d',runId:'pre-fix',hypothesisId:'H3',location:'role-helper.ts:getNameFromProfile',message:'user is null',data:{},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		return;
	}

	const role = user.role[0] as UserRole;

	let result: string | undefined;
	if (role === "dev") result = user.dev_profile?.name;
	else if (role === "company") result = user.company_profile?.name;
	else if (role === "client") result = user.client_profile?.name;
	else if (role === "admin") result = user.admin_profile?.name;

	// #region agent log
	fetch('http://127.0.0.1:7709/ingest/6f6f8fe5-a806-45bf-83a1-1de251fbb200',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'351e2d'},body:JSON.stringify({sessionId:'351e2d',runId:'pre-fix',hypothesisId:'H2-H3',location:'role-helper.ts:getNameFromProfile',message:'name resolution',data:{role,hasAdminProfile:!!user.admin_profile,adminProfileName:user.admin_profile?.name??null,result:result??null},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	return result;
};

export const getRoleLabel = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return "role.dev";
	if (role === "company") return "role.company";
	if (role === "client") return "role.client";
	if (role === "admin") return "role.admin";
};

export const getProfileBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio;
	if (role === "company") return user.company_profile?.bio;
	if (role === "client") return user.client_profile?.bio;
};

export const getProfilePortugueseBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio_pt;
	if (role === "company") return user.company_profile?.bio_pt;
	if (role === "client") return user.client_profile?.bio_pt;
};

export const getProfileEnglishBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio_en;
	if (role === "company") return user.company_profile?.bio_en;
	if (role === "client") return user.client_profile?.bio_en;
};

export const getProfileScore = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.score;
	if (role === "company") return user.company_profile?.score;
	if (role === "client") return user.client_profile?.score;
};

export const getUserMainRole = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	return role;
};
