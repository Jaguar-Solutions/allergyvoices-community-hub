import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { currentUserIsAdmin } from "@/program/admin-api";

interface AdminSession {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
}

/**
 * Tracks the signed-in user and whether they hold the admin role.
 *
 * The role check is a convenience for the UI. The real enforcement is RLS —
 * a non-admin who forced their way past this gate would still see nothing.
 */
export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({
    loading: true,
    session: null,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    const resolve = async (session: Session | null) => {
      if (!session) {
        if (!cancelled) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const isAdmin = await currentUserIsAdmin();
      if (!cancelled) setState({ loading: false, session, isAdmin });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({ ...s, loading: true }));
      resolve(session);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
