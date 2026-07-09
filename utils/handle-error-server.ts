import type { ResponseType } from "@/types/response";
import { ErrorResponse, SuccessResponse } from "./response";
import { getSession } from "./session";

type HandleErrorServerType = {
  cb: ({ user }: { user?: any }) => Promise<any>;
};

function isInternalCancelError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || ("code" in error && (error as { code: number }).code === 20);
  }
  return false;
}

const handleErrorServerNoAuth = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const res = await cb({});
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (isInternalCancelError(error)) {
      throw error;
    }
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleErrorServerWithAuth = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const session = await getSession();

    if (!session) {
      return ErrorResponse({ message: "Unauthorized" });
    }

    const res = await cb({ user: session });
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (isInternalCancelError(error)) {
      throw error;
    }
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

export { handleErrorServerNoAuth, handleErrorServerWithAuth };
