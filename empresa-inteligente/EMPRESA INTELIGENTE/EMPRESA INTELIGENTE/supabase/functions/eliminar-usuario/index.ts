import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método no permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "La función no tiene configuradas las credenciales de Supabase." }, 500);
    }

    if (!authorization) {
      return json({ error: "No se encontró una sesión válida." }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: "La sesión expiró. Inicia sesión nuevamente." }, 401);
    }

    const { data: caller } = await adminClient
      .from("usuarios")
      .select("id, rol")
      .or(`auth_user_id.eq.${authData.user.id},email.eq.${authData.user.email ?? ""}`)
      .maybeSingle();

    const callerRole = String(caller?.rol ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (!caller || !callerRole.includes("admin")) {
      return json({ error: "Solo un administrador puede eliminar usuarios." }, 403);
    }

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return json({ error: "El identificador del usuario no es válido." }, 400);
    }

    const { data: target, error: targetError } = await adminClient
      .from("usuarios")
      .select("id, auth_user_id")
      .eq("id", id)
      .maybeSingle();

    if (targetError) return json({ error: targetError.message }, 500);
    if (!target) return json({ error: "El usuario ya no existe." }, 404);
    if (target.auth_user_id === authData.user.id) {
      return json({ error: "No puedes eliminar tu propia cuenta mientras está activa." }, 400);
    }

    if (target.auth_user_id) {
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
        target.auth_user_id
      );
      if (deleteAuthError) {
        return json({ error: "No se pudo eliminar la cuenta de acceso: " + deleteAuthError.message }, 500);
      }
    }

    const { error: deleteProfileError } = await adminClient
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (deleteProfileError) {
      return json({ error: "No se pudo eliminar el registro: " + deleteProfileError.message }, 500);
    }

    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json(
      { error: error instanceof Error ? error.message : "Error interno al eliminar el usuario." },
      500
    );
  }
});
