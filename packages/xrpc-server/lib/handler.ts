import { z, ZodSchema, type ZodTypeAny } from "zod";
import type { ValidNsid } from "./utils.js";
import { XRPCError } from "./error.js";

export type XRPCHandler<TIn = {}, TOut = void> = (
  context: {
    input: TIn,
    req: Request,
  }
) => Promise<TOut> | TOut;

export type XRPCHandlerConfig<TIn = {}, TOut = void> = {
  input: ZodSchema;
  output: ZodSchema;
  handler: XRPCHandler<TIn, TOut>;
};

export const handlers: Record<string, XRPCHandlerConfig> = {};

export const defineHandler = <Input extends ZodTypeAny, Output extends ZodTypeAny>(
  nsid: ValidNsid,
  params: {
    input: Input;
    output: Output;
  },
  handler: XRPCHandler<z.infer<Input>, z.infer<Output>>,
) => {
  handlers[nsid] = {
    input: params.input,
    output: params.output,
    handler,
  };
};

export const handle = async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const nsid = parts[parts.length - 1];

  const hc = handlers[nsid];
  if (!hc) {
    return Response.json({
      error: 'NOT_FOUND',
      message: 'That query or procedure is not implemented on this server.',
    }, { status: 404 });
  }

  try {
    let inputRaw = Object.fromEntries(url.searchParams);
    if (req.method === 'POST') inputRaw = await req.json();

    const reqData = hc.input.safeParse(inputRaw);
    if (!reqData.success) {
      if (reqData.error) {
        throw new XRPCError(
          `Body failed validation check: ${reqData.error.message}`,
          "INPUT_INVALID",
          400,
        );
      }

      throw new XRPCError(
        `Body failed validation check.`,
        "INPUT_INVALID",
        400,
      );
    }

    const res = await hc.handler({
      input: reqData.data,
      req: req,
    });

    const resData = hc.output.safeParse(res);
    if (!resData.success) {
      if (resData.error) {
        throw new XRPCError(
          `Body failed validation check: ${resData.error.message}`,
          "INPUT_INVALID",
          400,
        );
      }

      throw new XRPCError(
        `Body failed validation check.`,
        "INPUT_INVALID",
        400,
      );
    }

    return Response.json(resData.data);
  } catch (err) {
    if (err instanceof XRPCError) {
      if (err.log) console.error("Caught XRPC Error:", err);
      return Response.json(
        {
          message: err.message,
          error: err.code,
        },
        { status: err.status },
      );
    }

    console.error("Caught unknown error:", err);
    return Response.json(
      {
        message: "An error occurred server-side that interrupted this request.",
        error: "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
};
