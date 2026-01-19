import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TripType = "roundtrip" | "oneway" | "multicity";

interface TripTypeSelectorProps {
  value: TripType;
  onChange: (type: TripType) => void;
}

const tripTypes = [
  { id: "roundtrip" as TripType, label: "Ida e volta" },
  { id: "oneway" as TripType, label: "Só ida" },
  { id: "multicity" as TripType, label: "Múltiplos destinos", disabled: true },
];

export function TripTypeSelector({ value, onChange }: TripTypeSelectorProps) {
  return (
    <div className="flex gap-4">
      {tripTypes.map((type) => (
        <label
          key={type.id}
          className={cn(
            "flex items-center gap-2 cursor-pointer text-sm",
            type.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="relative">
            <input
              type="radio"
              name="tripType"
              value={type.id}
              checked={value === type.id}
              onChange={() => !type.disabled && onChange(type.id)}
              disabled={type.disabled}
              className="sr-only"
            />
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                value === type.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {value === type.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-1 bg-white rounded-full"
                />
              )}
            </div>
          </div>
          <span className={cn(
            value === type.id ? "font-medium text-foreground" : "text-muted-foreground"
          )}>
            {type.label}
          </span>
          {type.disabled && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
              Em breve
            </span>
          )}
        </label>
      ))}
    </div>
  );
}
