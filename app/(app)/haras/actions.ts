"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirHaras } from "@/lib/haras";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import {
  animalSchema,
  campos,
  categoriaHarasSchema,
  clienteHarasSchema,
  lancamentoAnimalSchema,
  lerSocios,
  movimentacaoAnimalSchema,
  pesagemSchema,
  primeiroErro,
} from "@/lib/validacao/haras";

export type EstadoFormulario = { erro?: string };

function revalidar(animalId?: string) {
  revalidatePath("/haras");
  revalidatePath("/haras/clientes");
  revalidatePath("/haras/categorias");
  revalidatePath("/haras/animais");
  if (animalId) revalidatePath(`/haras/animais/${animalId}`);
}

// ---------- clientes do haras ----------
const CAMPOS_CLIENTE = ["name", "document", "email", "phone", "address", "is_owner_account", "notes"];

export async function criarClienteHaras(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx, haras } = await exigirHaras();
  const parsed = clienteHarasSchema.safeParse(campos(fd, CAMPOS_CLIENTE));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("haras_clients").insert({ ...parsed.data, business_unit_id: haras.id, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/haras/clientes?ok=criado");
}

export async function atualizarClienteHaras(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirHaras();
  const parsed = clienteHarasSchema.safeParse(campos(fd, CAMPOS_CLIENTE));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("haras_clients").update(parsed.data).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/haras/clientes?ok=atualizado");
}

export async function excluirClienteHaras(fd: FormData) {
  await exigirHaras();
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/haras/clientes");
  const { error } = await createClient().from("haras_clients").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "excluido"));
}

// ---------- categorias de lancamento ----------
export async function criarCategoriaHaras(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx, haras } = await exigirHaras();
  const parsed = categoriaHarasSchema.safeParse(campos(fd, ["name", "type"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("haras_animal_categories").insert({ ...parsed.data, business_unit_id: haras.id, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/haras/categorias?ok=criada");
}

export async function excluirCategoriaHaras(fd: FormData) {
  await exigirHaras();
  const id = String(fd.get("id") ?? "");
  const { error } = await createClient().from("haras_animal_categories").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro("/haras/categorias", "erro", traduzirErroBanco(error.message)));
  redirect(comParametro("/haras/categorias", "ok", "excluida"));
}

// ---------- animais ----------
const CAMPOS_ANIMAL = ["name", "animal_type", "sex", "registration_code", "birth_date", "entry_date", "primary_client_id", "origin", "location_note", "emergency_phone", "notes"];

export async function criarAnimal(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx, haras } = await exigirHaras();
  const parsed = animalSchema.safeParse(campos(fd, CAMPOS_ANIMAL));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { data, error } = await createClient()
    .from("haras_animals")
    .insert({ ...parsed.data, business_unit_id: haras.id, created_by: ctx.userId })
    .select("id")
    .single();
  if (error || !data) return { erro: traduzirErroBanco(error?.message ?? "sem retorno") };
  revalidar(data.id);
  redirect(`/haras/animais/${data.id}?ok=criado`);
}

export async function atualizarAnimal(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirHaras();
  const parsed = animalSchema.safeParse(campos(fd, CAMPOS_ANIMAL));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("haras_animals").update(parsed.data).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar(id);
  redirect(`/haras/animais/${id}?ok=atualizado`);
}

export async function alterarStatusAnimal(fd: FormData) {
  await exigirHaras();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const voltar = `/haras/animais/${id}`;
  if (!["active", "sold", "deceased", "transferred"].includes(status)) redirect(comParametro(voltar, "erro", "Status inválido."));
  const exit_date = status === "active" ? null : new Date().toISOString().slice(0, 10);
  const { error } = await createClient().from("haras_animals").update({ status, exit_date }).eq("id", id);
  revalidar(id);
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "status"));
}

// Socios: replace_animal_partners troca a lista inteira; o trigger exige soma 100 ao fim da transacao.
export async function salvarSocios(animalId: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirHaras();
  const socios = lerSocios(fd);
  const total = socios.reduce((s, x) => s + x.ownership_percentage, 0);
  if (socios.length > 0 && Math.abs(total - 100) > 0.001) return { erro: `A soma das participações precisa ser 100% (atual ${total.toLocaleString("pt-BR")}%).` };
  const ids = new Set(socios.map((s) => s.client_id));
  if (ids.size !== socios.length) return { erro: "Cada sócio só pode aparecer uma vez." };

  const { error } = await createClient().rpc("replace_animal_partners", { _animal_id: animalId, _partners: socios });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar(animalId);
  redirect(`/haras/animais/${animalId}?ok=socios`);
}

export async function registrarPesagem(animalId: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx } = await exigirHaras();
  const parsed = pesagemSchema.safeParse(campos(fd, ["weighed_at", "weight_kg", "notes"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("haras_animal_weight_history").insert({ ...parsed.data, animal_id: animalId, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar(animalId);
  redirect(`/haras/animais/${animalId}?ok=pesagem`);
}

export async function registrarMovimentacaoAnimal(animalId: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx } = await exigirHaras();
  const parsed = movimentacaoAnimalSchema.safeParse(campos(fd, ["moved_at", "to_location", "from_location", "reason"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const supabase = createClient();
  const { error } = await supabase.from("haras_animal_movements").insert({ ...parsed.data, animal_id: animalId, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  await supabase.from("haras_animals").update({ location_note: parsed.data.to_location }).eq("id", animalId);
  revalidar(animalId);
  redirect(`/haras/animais/${animalId}?ok=movimentacao`);
}

// Lancamento por animal: o trigger gera as partes de cada socio (ou 100% do proprietario).
export async function registrarLancamentoAnimal(animalId: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const { ctx, haras } = await exigirHaras();
  const parsed = lancamentoAnimalSchema.safeParse(campos(fd, ["type", "category_id", "date", "description", "amount", "notes"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient()
    .from("haras_animal_transactions")
    .insert({ ...parsed.data, animal_id: animalId, business_unit_id: haras.id, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar(animalId);
  redirect(`/haras/animais/${animalId}?ok=lancamento`);
}

export async function excluirLancamentoAnimal(fd: FormData) {
  await exigirHaras();
  const id = String(fd.get("id") ?? "");
  const animalId = String(fd.get("animal_id") ?? "");
  const voltar = `/haras/animais/${animalId}`;
  const { error } = await createClient().from("haras_animal_transactions").delete().eq("id", id);
  revalidar(animalId);
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "lancamento_excluido"));
}

export async function definirStatusParte(fd: FormData) {
  await exigirHaras();
  const shareId = String(fd.get("share_id") ?? "");
  const status = String(fd.get("status") ?? "");
  const animalId = String(fd.get("animal_id") ?? "");
  const voltar = `/haras/animais/${animalId}`;
  const { error } = await createClient().rpc("set_animal_share_status", { _share_id: shareId, _status: status });
  revalidar(animalId);
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(voltar);
}

// Excluir animal: FKs em cascata apagam socios, pesagens, movimentacoes; lancamentos tambem
// (haras_animal_transactions nao tem FK para animal, entao apagamos antes).
export async function excluirAnimal(fd: FormData) {
  await exigirHaras();
  const id = String(fd.get("id") ?? "");
  const supabase = createClient();
  const { error: eLanc } = await supabase.from("haras_animal_transactions").delete().eq("animal_id", id);
  if (eLanc) redirect(comParametro(`/haras/animais/${id}`, "erro", traduzirErroBanco(eLanc.message)));
  const { error } = await supabase.from("haras_animals").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(`/haras/animais/${id}`, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro("/haras/animais", "ok", "excluido"));
}
