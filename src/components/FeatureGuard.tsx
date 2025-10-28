import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Loader2 } from "lucide-react";

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { checkFeatureAccess, currentPlan, isLoading } = useSubscription();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkFeatureAccess(feature);
      setHasAccess(access);
      if (!access) {
        setShowUpgrade(true);
      }
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [feature, isLoading, checkFeatureAccess]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div className="text-center p-8 text-muted-foreground">
            Este recurso não está disponível no seu plano atual.
          </div>
        )}
        <UpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          feature={feature}
          currentPlan={currentPlan}
        />
      </>
    );
  }

  return <>{children}</>;
}
