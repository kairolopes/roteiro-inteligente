import { Plane, Mail, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Plataforma: [
    { name: "Como Funciona", href: "#como-funciona" },
    { name: "Destinos", href: "#destinos" },
    { name: "Preços", href: "#precos" },
    { name: "FAQ", href: "#faq" },
  ],
  Destinos: [
    { name: "Itália", href: "#" },
    { name: "França", href: "#" },
    { name: "Espanha", href: "#" },
    { name: "Portugal", href: "#" },
    { name: "Grécia", href: "#" },
  ],
  Suporte: [
    { name: "Central de Ajuda", href: "#" },
    { name: "Contato", href: "#" },
    { name: "Termos de Uso", href: "#" },
    { name: "Privacidade", href: "#" },
  ],
};

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Viage com <span className="text-primary">Sofía</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-6">
              Planeje sua viagem dos sonhos com inteligência artificial. 
              Roteiros personalizados para destinos pelo mundo.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Receba dicas de viagem e ofertas exclusivas.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <button className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Assinar
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Viage com Sofía. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com ❤️ para viajantes sonhadores
          </p>
        </div>
      </div>
    </footer>
  );
}
