import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	useEffect(() => {

	}, []);

	const handleThemeToggle = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
	};

	return (
		<Button onClick={handleThemeToggle} className='w-10 h-10'>
			{theme === 'light' ? <Moon /> : <Sun />}
		</Button>
	);
};

export default ThemeToggle;
