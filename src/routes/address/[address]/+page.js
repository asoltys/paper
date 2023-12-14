import { address } from '$lib';
export async function load({ params: { address: a } }) {
	address.set(a);
}
