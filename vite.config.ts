import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			// '/api': {
			// 	target: 'https://localhost:7231',
			// 	changeOrigin: true,
			// 	secure: false  // bỏ qua SSL tự ký của localhost
			// },
			'/hubs': {
				target: 'https://localhost:7231',
				ws: true,        // WebSocket
				changeOrigin: true,
				secure: false
			}
		}
	}});


