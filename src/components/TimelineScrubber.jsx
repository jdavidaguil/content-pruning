export default function TimelineScrubber({ steps = [], currentStep, onStepChange }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Step</span>
        <div className="flex-1 relative flex items-center">
          <div className="absolute inset-x-0 h-0.5 bg-gray-700 top-1/2 -translate-y-1/2" />
          <div className="relative flex items-center justify-between w-full">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isPast = i < currentStep;
              return (
                <button
                  key={i}
                  onClick={() => onStepChange(i)}
                  className="relative flex flex-col items-center group"
                  title={`Step ${step.step}: ${step.query?.slice(0, 60) || ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10
                    ${isActive ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-110' :
                      isPast ? 'bg-blue-800 text-blue-300' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
                  `}>
                    {step.step}
                  </div>
                  <div className="absolute -bottom-6 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {step.query?.slice(0, 20)}…
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{currentStep + 1} / {steps.length}</span>
      </div>
    </div>
  );
}
