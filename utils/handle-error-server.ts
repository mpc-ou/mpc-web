import type { ResponseType, SuccessResponseType } from "@/types/response";
import { ErrorResponse, SuccessResponse } from "./response";
import { getSession, type UserSession } from "./session";

type HandleErrorServerType<T> = {
  cb: ({ user }: { user?: UserSession }) => Promise<T>;
};

function isInternalCancelError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || ("code" in error && (error as { code: number }).code === 20);
  }
  return false;
}

const handleErrorServerNoAuth = async <T>({ cb }: HandleErrorServerType<T>): Promise<ResponseType> => {
  try {
    const res = await cb({});
    return SuccessResponse({ payload: res as SuccessResponseType["payload"] });
  } catch (error) {
    if (isInternalCancelError(error)) {
      throw error;
    }
    // Errors here get converted into a plain ErrorResponse, which callers
    // (e.g. a page component) commonly treat as "not found" and swallow into
    // a 404 — so without logging, real failures (DB timeouts, bad queries)
    // are invisible and look identical to a genuinely missing record.
    console.error("[handleErrorServerNoAuth]", error);
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleErrorServerWithAuth = async <T>({ cb }: HandleErrorServerType<T>): Promise<ResponseType> => {
  try {
    const session = await getSession();

    if (!session) {
      return ErrorResponse({ message: "Unauthorized" });
    }

    const res = await cb({ user: session });
    return SuccessResponse({ payload: res as SuccessResponseType["payload"] });
  } catch (error) {
    if (isInternalCancelError(error)) {
      throw error;
    }
    console.error("[handleErrorServerWithAuth]", error);
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

export { handleErrorServerNoAuth, handleErrorServerWithAuth };
