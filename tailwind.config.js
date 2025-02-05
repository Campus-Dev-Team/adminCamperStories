/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{html,js,jsx}",
	],
	theme: {
    	extend: {
    		animation: {
    			shimmer: 'shimmer 1.5s infinite linear'
    		},
    		keyframes: {
    			shimmer: {
    				'0%': {
    					backgroundPosition: '-200% 0'
    				},
    				'100%': {
    					backgroundPosition: '200% 0'
    				}
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			color1: 'var(--color1)',
    			color2: 'var(--color2)',
    			color2hover: 'var(--color2-hover)',
    			color3: 'var(--color3)',
    			color4: 'var(--color4)',
    			'color4-hover': 'var(--color4-hover)',
    			'main-background-color': 'var(--main-background-color)',
    			'main-text-color': 'var(--main-text-color)',
    			'swiper-bullet-bg': 'var(--swiper-bullet-bg)',
    			'swiper-bullet-hover-bg': 'var(--swiper-bullet-hover-bg)'
    		},
    		fontFamily: {
    			firma: [
    				'firma',
    				'sans-serif'
    			],
    			poppins: [
    				'Poppins',
    				'sans-serif'
    			]
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
