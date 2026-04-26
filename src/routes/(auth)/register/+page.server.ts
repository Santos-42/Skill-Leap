import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { hashPassword, generateUserId, createSessionToken } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		const formData = await request.formData();

		console.log("=== DIAGNOSTIK PRODUKSI ===");
		console.log("Platform object:", !!platform);
		console.log("Environment object:", !!platform?.env);
		console.log("Database D1 (DB):", !!platform?.env?.DB);

		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirm') as string;

		// Basic validation
		if (!name || !email || !password || !confirmPassword) {
			return fail(400, { error: 'All fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters long' });
		}

		const db = platform?.env.DB;
		if (!db) {
			return fail(500, { error: 'Database connection failed' });
		}

		try {
			// Check if email already exists
			const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
			if (existingUser) {
				return fail(400, { error: 'Email already registered' });
			}

			// Create new user
			const userId = generateUserId();
			const hashedPassword = await hashPassword(password);

			await db.prepare(
				'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)'
			)
				.bind(userId, name, email, hashedPassword)
				.run();

			// Set session cookie
			const sessionToken = createSessionToken(userId);
			cookies.set('session_token', sessionToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

		} catch (e) {
			console.error('Registration error:', e);
			return fail(500, { error: 'Registration failed. Please try again later.' });
		}

		throw redirect(303, '/dashboard');
	}
};
