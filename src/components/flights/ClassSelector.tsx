import { Briefcase, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

interface ClassSelectorProps {
  value: CabinClass;
  onChange: (cabinClass: CabinClass) => void;
}

const cabinClasses = [
  { id: "economy" as CabinClass, label: "Econômica" },
  { id: "premium_economy" as CabinClass, label: "Econômica Premium" },
  { id: "business" as CabinClass, label: "Executiva" },
  { id: "first" as CabinClass, label: "Primeira Classe" },
];

export function ClassSelector({ value, onChange }: ClassSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CabinClass)}>
      <SelectTrigger className="h-11 gap-2">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {cabinClasses.map((cabin) => (
          <SelectItem key={cabin.id} value={cabin.id}>
            {cabin.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
