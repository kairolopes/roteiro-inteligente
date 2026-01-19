import { useState } from "react";
import { Users, Minus, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  value: PassengerCounts;
  onChange: (counts: PassengerCounts) => void;
}

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const totalPassengers = value.adults + value.children + value.infants;
  
  const updateCount = (type: keyof PassengerCounts, delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(type === 'adults' ? 1 : 0, Math.min(9, newValue[type] + delta));
    
    // Infants can't exceed adults
    if (type === 'adults' && newValue.infants > newValue.adults) {
      newValue.infants = newValue.adults;
    }
    
    onChange(newValue);
  };
  
  const getLabel = () => {
    const parts = [];
    if (value.adults > 0) {
      parts.push(`${value.adults} adulto${value.adults > 1 ? 's' : ''}`);
    }
    if (value.children > 0) {
      parts.push(`${value.children} criança${value.children > 1 ? 's' : ''}`);
    }
    if (value.infants > 0) {
      parts.push(`${value.infants} bebê${value.infants > 1 ? 's' : ''}`);
    }
    return parts.join(', ');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 justify-between gap-2 font-normal"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[150px]">{getLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Passageiros</h4>
          
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Adultos</p>
              <p className="text-xs text-muted-foreground">A partir de 12 anos</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('adults', -1)}
                disabled={value.adults <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-medium">{value.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('adults', 1)}
                disabled={totalPassengers >= 9}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Crianças</p>
              <p className="text-xs text-muted-foreground">2 a 11 anos</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('children', -1)}
                disabled={value.children <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-medium">{value.children}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('children', 1)}
                disabled={totalPassengers >= 9}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Bebês</p>
              <p className="text-xs text-muted-foreground">Até 2 anos (no colo)</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('infants', -1)}
                disabled={value.infants <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-medium">{value.infants}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateCount('infants', 1)}
                disabled={value.infants >= value.adults || totalPassengers >= 9}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Máximo de 9 passageiros por reserva
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
