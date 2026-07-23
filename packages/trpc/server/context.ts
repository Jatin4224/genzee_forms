import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clearCookieFactory, createCookieFactory, getCookieFactory } from "./utils/cookie";
//custom type
export interface TRPCContext {
  //m tumhe createCookie naam ka function dunga jiska type hoga jo bhi createfactory return krega uska type
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
}
export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  const ctx: TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
  };

  return ctx;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
