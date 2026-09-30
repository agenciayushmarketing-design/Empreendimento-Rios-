"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { carregarContextoAcesso } from "@/lib/services/acesso";
import { createAdminClient, temChaveSecreta } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { lerUsuario, primeiroErro, senhaSchema, usuarioEdicaoSchema, usuarioSchema } from "@/lib/validacao/usuario";

export type EstadoFormulario = { erro?: string };

async function exigirAdmin() {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");
  return ctx;
}

function revalidar() {
  revalidatePath("/equipe");
}

// Papel: is_admin() olha se existe linha 'admin' em user_roles. Mantemos uma linha so por usuario.
async function definirPapel(supabase: ReturnType<typeof createClient>, userId: string, role: "admin" | "member") {
  const { error: eDel } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (eDel) return eDel.message;
  const { error: eIns } = await supabase.from("user_roles").insert({ user_id: userId, role });
  return eIns?.message ?? null;
}

// Permissoes e unidades pela funcao do banco (ela recusa editar admin e a si mesmo; para admin
// as permissoes nao importam, entao limpamos direto).
async function definirAcessos(
  supabase: ReturnType<typeof createClient>,
  callerId: string,
  userId: string,
  isAdminAlvo: boolean,
  ativo: boolean,
  perms: { module: string; action: string }[],
  unidades: string[]
) {
  if (isAdminAlvo) {
    await supabase.from("user_module_permissions").delete().eq("user_id", userId);
    await supabase.from("user_unit_access").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").update({ is_active: ativo }).eq("id", userId);
    return error?.message ?? null;
  }
  const { error } = await supabase.rpc("admin_replace_user_permissions", {
    _caller_id: callerId,
    _user_id: userId,
    _is_active: ativo,
    _perms: perms,
    _unit_ids: unidades,
  });
  return error?.message ?? null;
}

export async function criarUsuario(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirAdmin();
  if (!temChaveSecreta()) return { erro: "Criação de usuários indisponível: falta configurar a chave secreta do Supabase no servidor." };

  const parsed = usuarioSchema.safeParse(lerUsuario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;

  const admin = createAdminClient();
  const { data: criado, error } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { full_name: d.full_name },
  });
  if (error || !criado.user) {
    const m = (error?.message ?? "").toLowerCase();
    return { erro: m.includes("already") ? "Já existe um usuário com esse e-mail." : `Não foi possível criar: ${error?.message}` };
  }
  const userId = criado.user.id;

  // O trigger handle_new_user() ja criou profile e papel 'member'. Ajustes com a sessao do admin.
  const supabase = createClient();
  const { error: eProfile } = await supabase
    .from("profiles")
    .update({ full_name: d.full_name, must_change_password: true, is_active: d.is_active })
    .eq("id", userId);
  if (eProfile) return { erro: `Usuário criado, mas o perfil não foi ajustado: ${traduzirErroBanco(eProfile.message)}` };

  if (d.role === "admin") {
    const e = await definirPapel(supabase, userId, "admin");
    if (e) return { erro: `Usuário criado, mas o papel não foi definido: ${traduzirErroBanco(e)}` };
  }

  const eAcessos = await definirAcessos(supabase, ctx.userId, userId, d.role === "admin", d.is_active, d.permissoes, d.unidades);
  if (eAcessos) return { erro: `Usuário criado, mas os acessos não foram salvos: ${traduzirErroBanco(eAcessos)}` };

  revalidar();
  redirect("/equipe?ok=criado");
}

export async function atualizarUsuario(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirAdmin();
  const parsed = usuarioEdicaoSchema.safeParse(lerUsuario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;

  const supabase = createClient();
  const { data: papelAtual } = await supabase.from("user_roles").select("role").eq("user_id", id);
  const eraAdmin = (papelAtual ?? []).some((r) => r.role === "admin");

  if (id === ctx.userId && (d.role !== "admin" || !d.is_active)) {
    return { erro: "Você não pode remover seu próprio acesso de administrador nem se desativar." };
  }

  const { error: eProfile } = await supabase.from("profiles").update({ full_name: d.full_name }).eq("id", id);
  if (eProfile) return { erro: traduzirErroBanco(eProfile.message) };

  if ((d.role === "admin") !== eraAdmin) {
    const e = await definirPapel(supabase, id, d.role);
    if (e) return { erro: traduzirErroBanco(e) };
  }

  const eAcessos = await definirAcessos(supabase, ctx.userId, id, d.role === "admin", d.is_active, d.permissoes, d.unidades);
  if (eAcessos) return { erro: traduzirErroBanco(eAcessos) };

  revalidar();
  redirect("/equipe?ok=atualizado");
}

export async function redefinirSenha(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  if (!temChaveSecreta()) return { erro: "Redefinição de senha indisponível: falta configurar a chave secreta do Supabase no servidor." };
  const parsed = senhaSchema.safeParse({ password: String(fd.get("password") ?? "") });
  if (!parsed.success) return { erro: primeiroErro(parsed) };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: parsed.data.password });
  if (error) return { erro: `Não foi possível redefinir: ${error.message}` };

  await createClient().from("profiles").update({ must_change_password: true }).eq("id", id);
  revalidar();
  redirect("/equipe?ok=senha");
}

export async function alternarAtivoUsuario(fd: FormData) {
  const ctx = await exigirAdmin();
  const id = String(fd.get("id") ?? "");
  const ativo = String(fd.get("ativo") ?? "") === "true";
  if (id === ctx.userId) redirect(comParametro("/equipe", "erro", "Você não pode desativar a si mesmo."));

  const { error } = await createClient().from("profiles").update({ is_active: ativo }).eq("id", id);
  revalidar();
  if (error) redirect(comParametro("/equipe", "erro", traduzirErroBanco(error.message)));
  redirect(comParametro("/equipe", "ok", ativo ? "reativado" : "desativado"));
}
