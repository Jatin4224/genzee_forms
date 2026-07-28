import { trpc } from "~/trpc/client";

export const useSubmitForm = () => {
  const {
    mutateAsync: submitFormAsync,
    mutate: submitForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.formSubmission.submitForm.useMutation();

  return {
    submitFormAsync,
    submitForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useListSubmissions = (formId: string) => {
  const {
    data: submissions,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.formSubmission.listSubmissions.useQuery({ formId });

  return {
    submissions,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};
