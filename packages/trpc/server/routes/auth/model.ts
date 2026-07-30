import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("name of the user"),
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});

export const SignInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const SignInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});

//m frontend par token nahi bolna chata m kyu btau m frontend use krra hun
export const getLoggedInUserInfoInputModel = z.undefined(); //humko koi bhi input nahi chahiye cookie khud aajati h

export const getLoggedInUserInfoOutputModel = z
  .object({
    id: z.string().describe("id of the user created"),
    email: z.email().describe("email of the user"),
    fullName: z.string().describe("name of the user"),
    profileImageUrl: z.string().describe("image of the user").optional().nullable(),
  })
  .nullable();

//no meaningful input. A POST with an empty body is parsed as {} by express.json,
//so accept an optional empty object rather than z.undefined() (which rejects {}).
export const logoutInputModel = z.object({}).optional();

export const logoutOutputModel = z.object({
  success: z.boolean().describe("whether the user was logged out"),
});
