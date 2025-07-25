import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET() {
	const debug = env.DEBUG === 'true';
	return json({ debug });
}
