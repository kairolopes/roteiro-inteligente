import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuizOptionProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  variant?: "default" | "compact";
}

export function QuizOption({
  icon: Icon,
  emoji,
  title,
  description,
  selected,
  onClick,
  variant = "default",
}: QuizOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-xl border transition-all",
        variant === "default" && "p-4 lg:p-6",
        variant === "compact" && "p-3 lg:p-4",
        selected
          ? "border-primary bg-primary/10 glow-sm"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon or Emoji */}
        {(Icon || emoji) && (
          <div
            className={cn(
              "flex-shrink-0 rounded-lg flex items-center justify-center",
              variant === "default" && "w-12 h-12",
              variant === "compact" && "w-10 h-10",
              selected ? "bg-primary/20" : "bg-secondary"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  selected ? "text-primary" : "text-muted-foreground",
                  variant === "default" && "w-6 h-6",
                  variant === "compact" && "w-5 h-5"
                )}
              />
            )}
            {emoji && (
              <span
                className={cn(
                  variant === "default" && "text-2xl",
                  variant === "compact" && "text-xl"
                )}
              >
                {emoji}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 pr-6">
          <h3
            className={cn(
              "font-medium",
              variant === "default" && "text-base lg:text-lg",
              variant === "compact" && "text-sm lg:text-base"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
