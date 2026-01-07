/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#D4AF37', // Metallic Gold
                secondary: '#AA8C2C', // Darker Gold
                dark: '#111111', // Rich Black
                light: '#F5F5F5', // Off-white
                'dark-bg': '#0a0a0a', // Almost black background
                'card-bg': '#161616', // Slightly lighter for cards
            },
            fontFamily: {
                sans: ['Open Sans', 'sans-serif'],
                heading: ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
