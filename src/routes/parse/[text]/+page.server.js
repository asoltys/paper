import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	let { text } = params;

	if (text.startsWith('1')) throw redirect(307, `/address/${text}`);
	return { text };
}
