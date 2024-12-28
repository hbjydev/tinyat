import { z } from "zod";

export type DID = `did:${string}`;

export function isDid(s: string): s is DID {
  return s.startsWith("did:");
}

export const didSchema = z.custom<DID>(
  data => isDid(data),
  { message: 'Invalid DID' },
);

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

export const getDidDoc = async (did: DID) => {
  let url = `https://plc.directory/${did}`;
  if (did.startsWith('did:web')) {
    url = `https://${did.split(':')[2]}/.well-known/did.json`;
  }

  const response = await fetch(url);

  return PlcDocument.parse(await response.json());
};

export const getPdsUrl = async (did: DID) => {
  const plc = await getDidDoc(did);

  return (
    plc.service.find((s) => s.type === "AtprotoPersonalDataServer")
      ?.serviceEndpoint ?? null
  );
};
