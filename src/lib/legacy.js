import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import {
	concatUint8Arrays,
	hexToUint8Array,
	uint8ArrayToHex,
} from "uint8array-extras";

// btc-signer only signs with compressed pubkeys, so spending from
// uncompressed p2pkh (bitaddress-era wallets) needs a manual legacy signer

const SIGHASH_ALL = 1;

const hash256 = (b) => sha256(sha256(b));

const le = (n, bytes) => {
	const r = new Uint8Array(bytes);
	let v = BigInt(n);
	for (let i = 0; i < bytes; i++) {
		r[i] = Number(v & 0xffn);
		v >>= 8n;
	}
	return r;
};

const varint = (n) => {
	if (n < 0xfd) return new Uint8Array([n]);
	if (n <= 0xffff) return concatUint8Arrays([new Uint8Array([0xfd]), le(n, 2)]);
	return concatUint8Arrays([new Uint8Array([0xfe]), le(n, 4)]);
};

const push = (data) => {
	if (data.length >= 0x4c) throw new Error("push too large");
	return concatUint8Arrays([new Uint8Array([data.length]), data]);
};

// inputs: [{ txid (display-order hex), vout, scriptPubKey, sequence }]
// outputs: [{ script, amount (bigint) }]
const serialize = (inputs, outputs, scriptFor, version, locktime) =>
	concatUint8Arrays([
		le(version, 4),
		varint(inputs.length),
		...inputs.map((inp, i) => {
			const script = scriptFor(i);
			return concatUint8Arrays([
				hexToUint8Array(inp.txid).reverse(),
				le(inp.vout, 4),
				varint(script.length),
				script,
				le(inp.sequence, 4),
			]);
		}),
		varint(outputs.length),
		...outputs.map((o) =>
			concatUint8Arrays([le(o.amount, 8), varint(o.script.length), o.script]),
		),
		le(locktime, 4),
	]);

export const signUncompressed = ({
	privateKey,
	inputs,
	outputs,
	version = 2,
	locktime = 0,
}) => {
	const pubkey = secp256k1.getPublicKey(privateKey, false);
	const empty = new Uint8Array();
	const scriptSigs = inputs.map((inp, i) => {
		const preimage = concatUint8Arrays([
			serialize(
				inputs,
				outputs,
				(j) => (j === i ? inp.scriptPubKey : empty),
				version,
				locktime,
			),
			le(SIGHASH_ALL, 4),
		]);
		const sig = secp256k1
			.sign(hash256(preimage), privateKey, { lowS: true })
			.toDERRawBytes();
		return concatUint8Arrays([
			push(concatUint8Arrays([sig, new Uint8Array([SIGHASH_ALL])])),
			push(pubkey),
		]);
	});
	return uint8ArrayToHex(
		serialize(inputs, outputs, (i) => scriptSigs[i], version, locktime),
	);
};
