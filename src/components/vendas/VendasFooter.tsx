import { Plane } from "lucide-react";

export function VendasFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            <span className="font-semibold">Viaje com Sofia</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
            <a href="/privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="mailto:contato@viagecomsofia.com" className="hover:text-foreground transition-colors">
              Contato
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Viaje com Sofia. Todos os direitos reservados.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 text-center mt-6 max-w-2xl mx-auto">
          Sofia é uma assistente de viagem com inteligência artificial. Os roteiros são sugestões baseadas em suas preferências e podem ser ajustados conforme necessário. Preços e disponibilidades de serviços são de responsabilidade dos fornecedores.
        </p>
      </div>
    </footer>
  );
}
