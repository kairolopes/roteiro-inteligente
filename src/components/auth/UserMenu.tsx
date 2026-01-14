import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Map, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

const UserMenu = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="gap-2"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Entrar</span>
        </Button>
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuário";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-border">
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    navigate("/my-itineraries");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Meus Roteiros</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Configurações</span>
                </button>
              </div>

              <div className="p-2 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
