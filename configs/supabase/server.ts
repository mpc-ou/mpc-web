import { getSession } from "@/utils/session";

export async function createClientSsr() {
  const session = await getSession();

  return {
    auth: {
      async getUser() {
        if (!session) {
          return { data: { user: null }, error: null };
        }

        const user = {
          id: session.id,
          email: session.email,
          user_metadata: {
            full_name: session.name
          }
        };

        return { data: { user }, error: null };
      },
      async signOut() {
        return { error: null };
      }
    }
  };
}
