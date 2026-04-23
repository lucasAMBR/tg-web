import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	useEffect(() => {}, []);

	const handleThemeToggle = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
	};

	return (
		<Button
			className="fixed bottom-0 right-0 m-5 z-100"
			variant={"outline"}
			onClick={handleThemeToggle}
		>
			{theme === "light" ? <Moon /> : <Sun />}
		</Button>
	);
};

export default ThemeToggle;
