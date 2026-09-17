import React from 'react';

interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepBreadcrumbProps {
  steps: Step[];
}

export function StepBreadcrumb({ steps }: StepBreadcrumbProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-[0px] mx-[229px] mt-[0px] mb-[9px]">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <span
                className={`
                  text-sm transition-colors duration-300
                  ${
                    isCurrent
                      ? 'font-bold text-[#2bc3bf]'
                      : isCompleted
                      ? 'font-bold text-black'
                      : 'font-normal text-gray-400'
                  }
                `}
              >
                {step.label}
              </span>

              {!isLast && (
                <span className="text-sm text-gray-400">{'>'}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to generate steps for all service flows
export function generateSteps(
  selectedService: string | null,
  hasServiceOrderData: boolean,
  isCompleted: boolean,
  currentSubStep?: number,
  totalSubSteps?: number
): Step[] {
  const steps: Step[] = [];
  const isEPLPointToPoint = selectedService === 'EPL_P2P' || selectedService === 'EVPL_P2P';

  // Step 1: Service Type Selection
  steps.push({
    id: 'service-type',
    label: 'Service Type',
    status: selectedService ? 'completed' : 'current',
  });

  if (!selectedService) {
    // Show upcoming steps when on step 1
    steps.push({
      id: 'service-order',
      label: 'Service Order',
      status: 'upcoming',
    });

    if (isEPLPointToPoint) {
      steps.push({
        id: 'configuration-a',
        label: 'Configuration Location A',
        status: 'upcoming',
      });
      steps.push({
        id: 'configuration-z',
        label: 'Configuration Location Z',
        status: 'upcoming',
      });
    } else {
      steps.push({
        id: 'configuration',
        label: 'Configuration',
        status: 'upcoming',
      });
    }

    steps.push({
      id: 'complete',
      label: 'Complete',
      status: 'upcoming',
    });
    return steps;
  }

  // Step 2: Service Order
  steps.push({
    id: 'service-order',
    label: 'Service Order',
    status: hasServiceOrderData ? 'completed' : 'current',
  });

  if (!hasServiceOrderData) {
    // Show upcoming steps when on step 2
    if (isEPLPointToPoint) {
      steps.push({
        id: 'configuration-a',
        label: 'Configuration Location A',
        status: 'upcoming',
      });
      steps.push({
        id: 'configuration-z',
        label: 'Configuration Location Z',
        status: 'upcoming',
      });
    } else {
      steps.push({
        id: 'configuration',
        label: 'Configuration',
        status: 'upcoming',
      });
    }

    steps.push({
      id: 'complete',
      label: 'Complete',
      status: 'upcoming',
    });
    return steps;
  }

  // Step 3: Configuration (split into Location A and Z for EPL Point-to-Point)
  if (isEPLPointToPoint && totalSubSteps === 2) {
    // Configuration Location A
    steps.push({
      id: 'configuration-a',
      label: 'Configuration Location A',
      status: currentSubStep === 1 ? 'current' : currentSubStep && currentSubStep > 1 ? 'completed' : 'upcoming',
    });

    // Configuration Location Z
    steps.push({
      id: 'configuration-z',
      label: 'Configuration Location Z',
      status: isCompleted ? 'completed' : currentSubStep === 2 ? 'current' : 'upcoming',
    });
  } else {
    // Single Configuration step for other services
    steps.push({
      id: 'configuration',
      label: 'Configuration',
      status: isCompleted ? 'completed' : 'current',
    });
  }

  if (!isCompleted) {
    // Show upcoming completion step
    steps.push({
      id: 'complete',
      label: 'Complete',
      status: 'upcoming',
    });
    return steps;
  }

  // Step 4: Complete
  steps.push({
    id: 'complete',
    label: 'Complete',
    status: 'current',
  });

  return steps;
}

// Keep the old function name for backward compatibility
export const generateDIASteps = generateSteps;