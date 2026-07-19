import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/workspace";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await ensureDefaultWorkspace(supabase);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=callback_failed", url.origin));
}

async function ensureDefaultWorkspace(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { count } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true });

  if (count === 0) {
    await supabase
      .from("workspaces")
      .insert({ user_id: user.id, name: "First workspace" });
  }
}
