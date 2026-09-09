import { useToast } from "@/hooks/use-toast";
import type { ResponseType, SuccessResponseType } from "@/types/response";

type HandleErrorType = {
  cb: () => Promise<ResponseType>;
  onSuccess?: ({ data }: { data: SuccessResponseType }) => void;
  withSuccessNotify?: boolean;
};

const useHandleError = () => {
  const { toast } = useToast();

  const handleErrorClient = async ({
    cb,
    onSuccess = () => {
      /* no-op */
    },
    withSuccessNotify = true
  }: HandleErrorType) => {
    try {
      const { error, data } = await cb();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (withSuccessNotify) {
        toast({
          title: "Success",
          description: "Action completed successfully."
        });
      }

      onSuccess({ data: data ?? {} });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Unknown error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }
  };

  return { handleErrorClient, toast };
};

export { useHandleError };
