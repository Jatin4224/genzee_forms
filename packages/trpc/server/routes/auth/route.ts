import { publicProcedure, router } from "../../trpc";
import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  SignInUserWithEmailAndPasswordInputModel,
  SignInUserWithEmailAndPasswordOutputModel,
} from "./model";
import { setAuthenticationCookie } from "../../utils/cookie";
import { signInUserWithEmailAndPasswordInput } from "@repo/services/user/model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;

      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });
      //cookie set
      setAuthenticationCookie(ctx, token);
      return {
        id,
      };
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(SignInUserWithEmailAndPasswordInputModel)
    .output(SignInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const { id, token } = await userService.signinUserWithEmailAndPassword({
        email,
        password,
      });

      setAuthenticationCookie(ctx, token);
      return {
        id,
      };
    }),
});
