import { motion } from "framer-motion";
import { Plane, Hotel, Package, Car, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductType = "flights" | "hotels" | "packages" | "cars" | "activities";

interface ProductTabsProps {
  activeProduct: ProductType;
  onProductChange: (product: ProductType) => void;
}

const products = [
  { id: "flights" as ProductType, label: "Voos", icon: Plane, enabled: true },
  { id: "hotels" as ProductType, label: "Hotéis", icon: Hotel, enabled: true },
  { id: "packages" as ProductType, label: "Pacotes", icon: Package, enabled: false, badge: "Em breve" },
  { id: "cars" as ProductType, label: "Carros", icon: Car, enabled: true },
  { id: "activities" as ProductType, label: "Atividades", icon: Ticket, enabled: true },
];

export function ProductTabs({ activeProduct, onProductChange }: ProductTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl">
      {products.map((product) => {
        const Icon = product.icon;
        const isActive = activeProduct === product.id;
        
        return (
          <button
            key={product.id}
            onClick={() => product.enabled && onProductChange(product.id)}
            disabled={!product.enabled}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : product.enabled
                ? "text-muted-foreground hover:text-foreground hover:bg-background/50"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeProductTab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{product.label}</span>
              {product.badge && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                  {product.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
