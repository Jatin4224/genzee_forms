import { trpc } from "~/trpc/client";

export const useGetFields = (formId: string) => {
  const {
    data: fields,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.formField.getFields.useQuery({ formId });

  return {
    fields,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.formField.createField.useMutation({
    onSuccess: async () => {
      //refetch the fields so the new one shows up
      await utils.formField.getFields.invalidate();
    },
  });

  return {
    createFieldAsync,
    createField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.formField.updateField.useMutation({
    onSuccess: async () => {
      await utils.formField.getFields.invalidate();
    },
  });

  return {
    updateFieldAsync,
    updateField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useDeleteField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.formField.deleteField.useMutation({
    onSuccess: async () => {
      await utils.formField.getFields.invalidate();
    },
  });

  return {
    deleteFieldAsync,
    deleteField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
