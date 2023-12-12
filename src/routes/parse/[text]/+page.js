import { validate } from 'bitcoin-address-validation';
import { redirect } from '@sveltejs/kit';
import wif from 'wif';

export async function load({ params }) {
	let { text } = params;

	if (validate(text)) throw redirect(307, `/address/${text}`);
	if (text.startsWith('6')) throw redirect(307, `/decrypt/${text}`);

	let isKey = false;
	try {
		wif.decode(text);
		isKey = true;
	} catch (e) {}
    if (isKey) throw redirect(307, `/key/${text}`);

	return { text };
}
