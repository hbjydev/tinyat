import type { Procedures, Queries } from '@atcute/client/lexicons';

export type ValidNsid = keyof Queries | keyof Procedures;
