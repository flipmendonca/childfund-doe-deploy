
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Montserrat', 'sans-serif'],
				'montserrat': ['Montserrat', 'sans-serif'],
				'roboto-slab': ['"Roboto Slab"', 'serif'],
			},
			fontWeight: {
				'light': '300',
				'regular': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#007A45',
					hover: '#005A33',
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#FBB21D',
					hover: '#E09D1A',
					foreground: '#333333',
				},
				accent: {
					DEFAULT: '#FE7130',
					hover: '#E55A1E',
					foreground: '#FFFFFF',
				},
				success: {
					DEFAULT: '#3CC387',
					hover: '#2BAA72',
					foreground: '#FFFFFF',
				},
				// ChildFund color palette with new light versions
				'childfund-green': '#007A45',
				'childfund-green-light': '#E8F5EF',
				'childfund-yellow': '#FBB21D',
				'childfund-orange': '#FE7130',
				'childfund-orange-light': '#FFF4E6',
				'childfund-light-green': '#3CC387',
				'childfund-blue': '#1E40AF',
				'childfund-soft-white': '#F6F3EF',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'count-up': {
					'0%': {
						'counter-increment': '0',
					},
					'100%': {
						'counter-increment': '100',
					}
				},
				'pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.8'
					}
				},
				'confetti': {
					'0%': {
						transform: 'translateY(0) rotate(0)',
						opacity: '0',
					},
					'10%': {
						opacity: '1',
					},
					'100%': {
						transform: 'translateY(200px) rotate(720deg)',
						opacity: '0',
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'brush-stroke': {
					'0%': {
						'stroke-dasharray': '0 100',
					},
					'100%': {
						'stroke-dasharray': '100 0',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'count-up': 'count-up 0.6s ease-out forwards',
				'pulse-slow': 'pulse 2s ease-in-out infinite',
				'confetti': 'confetti 3s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out',
				'brush-stroke': 'brush-stroke 1.5s ease-out forwards'
			},
			backgroundImage: {
				'circular-pattern': `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='pattern' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3ccircle cx='10' cy='10' r='2' fill='%23007A45' fill-opacity='0.1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23pattern)'/%3e%3c/svg%3e")`,
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
