import { getSession } from "@/utils/session";

export async function createClientSsr() {
  const session = await getSession();

  return {
    auth: {
      getUser() {
        if (!session) {
          return Promise.resolve({ data: { user: null }, error: null });
        }

        const user = {
          id: session.id,
          email: session.email,
          user_metadata: {
            full_name: session.name
          }
        };

        return Promise.resolve({ data: { user }, error: null });
      },
      signOut() {
        return Promise.resolve({ error: null });
      }
    }
  };
}
