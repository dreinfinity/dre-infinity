import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

interface TrialExpiryModalProps {
  open: boolean;
  daysRemaining: number;
}

export function TrialExpiryModal({ open, daysRemaining }: TrialExpiryModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-md glass [&>button]:hidden">
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-2xl">
              <GradientText>Seu Trial Expirou</GradientText>
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Seu período de teste de 7 dias terminou. Para continuar usando o DRE Infinity de forma ilimitada, escolha um plano que atenda suas necessidades.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-3">
            <Button
              onClick={() => navigate("/pricing")}
              variant="glow"
              size="lg"
              className="w-full"
            >
              Escolher um Plano
            </Button>
            <p className="text-xs text-muted-foreground">
              Todos os planos incluem 7 dias grátis adicionais
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
