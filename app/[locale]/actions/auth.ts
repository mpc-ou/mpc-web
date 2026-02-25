"use server";

import type { Provider } from "@supabase/supabase-js";
import { createClientSsr } from "@/configs/supabase/server";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

export const signInWithPassword = async ({ email, password }: { email: string; password: string }) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const supabase = await createClientSsr();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw new Error(error.message);
      return data;
    }
  });

export const updatePassword = async (password: string) =>
  handleErrorServerWithAuth({
    cb: async () => {
      const supabase = await createClientSsr();
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      return data;
    }
  });

export const signInWithOAuth = async (provider: Provider, redirectTo: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const supabase = await createClientSsr();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) throw new Error(error.message);
      return data;
    }
  });

export const linkGithubIdentity = async (redirectTo: string) =>
  handleErrorServerWithAuth({
    cb: async () => {
      const supabase = await createClientSsr();
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "github",
        options: { redirectTo }
      });
      if (error) throw new Error(error.message);
      return data;
    }
  });

export const unlinkGithubIdentity = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const supabase = await createClientSsr();
      if (!user) throw new Error("Unauthorized");
      
      const githubIdentity = user.identities?.find((id) => id.provider === "github");
      if (!githubIdentity) throw new Error("GitHub identity not found");

      const { data, error } = await supabase.auth.unlinkIdentity(githubIdentity);
      if (error) throw new Error(error.message);
      return data;
    }
  });
