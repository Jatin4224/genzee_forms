import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const utils = trpc.useUtils(); ///trpc m aata h

  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      toast.success("Account created");
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not create account");
    },
  });

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSignin = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not sign in");
    },
  });

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery();

  return {
    user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useSignout = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: logoutAsync,
    mutate: logout,
    isError,
    isSuccess,
    status,
  } = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      //clear the cached user so the app knows we're logged out
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not log out");
    },
  });

  return {
    logoutAsync,
    logout,
    isError,
    isSuccess,
    status,
  };
};
