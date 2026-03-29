import type { AuthenticatedUser, UserRole } from "@/types/AuthenticatedUser";

export const getSenioritySoftSkillLimit= (user: AuthenticatedUser | null) => {
    if(user === null) return;
    
    const role = user.role[0] as UserRole;

    if(role !== "dev") return;

    if(user.dev_profile?.seniority_level === undefined) return; 
    
    if(user.dev_profile.seniority_level === "Intern") return 15;
    if(user.dev_profile.seniority_level === "Junior") return 25;
    if(user.dev_profile.seniority_level === "Mid Level") return 35;
    if(user.dev_profile.seniority_level === "Senior") return 45;
    if(user.dev_profile.seniority_level === "Staff") return 50;
}