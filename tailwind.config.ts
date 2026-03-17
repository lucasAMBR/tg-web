/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class', // Isso permite que o next-themes controle o tema
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {},
	},
	plugins: [],
};