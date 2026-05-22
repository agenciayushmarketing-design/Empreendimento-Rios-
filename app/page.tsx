import { redirect } from "next/navigation";

// Raiz: o middleware ja garante a sessao. Se nao houver, mandou para /login antes.
export default function Home() {
  redirect("/dashboard");
}
