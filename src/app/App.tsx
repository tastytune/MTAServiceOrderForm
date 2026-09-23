import image_d95948f19ab7cdceaf369a28bb082f71bb4b04b3 from "figma:asset/d95948f19ab7cdceaf369a28bb082f71bb4b04b3.png";
import mtaLogo from "figma:asset/0b332748fa79e00529a0c2f9dba46580966baecb.png";
import React, { useState, useCallback } from "react";
import { TaskListScreen } from "@/app/components/TaskListScreen";
import { ServiceTypeSelection } from "@/app/components/ServiceTypeSelection";
import { ServiceOrderForm } from "@/app/components/ServiceOrderForm";
import { ServiceOnboardingForm } from "@/app/components/ServiceOnboardingForm";
import {
  StepBreadcrumb,
  generateSteps,
} from "@/app/components/StepBreadcrumb";
import globeBackgroundImage from "figma:asset/mta-network-map-background.png";
import formBackgroundImage from "figma:asset/85d0425c9d86e379171bc12115f350ff1c9412da.png";

export default function App() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<
    string | null
  >(null);
  const [serviceOrderData, setServiceOrderData] =
    useState<any>(null);
  const [subStepInfo, setSubStepInfo] = useState<{
    currentSubStep: number;
    totalSubSteps: number;
    serviceName: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Service type full names
  const serviceFullNames: Record<string, string> = {
    DIA: "Dedicated Internet Access",
    "EPL Point-to-Point": "Ethernet Private Line",
    "EVPL Point-to-Point": "Ethernet Virtual Private Line",
    "Access EPL": "Access Ethernet Private Line",
    "Access EVPL": "Access Ethernet Virtual Private Line",
    ENNI: "External Network-to-Network Interface",
  };

  // Maps a task from the Task List directly to its service type,
  // so selecting a task skips the Service Type Selection screen.
  const taskToServiceType: Record<string, string> = {
    EPL: "EPL_P2P",
    DIA: "DIA",
  };

  const handleSelectTask = (taskName: string) => {
    setSelectedTask(taskName);
    const mappedServiceType = taskToServiceType[taskName];
    if (mappedServiceType) {
      setSelectedService(mappedServiceType);
    }
  };

  const handleSelectService = (serviceType: string) => {
    setSelectedService(serviceType);
  };

  const handleBackToTaskList = () => {
    setSelectedTask(null);
    setSelectedService(null);
    setServiceOrderData(null);
    setSubStepInfo(null);
    setIsCompleted(false);
  };

  const handleServiceOrderComplete = (formData: any) => {
    setServiceOrderData(formData);
  };

  const handleBackToServiceOrder = () => {
    setServiceOrderData(null);
    setSubStepInfo(null);
    setIsCompleted(false);
  };

  const handleSubStepChange = useCallback(
    (
      currentSubStep: number,
      totalSubSteps: number,
      serviceName: string,
    ) => {
      setSubStepInfo({
        currentSubStep,
        totalSubSteps,
        serviceName,
      });
    },
    [],
  );

  const handleComplete = useCallback((completed: boolean) => {
    setIsCompleted(completed);
  }, []);

  // Globe/network-map background only on the very first screen (the Task
  // List); every screen after that (service selection, service order, the
  // onboarding form) goes back to the original houses/aurora background.
  const backgroundImage = !selectedTask ? globeBackgroundImage : formBackgroundImage;

  return (
    <div className="min-h-screen">
      {/* Background map + content are stacked in the same CSS grid cell
          (both `col-start-1 row-start-1`) instead of using `absolute
          inset-0` on a plain sibling: an absolutely positioned layer inside
          an auto-height parent only gets sized to the *initial* viewport
          height (a well-known CSS quirk), so on a tall multi-step form it
          stopped covering the page partway down and left plain white below
          it. Stacking them as grid cells makes the background layer's
          height track the content's real height instead, and — unlike
          `position: fixed` — it scrolls normally with the page rather than
          staying pinned to the viewport. */}
      <div className="grid">
        <div
          className="col-start-1 row-start-1 bg-cover bg-top bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Content */}
        <div
          className="col-start-1 row-start-1 relative min-h-screen pb-12 px-4 bg-[#dedede00]"
          style={{ paddingTop: "40px" }}
        >
        {/* MTA Logo + Back to Tasks / Title — one row: logo at 35% width on
            the left, the text that used to sit stacked below it now sits
            to its right instead. Hidden on the Task List screen itself —
            that screen places its own copy of this logo directly under the
            "Local Mission. Global Vision." tagline in the globe background
            instead (see TaskListScreen.tsx). */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center gap-6">
          {selectedTask && (
            <img
              src={image_d95948f19ab7cdceaf369a28bb082f71bb4b04b3}
              alt="MTA Logo"
              className="w-[35%] h-auto flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Back to Tasks - Show on every screen past the task list (2nd level and beyond) */}
            {selectedTask && (
              <button
                onClick={handleBackToTaskList}
                className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors mb-2"
              >
                <span aria-hidden="true">←</span>
                Back to Tasks
              </button>
            )}

            {/* Step Title Header - Hidden when onboarding is complete */}
            {!isCompleted && selectedTask && (
              <h1 className="text-3xl">
                {!selectedService ? (
                  <></>
                ) : !serviceOrderData ? (
                  <div>
                    <div className="text-white font-bold">
                      {selectedService === "EPL_P2P"
                        ? "EPL Point-to-Point Service Order"
                        : selectedService === "EVPL_P2P"
                          ? "EVPL Point-to-Point Service Order"
                          : selectedService === "ACCESS_EPL"
                            ? "Access EPL Service Order"
                            : selectedService === "ACCESS_EVPL"
                              ? "Access EVPL Service Order"
                              : selectedService}
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-white/90 font-normal">
                      Configure{" "}
                    </span>
                    <span className="text-white font-bold">
                      {selectedService === "EPL_P2P"
                        ? "EPL Point-to-Point"
                        : selectedService === "EVPL_P2P"
                          ? "EVPL Point-to-Point"
                          : selectedService === "ACCESS_EPL"
                            ? "Access EPL"
                            : selectedService === "ACCESS_EVPL"
                              ? "Access EVPL"
                              : selectedService}
                    </span>
                  </>
                )}
              </h1>
            )}

            {/* Breadcrumb Navigation - sits directly under the title, in the
                same text column as "Back to Tasks", instead of as its own
                row below the whole logo block (which left a large gap when
                the logo was taller than the text next to it). */}
            {selectedTask && selectedService && (
              <StepBreadcrumb
                steps={generateSteps(
                  selectedService,
                  !!serviceOrderData,
                  isCompleted,
                  subStepInfo?.currentSubStep,
                  subStepInfo?.totalSubSteps,
                )}
              />
            )}
          </div>
        </div>

        {!selectedTask ? (
          <TaskListScreen onSelectTask={handleSelectTask} />
        ) : !selectedService ? (
          <ServiceTypeSelection
            onSelectService={handleSelectService}
          />
        ) : !serviceOrderData ? (
          <ServiceOrderForm
            serviceType={selectedService}
            onBack={handleBackToTaskList}
            onNext={handleServiceOrderComplete}
          />
        ) : (
          <ServiceOnboardingForm
            serviceType={selectedService}
            serviceOrderData={serviceOrderData}
            onBack={handleBackToServiceOrder}
            onSubStepChange={handleSubStepChange}
            onComplete={handleComplete}
          />
        )}
        </div>
      </div>

      {/* Plain white scroll space below the background map, so the page has
          room to scroll past it instead of the map's bottom edge landing
          flush with the viewport. */}
      <div className="h-[250px] bg-white" />
    </div>
  );
}