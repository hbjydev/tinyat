import { z } from 'zod';
import { didSchema } from './did.js';

const DOH_URL = 'https://cloudflare-dns.com/dns-query';

const DnsQueryResponse = z.object({
	Answer: z.array(
		z.object({
			name: z.string(),
			type: z.number(),
			TTL: z.number(),
			data: z.string(),
		}),
	),
});

const resolveDns = async (handle: string) => {
	const url = new URL(DOH_URL);
	url.searchParams.set('type', 'TXT');
	url.searchParams.set('name', `_atproto.${handle}`);

	const response = await fetch(url, {
		headers: { Accept: 'application/dns-json' },
	});

	const { Answer } = DnsQueryResponse.parse(await response.json());

	// Answer[0].data is "\"did=...\"" (with quotes)
	const val = Answer[0]?.data
		? JSON.parse(Answer[0]?.data).split('did=')[1]
		: null;

	return val ? didSchema.parse(val) : null;
};

const resolveHttp = async (handle: string) => {
	try {
		const url = new URL(`https://${handle}/.well-known/atproto-did`);
		const res = await fetch(url);
		if (!res.ok) return null;
		return didSchema.parse(await res.text());
	} catch (_e) {
		return null;
	}
};

/**
 * Resolves a DID from a handle using either DNS or HTTP, or null if no DID
 * was found for the provided handle.
 *
 * Cloudflare DNS over HTTP (DoH) is used to perform the DNS lookup.
 */
export const resolveHandle = async (handle: string) => {
	const [dnsDid, httpDid] = await Promise.all([
		resolveDns(handle).catch(() => {}),
		resolveHttp(handle).catch(() => {}),
	]);

	if (dnsDid && httpDid && dnsDid !== httpDid) return null;

	if (dnsDid) return dnsDid;
	if (httpDid) return httpDid;

	return null;
};
