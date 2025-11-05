import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { TrialExpiryModal } from "@/components/TrialExpiryModal";

export function CheckoutGuard({ children }: { children: ReactNode }) {
  const { subscription, isLoading, daysUntilExpiry } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show modal only when trial has expired (not just inactive)
  const showExpiryModal = !subscription?.isActive && !subscription?.isTrial && daysUntilExpiry <= 0;

  return (
    <>
      <TrialExpiryModal open={showExpiryModal} daysRemaining={daysUntilExpiry} />
      {children}
    </>
  );
}
