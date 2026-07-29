import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      toast.success("Form created");
      //refetch the list so the newly created form shows up
      await utils.form.listForms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not create form");
    },
  });

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useListForms = () => {
  const {
    data: forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.listForms.useQuery();

  return {
    forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFormAsync,
    mutate: updateForm,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.form.updateForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not update form");
    },
  });

  return {
    updateFormAsync,
    updateForm,
    error,
    isError,
    isSuccess,
    status,
  };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFormAsync,
    mutate: deleteForm,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      toast.success("Form deleted");
      await utils.form.listForms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Could not delete form");
    },
  });

  return {
    deleteFormAsync,
    deleteForm,
    error,
    isError,
    isSuccess,
    status,
  };
};

export const useDashboardStats = () => {
  const {
    data: stats,
    error,
    isLoading,
    status,
  } = trpc.form.getDashboardStats.useQuery();

  return {
    stats,
    error,
    isLoading,
    status,
  };
};

export const useGetFormMeta = (formId: string) => {
  const {
    data: form,
    error,
    isLoading,
    status,
  } = trpc.form.getFormMeta.useQuery({ formId });

  return {
    form,
    error,
    isLoading,
    status,
  };
};

export const useGetForm = (formId: string) => {
  const {
    data: form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getForm.useQuery({ formId });

  return {
    form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};
