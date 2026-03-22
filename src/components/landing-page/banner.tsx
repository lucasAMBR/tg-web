import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { ChevronRight, ChevronDown } from "lucide-react"; // Importe o ChevronDown

import { motion } from 'framer-motion';

export default function Banner() {
    const { theme } = useTheme();

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
            {/* Background Layer */}
            <div 
                className="absolute inset-0 z-0 
                           bg-[url('/images/Circuit_Board_(3).svg')] dark:bg-[url('/images/Circuit_Board_(2).svg')] 
                           bg-center bg-no-repeat bg-cover
                           opacity-6 dark:opacity-4"
                aria-hidden="true"
            />

            {/* Conteúdo Central */}
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 flex flex-col items-center justify-center gap-2"
            >
                <img src={theme === 'dark' ? `/images/dark_mode_logo.png` : `/images/light_mode_logo.png`} className='w-24' alt="Logo" />
                <h1 className="text-9xl font-[Anta] tracking-tight text-primary sm:text-6xl text-center">
                    Welcome to <span className="font-[Agbalumo]">Brew!</span>
                </h1>
                <h2 className="mb-6 text-xl font-[Anta] font-medium text-accent-foreground/70">
                    Built by devs, for devs
                </h2>
                <p className="max-w-prose dark:text-foreground/70 text-foreground/90 text-center text-lg font-medium">
                    Stop the endless back-and-forth. Our AI-powered recommendation engine 
                    analyzes technical stacks to bridge the gap between top talent and 
                    high-impact projects.
                </p>
                <div className="flex gap-3 mt-6">
                    <Button size={"lg"} variant={"secondary"} className="rounded-full text-lg">Our rules</Button>
                    <Button size={"lg"} className="rounded-full text-lg">Know more about the algorithm <ChevronRight /></Button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <ChevronDown className="size-12 text-primary" />
                </motion.div>
            </motion.div>
        </div>
    );
}