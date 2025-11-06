import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TourGuideProps {
  run: boolean;
  steps: Step[];
  onComplete: () => void;
}

export function TourGuide({ run, steps, onComplete }: TourGuideProps) {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 9999,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
        spotlight: {
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: 6,
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}
