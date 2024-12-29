import { z } from 'zod';

export type DID = `did:${string}`;

/**
 * Returns true if the provided string is a DID.
 */
export const isDid = (s: string): s is DID => {
	return s.startsWith('did:');
};

/**
 * A simple Zod schema for DIDs
 */
export const didSchema = z.custom<DID>((data) => isDid(data), {
	message: 'Invalid DID',
});

const PlcDocument = z.object({
	id: z.string(),
	alsoKnownAs: z.array(z.string()),
	service: z.array(
		z.object({
			id: z.string(),
			type: z.string(),
			serviceEndpoint: z.string(),
		}),
	),
});

/**
 * Returns the DID configuration blob given a valid DID.
 *
 * @example
 * const didDoc = await getDidDoc('did:web:hayden.moe');
 */
export const getDidDoc = async (did: DID) => {
	const [_, type, ...id] = did.split(':');

	let url;
	switch (type) {
		case 'plc':
			url = `https://plc.directory/${did}`;
			break;
		case 'web':
			url = `https://${id.join(':')}/.well-known/did.json`;
			break;
		default:
			throw new Error('Invalid DID type.');
	}

	const response = await fetch(url);

	return PlcDocument.parse(await response.json());
};

/**
 * Returns the URL of a PDS given a user's DID.
 *
 * @example
 * const pdsUrl = await getPdsUrl('did:web:hayden.moe');
 */
export const getPdsUrl = async (did: DID) => {
	// Get the DID document from the DID.
	const didDoc = await getDidDoc(did);

	// Get the PDS service from the DID document.
	const svc = didDoc.service.find(
		(svc) => svc.type === 'AtprotoPersonalDataServer',
	);

	// Return the service endpoint if this DID specifies a PDS, otherwise return
	// null.
	if (svc) return svc.serviceEndpoint;
	return null;
};
