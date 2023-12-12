import { validate } from 'bitcoin-address-validation';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	let { text } = params;

	if (validate(text)) throw redirect(307, `/address/${text}`);
	if (text.startsWith('6')) throw redirect(307, `/decrypt/${text}`);
	return { text };
}
