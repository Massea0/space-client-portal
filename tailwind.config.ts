import type { Config } from "tailwindcss";
import animate from 'tailwindcss-animate';

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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// === TWENTY-INSPIRED NEUTRAL SCALE ===
				neutral: {
					0: 'hsl(var(--gray-0))',
					5: 'hsl(var(--gray-5))',
					10: 'hsl(var(--gray-10))',
					15: 'hsl(var(--gray-15))',
					20: 'hsl(var(--gray-20))',
					25: 'hsl(var(--gray-25))',
					30: 'hsl(var(--gray-30))',
					40: 'hsl(var(--gray-40))',
					50: 'hsl(var(--gray-50))',
					60: 'hsl(var(--gray-60))',
					70: 'hsl(var(--gray-70))',
					80: 'hsl(var(--gray-80))',
					90: 'hsl(var(--gray-90))'
				},
				// === ARCADIS REFINED PALETTE ===
				arcadis: {
					blue: 'hsl(var(--arcadis-blue))',
					'blue-light': 'hsl(var(--arcadis-blue-light))',
					'blue-dark': 'hsl(var(--arcadis-blue-dark))',
					'blue-subtle': 'hsl(var(--arcadis-blue-subtle))',
					green: 'hsl(var(--arcadis-green))',
					'green-subtle': 'hsl(var(--arcadis-green-subtle))',
					orange: 'hsl(var(--arcadis-orange))',
					'orange-subtle': 'hsl(var(--arcadis-orange-subtle))',
					red: 'hsl(var(--arcadis-red))',
					'red-subtle': 'hsl(var(--arcadis-red-subtle))'
				}
			},
			// === TYPOGRAPHY TWENTY-INSPIRED ===
			fontFamily: {
				sans: 'var(--font-family-sans)',
				mono: 'var(--font-family-mono)'
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }]
			},
			// === SPACING SYSTEM ===
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem'
			},
			// === SHADOWS TWENTY-INSPIRED ===
			boxShadow: {
				'xs': 'var(--shadow-xs)',
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'focus': 'var(--focus-ring)',
				'none': 'none'
			},
			// === TRANSITIONS ===
			transitionDuration: {
				'fast': 'var(--animation-duration-fast)',
				'normal': 'var(--animation-duration-normal)',
				'slow': 'var(--animation-duration-slow)'
			},
			transitionTimingFunction: {
				'ease-smooth': 'var(--animation-easing)',
				'ease-bounce': 'var(--animation-easing-bounce)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-smooth',
				'slide-in': 'slide-in 0.3s ease-smooth',
				'slide-up': 'slide-up 0.2s ease-smooth',
				'scale-in': 'scale-in 0.2s ease-smooth',
				'shimmer': 'shimmer 2s ease-in-out infinite'
			},
			backgroundImage: {
				'arcadis-gradient': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)',
				'arcadis-gradient-subtle': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
			}
		}
	},
	plugins: [animate],
} satisfies Config;
