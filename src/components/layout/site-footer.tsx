import Link from "next/link";
import { ShieldCheck, MapPin, Phone, Mail } from "lucide-react";
import { siteConfig, servicos } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
            SANTO
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Serviços</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {servicos.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/servicos#${s.slug}`} className="hover:text-foreground">
                  {s.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Institucional</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/empresa" className="hover:text-foreground">Sobre a Santo</Link></li>
            <li><Link href="/clientes" className="hover:text-foreground">Clientes</Link></li>
            <li><Link href="/trabalhe-conosco" className="hover:text-foreground">Trabalhe Conosco</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Portais de Acesso</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" /> {siteConfig.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> {siteConfig.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" /> {siteConfig.email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados. CNPJ 00.000.000/0001-00.
        </p>
      </div>
    </footer>
  );
}
