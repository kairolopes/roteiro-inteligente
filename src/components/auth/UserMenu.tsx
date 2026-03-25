import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Map, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

interface UserMenuProps {
  mobileFloating?: boolean;
}

const UserMenu = ({ mobileFloating = false }: UserMenuProps) => {
  const { user, profile, isLoading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const dropdownClassName = mobileFloating
    ? "absolute inset-x-0 bottom-full mb-2 glass-card rounded-2xl overflow-hidden z-50"
    : "absolute right-0 top-full mt-2 w-56 glass-card rounded-xl overflow-hidden z-50";

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div
        className={mobileFloating
          ? "h-14 w-full rounded-2xl bg-secondary animate-pulse"
          : "w-10 h-10 rounded-full bg-secondary animate-pulse"
        }
      />
    );
  }

  if (!user) {
    return (
      <>
        {mobileFloating ? (
          <div className="glass-card rounded-2xl p-2 shadow-2xl">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="h-11 w-full gap-2 rounded-xl font-medium"
            >
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModal(true)}
            className="gap-2 font-medium"
          >
            <User className="w-4 h-4" />
            <span>Entrar</span>
          </Button>
        )}
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuário";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <div className={mobileFloating ? "relative w-full" : "relative flex items-center gap-2"}>
      <div className={mobileFloating ? "glass-card rounded-2xl p-2 shadow-2xl" : "flex items-center gap-2"}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={mobileFloating
            ? "flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-secondary px-2 py-1.5 transition-colors hover:bg-secondary/80"
            : "flex items-center gap-2 rounded-full bg-secondary p-1 pr-2 transition-colors hover:bg-secondary/80"
          }
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
          <span className={mobileFloating ? "text-sm font-medium max-w-[120px] truncate" : "text-sm font-medium hidden sm:inline max-w-[100px] truncate"}>
            {displayName}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className={mobileFloating ? "h-11 shrink-0 gap-2 rounded-xl px-4 font-medium" : "gap-2 font-medium"}
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </Button>
      </div>

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
              className={dropdownClassName}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
