/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{html,js,jsx}",
	],
	theme: {
		extend: {
			animation: {
				'shimmer': 'shimmer 1.5s infinite linear',
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			colors: {
				color1: 'var(--color1)', // Color principal (blanco)
				color2: 'var(--color2)', // Color secundario (amarillo/anaranjado)
				color2hover: 'var(--color2-hover)',
				color3: 'var(--color3)', // Color terciario (fondo oscuro)
				color4: 'var(--color4)', // Color azul base
				'color4-hover': 'var(--color4-hover)', // Hover del azul
				'main-background-color': 'var(--main-background-color)', // Fondo principal
				'main-text-color': 'var(--main-text-color)', // Color del texto principal

				// Swiper Bullets
				'swiper-bullet-bg': 'var(--swiper-bullet-bg)', // Color base de las balas
				'swiper-bullet-hover-bg': 'var(--swiper-bullet-hover-bg)', // Color al pasar el mouse
			},
			fontFamily: {
				firma: ['firma', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
