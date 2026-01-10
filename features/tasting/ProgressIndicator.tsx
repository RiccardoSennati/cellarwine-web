interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string }[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex-1 text-center ${
              index <= currentStep
                ? "text-[var(--accent-primary)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                index <= currentStep
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--surface-base)] border border-[var(--border-default)] text-[var(--text-muted)]"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div className="text-xs font-medium">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="w-full h-1 bg-[var(--surface-base)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

