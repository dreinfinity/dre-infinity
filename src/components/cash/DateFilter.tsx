import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  startDate?: Date;
  endDate?: Date;
  onDateChange: (startDate?: Date, endDate?: Date) => void;
}

export function DateFilter({ startDate, endDate, onDateChange }: DateFilterProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              onDateChange(date, endDate);
              setIsStartOpen(false);
            }}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">até</span>

      <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              onDateChange(startDate, date);
              setIsEndOpen(false);
            }}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(undefined, undefined)}
        >
          Limpar
        </Button>
      )}
    </div>
  );
}
