//function 1 - yh function aysa function return karega jisse mere
//procedures cookie ko return kar sakte hain.
import type { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const ONE_MINUTE = 60 * 1000; //milliseconds
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

const defaultCookieOptions: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  maxAge: ONE_YEAR,
};

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    //yh defualt opts khud bnaya huaa h jo cookie m pass kar sakte hain
    opts: CookieOptions = defaultCookieOptions,
  ) {
    res.cookie(name, value, opts);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies?.[name];
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string) {
    return res.clearCookie(name);
  };
}

//authentication cookie
const AUTHENTICATION_COOKIE_NAME = "authentication-token";

export function setAuthenticationCookie(ctx: TRPCContext, accessToken: string) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken);
}

export function getAuthenticationCookie(ctx: TRPCContext, accessToken: string) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function clearAuthenticationCookie(ctx: TRPCContext, accessToken: string) {
  ctx.clearCookie(AUTHENTICATION_COOKIE_NAME);
}
