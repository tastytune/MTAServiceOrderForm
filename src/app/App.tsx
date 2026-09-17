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
import backgroundImage from "figma:asset/85d0425c9d86e379171bc12115f350ff1c9412da.png";

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

  const handleSelectTask = (taskName: string) => {
    setSelectedTask(taskName);
  };

  const handleSelectService = (serviceType: string) => {
    setSelectedService(serviceType);
  };

  const handleBackToSelection = () => {
    setSelectedService(null);
    setServiceOrderData(null);
    setSubStepInfo(null);
    setIsCompleted(false);
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

  return (
    <div
      className="min-h-screen bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Content */}
      <div
        className="min-h-screen pb-12 px-4 bg-[#dedede00]"
        style={{
          paddingTop: selectedTask && selectedService ? "10px" : "128px",
        }}
      >
        {/* MTA Logo - Show on all screens except task list and service type selection */}
        {selectedTask && selectedService && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex justify-center">
              <img
                src={
                  image_d95948f19ab7cdceaf369a28bb082f71bb4b04b3
                }
                alt="MTA Logo"
                className="h-30 w-auto"
              />
            </div>
          </div>
        )}

        {/* Step Title Header - Hidden when onboarding is complete */}
        {!isCompleted && selectedTask && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="p-[0px]">
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
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation - Show for all service types */}
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

        {!selectedTask ? (
          <TaskListScreen onSelectTask={handleSelectTask} />
        ) : !selectedService ? (
          <ServiceTypeSelection
            onSelectService={handleSelectService}
          />
        ) : !serviceOrderData ? (
          <ServiceOrderForm
            serviceType={selectedService}
            onBack={handleBackToSelection}
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
  );
}