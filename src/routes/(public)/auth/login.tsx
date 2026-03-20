import ThemeToggle from '@/components/global/theme-toggle-button';
import { SingInForm } from '@/components/login/sing-in-form';
import { Button } from '@/components/ui/button';
import { redirectIfAuthenticated } from '@/utils/route-guards';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Route = createFileRoute('/(public)/auth/login')({
	component: Login,
    beforeLoad: async() => {
        await redirectIfAuthenticated();
    }
});

function Login() {
    const { theme } = useTheme();

    const navigate = useNavigate();

    return (
        <div className='w-screen h-screen flex'>
            <div className='flex-1 relative m-4 flex flex-col items-center justify-center'>
                <Button variant={"ghost"} className="absolute rounded-full top-0 left-0" onClick={() => navigate({to: "/"})}><ChevronLeft /> Back</Button>
                <img src={theme === 'dark' ? `/images/dark_mode_logo.png` : `/images/light_mode_logo.png`} className='mb-4 w-20' alt="Logo" />
                <SingInForm />
            </div>
            <div className= "flex-2 bg-[url('/images/cafe_bg_solid_v2.png')] bg-cover bg-center brightness-70">
                <div className='w-full h-full'>

                </div>
            </div>
            <ThemeToggle /> 
        </div>
    );
}
