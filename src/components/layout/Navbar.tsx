import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plane, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/auth/UserMenu";

const navLinks = [
  { name: "Destinos", href: "#destinos", icon: MapPin },
  { name: "Como Funciona", href: "#como-funciona", icon: Plane },
  { name: "Planejar Viagem", href: "#planejar", icon: MessageCircle },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass safe-area-top"
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-14 lg:h-20 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl gradient-primary flex items-center justify-center glow-sm">
                <Plane className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg lg:text-xl font-bold text-foreground">
              Viage com <span className="text-primary">Sofia</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <UserMenu />
            <Button 
              onClick={() => navigate("/quiz")}
              className="gradient-primary text-primary-foreground glow-sm hover:opacity-90 transition-opacity"
            >
              Começar Agora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 -mr-2 text-foreground touch-target touch-active"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-border">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </a>
                ))}
                <div className="px-4 pt-4 space-y-3 border-t border-border">
                  <div className="flex justify-center">
                    <UserMenu />
                  </div>
                  <Button 
                    onClick={() => {
                      navigate("/quiz");
                      setIsOpen(false);
                    }}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    Começar Agora
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
