import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, Check, Info } from 'lucide-react';

interface ServiceOnboardingFormProps {
  serviceType: string;
  serviceOrderData?: any;
  onBack: () => void;
  onSubStepChange?: (currentSubStep: number, totalSubSteps: number, serviceName: string) => void;
  onComplete?: (completed: boolean) => void;
}

export function ServiceOnboardingForm({ serviceType, serviceOrderData, onBack, onSubStepChange, onComplete }: ServiceOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [sameAsContactInfo, setSameAsContactInfo] = useState<Record<number, boolean>>({});

  const serviceConfig = getServiceConfig(serviceType);
  const totalSteps = serviceConfig.steps.length;

  // Notify parent of sub-step changes
  React.useEffect(() => {
    if (onSubStepChange) {
      onSubStepChange(currentStep, totalSteps, serviceConfig.name);
    }
  }, [currentStep, totalSteps, serviceConfig.name, onSubStepChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSameAsContactInfo = (checked: boolean) => {
    setSameAsContactInfo({ ...sameAsContactInfo, [currentStep]: checked });
    
    if (checked) {
      // Determine the field prefix for the current step
      const currentStepConfig = serviceConfig.steps[currentStep - 1];
      const isLocationZ = currentStepConfig.title.includes('Location Z');
      const prefix = isLocationZ ? 'locZ' : '';
      
      // Map contact info fields to technical contact fields
      const contactInfoFields = {
        [`${prefix}onSiteContactName`]: `${prefix}technicalContactName`,
        [`${prefix}mobileNumber`]: `${prefix}techMobileNumber`,
        [`${prefix}alternativeNumber`]: `${prefix}techAlternativeNumber`,
        [`${prefix}email`]: `${prefix}techEmail`,
      };
      
      // Copy values from contact info to technical contacts
      const updatedFormData = { ...formData };
      Object.entries(contactInfoFields).forEach(([sourceField, targetField]) => {
        if (formData[sourceField]) {
          updatedFormData[targetField] = formData[sourceField];
        }
      });
      
      setFormData(updatedFormData);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setSubmitted(true);
    if (onComplete) {
      onComplete(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}>
              <Check className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl mb-4 text-gray-800">Onboarding Complete!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for submitting your service onboarding information. 
            Our team will review your details and contact you shortly to schedule installation.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-lg text-white font-medium hover:shadow-lg transition-shadow"
            style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}
          >
            Start New Onboarding
          </button>
        </Card>
      </div>
    );
  }

  const currentStepConfig = serviceConfig.steps[currentStep - 1];
  
  // Helper function to determine if a field is a technical contact field
  const isTechnicalContactField = (fieldName: string) => {
    const techFields = ['technicalContactName', 'technicalContactTitle', 'techMobileNumber', 'techAlternativeNumber', 'techEmail'];
    const locZTechFields = ['locZTechnicalContactName', 'locZTechnicalContactTitle', 'locZTechMobileNumber', 'locZTechAlternativeNumber', 'locZTechEmail'];
    return techFields.includes(fieldName) || locZTechFields.includes(fieldName);
  };
  
  // Helper function to check if the current step has "Same as Contact Info" enabled
  const isFieldDisabled = (fieldName: string) => {
    return sameAsContactInfo[currentStep] && isTechnicalContactField(fieldName);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-xl bg-[rgba(236,248,253,0.95)] bg-[#ecf8fda6]">
        <h2 className="text-xl mb-1 text-[rgb(33,82,121)] font-[Montserrat] text-[20px] leading-tight">
          <span className="font-light text-[24px]">Enter your </span>
          <span className="font-bold text-[24px]">{currentStepConfig.title}</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {currentStepConfig.fields.map((field, index) => (
            <div key={field.name} className={field.type === 'sectionHeader' || field.type === 'textarea' ? 'col-span-2' : ''}>
              {field.type === 'sectionHeader' ? (
                <>
                  <div className="bg-[#215279] text-white px-4 py-3 -mx-8 mb-4 mt-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {field.label}
                      <div className="relative group">
                        <Info className="w-5 h-5 text-white/70 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                          {field.label === 'Physical Location: Address - CPE'
                            ? 'Enter the full service address, including street, city, state, and ZIP. Specify the exact location of the CPE (floor, room, suite).'
                            : field.label === 'Technical Specifications'
                            ? 'Specify the requested bandwidth for the EPL service. 10Mbps through 10Gbps. Specify the required MTU size, value can be between 1500 and 9000. Specify desired handoff type. Example: Copper Ethernet or Optical - Single Mode. Specify the port speed. Example: 100Mbps, 1Gbps, or 10Gbps. Indicate AC or DC power availability. Specify the preferred mounting option for the CPE. Example: 19" Rack mount, 23" Rack mount or Wall mount.'
                            : field.helpText || `Information about ${field.label}`}
                        </div>
                      </div>
                    </h3>
                  </div>
                  
                  {/* Add checkbox after Technical Contacts header */}
                  {field.label === 'Technical Contacts' && (
                    <>
                      <div className="flex items-center gap-2 mb-2 p-[0px]">
                        <input
                          type="checkbox"
                          id={`sameAsContact-${currentStep}`}
                          checked={sameAsContactInfo[currentStep] ?? true}
                          onChange={(e) => handleSameAsContactInfo(e.target.checked)}
                          className="w-4 h-4 text-[#215279] border-gray-300 rounded focus:ring-[#215279]"
                        />
                        <label
                          htmlFor={`sameAsContact-${currentStep}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >Same as previous Operations/Technical Contact </label>
                      </div>
                      {sameAsContactInfo[currentStep] && serviceOrderData && (
                        <div className="flex items-center gap-4 p-4 border-2 border-blue-500 bg-blue-50 rounded-lg mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                            ZP
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {serviceOrderData.operationsFirstName && serviceOrderData.operationsLastName
                                ? `${serviceOrderData.operationsFirstName} ${serviceOrderData.operationsLastName}`
                                : 'Zutanito Pérez'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Operations Director · {serviceOrderData.operationsEmail || 'z.perez@empresa.com'}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Hide technical contact fields when checkbox is checked */}
                  {!(sameAsContactInfo[currentStep] && isTechnicalContactField(field.name)) && (
                    <div 
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        opacity: isFieldDisabled(field.name) ? 0 : 1,
                        maxHeight: isFieldDisabled(field.name) ? '0px' : '500px'
                      }}
                    >
                      <Label htmlFor={field.name} className="text-gray-700">
                        <span>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </Label>
                      
                      {field.type === 'text' && (
                        <Input
                          id={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="mt-2"
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <Select 
                          value={formData[field.name] || ''} 
                          onValueChange={(value) => handleInputChange(field.name, value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {field.type === 'textarea' && (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      )}
                      
                      {field.helpText && (
                        <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={currentStep === 1 ? onBack : handlePrevious}
            className="px-6 py-2 rounded-lg border-2 border-[#215279] text-[#215279] font-medium hover:border-[#215279] transition-colors"
          >
            Back
          </button>
          
          {currentStep < totalSteps ? (
            <button 
              onClick={handleNext}
              className="px-8 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-[rgba(99,224,201,0.6)_0px_6px_0px_0px]"
              style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-8 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-shadow"
              style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}
            >
              Submit Onboarding
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Service configuration helper
function getServiceConfig(serviceType: string) {
  const configs: Record<string, any> = {
    DIA: {
      name: 'DIA - Dedicated Internet Access',
      steps: [
        {
          title: 'Service Configuration',
          fields: [
            // Contact Information Section
            { name: 'contactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'onSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'mobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'alternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'email', label: 'Email address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'techContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'technicalContactName', label: 'Technical Contact Name (if different)', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'techMobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'techAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'techEmail', label: 'Email address', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'physicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'cityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },
            { name: 'cpeLocation', label: 'CPE Location', type: 'text', required: true, placeholder: 'CPE equipment location' },
            { name: 'floorRoomSuite', label: 'Floor, Room, Suite (Please be specific)', type: 'text', required: true, placeholder: 'Floor 3, Room 305, Suite A' },
            
            // Technical Specifications Section
            { name: 'techSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'circuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'ipAddress', label: 'IP Address', type: 'text', required: true, placeholder: 'e.g., 192.168.1.1 or DHCP' },
            { name: 'availablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'preferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'redundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'redundancyRequired', label: 'Redundancy Required', type: 'select', required: true, placeholder: 'Select option', options: ['No redundancy needed', 'Dual circuits - diverse path', 'Dual circuits - same path', 'Full geographic redundancy'] },
            { name: 'redundancyNotes', label: 'Redundancy Notes', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
      ],
    },
    EPL_P2P: {
      name: 'Ethernet Private Line',
      steps: [
        {
          title: 'Location A – UNI',
          fields: [
            // Contact Information Section
            { name: 'contactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'onSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'mobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'alternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'techContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'technicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'technicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'techMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'techAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'techEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Address Section
            { name: 'addressHeader', label: 'Physical Location: Address - CPE', type: 'sectionHeader' },
            { name: 'streetName', label: 'Street name', type: 'text', required: true, placeholder: 'e.g, South LaSalle Street' },
            { name: 'buildingNumber', label: 'Building number', type: 'text', required: true, placeholder: 'e.g, 120' },
            { name: 'zipPostalCode', label: 'ZIP / Postal code', type: 'text', required: true, placeholder: 'e.g, 60690-0834' },
            { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'e.g, Chicago' },
            { name: 'stateProvince', label: 'State / Province', type: 'text', required: true, placeholder: 'e.g, IL' },
            { name: 'floor', label: 'Floor', type: 'text', required: false, placeholder: 'e.g, 3' },
            { name: 'room', label: 'Room', type: 'text', required: false, placeholder: 'e.g, Server room A' },
            { name: 'suiteUnit', label: 'Suite / Unit', type: 'text', required: false, placeholder: 'e.g, Suite 400' },

            // Technical Specifications Section
            { name: 'techSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'circuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'maxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'physicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'physicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'availablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'preferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'redundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'redundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
        {
          title: 'Location Z – UNI',
          fields: [
            // Contact Information Section
            { name: 'locZContactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'locZOnSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'locZMobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'locZAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZEmail', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'locZTechContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'locZTechnicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'locZTechnicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'locZTechMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'locZTechAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZTechEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'locZPhysicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'locZAddress', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'locZCityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },
            { name: 'locZCpeLocation', label: 'CPE Location', type: 'text', required: true, placeholder: 'CPE equipment location' },
            { name: 'locZFloorRoomSuite', label: 'Floor, Room, Suite (please be specific)', type: 'text', required: true, placeholder: 'Floor 3, Room 305, Suite A' },
            
            // Technical Specifications Section
            { name: 'locZTechSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'locZCircuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZMaxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'locZPhysicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'locZPhysicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZAvailablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'locZPreferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'locZRedundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'locZRedundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
      ],
    },
    EVPL_P2P: {
      name: 'Ethernet Virtual Private Line',
      steps: [
        {
          title: 'Location A – UNI',
          fields: [
            // Contact Information Section
            { name: 'contactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'onSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'mobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'alternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'techContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'technicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'technicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'techMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'techAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'techEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'physicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'cityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },

            // Technical Specifications Section
            { name: 'techSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'customerVlan', label: 'Customer VLAN', type: 'text', required: true, placeholder: 'e.g., 100', helpText: 'VLAN ID for tagging (2-4094)' },
            { name: 'circuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'maxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'physicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'physicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'availablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'preferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'redundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'redundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
        {
          title: 'Location Z – UNI',
          fields: [
            // Contact Information Section
            { name: 'locZContactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'locZOnSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'locZMobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'locZAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZEmail', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'locZTechContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'locZTechnicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'locZTechnicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'locZTechMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'locZTechAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZTechEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'locZPhysicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'locZAddress', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'locZCityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },

            // Technical Specifications Section
            { name: 'locZTechSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'locZCustomerVlan', label: 'Customer VLAN', type: 'text', required: true, placeholder: 'e.g., 200', helpText: 'VLAN ID for tagging (2-4094)' },
            { name: 'locZCircuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZMaxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'locZPhysicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'locZPhysicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZAvailablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'locZPreferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'locZRedundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'locZRedundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
      ],
    },
    ACCESS_EPL: {
      name: 'Access EPL',
      steps: [
        {
          title: 'Location A – NNI',
          fields: [
            // NNI Circuit ID
            { name: 'nniCircuitId', label: 'NNI Circuit ID', type: 'text', required: true, placeholder: 'Enter NNI Circuit ID' },
            
            // Technical Specifications Section
            { name: 'techSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'serviceProviderVlan', label: 'Service Provider VLAN', type: 'text', required: true, placeholder: 'Enter Service Provider VLAN' },
            { name: 'serviceProviderTpid', label: 'Service Provider TPID (0x88a8)', type: 'text', required: true, placeholder: '0x88a8' },
            { name: 'maxMtuFrameSize', label: 'Maximum MTU Frame Size (9000)', type: 'text', required: true, placeholder: '9000' },
            
            // For Out-of-State Circuits Only Section
            { name: 'outOfStateHeader', label: 'For Out-of-State Circuits Only', type: 'sectionHeader' },
            { name: 'circuitProtectionRequired', label: 'Circuit protection required', type: 'select', required: false, placeholder: 'Select option', options: ['Yes', 'No', 'N/A'] },
            
            // Special Requirements Section
            { name: 'specialRequirementsHeader', label: 'Special Requirements', type: 'sectionHeader' },
            { name: 'specialRequirements', label: 'Special Requirements', type: 'textarea', required: false, placeholder: 'Enter any special requirements or additional notes' },
          ],
        },
        {
          title: 'Location Z – UNI',
          fields: [
            // Contact Information Section
            { name: 'locZContactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'locZOnSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'locZMobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'locZAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZEmail', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'locZTechContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'locZTechnicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'locZTechnicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'locZTechMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'locZTechAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZTechEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'locZPhysicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'locZAddress', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'locZCityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },

            // Technical Specifications Section
            { name: 'locZTechSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'locZCircuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZMaxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'locZPhysicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'locZPhysicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZAvailablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'locZPreferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'locZRedundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'locZRedundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
      ],
    },
    ACCESS_EVPL: {
      name: 'Access EVPL',
      steps: [
        {
          title: 'Location A – NNI',
          fields: [
            // NNI Circuit ID
            { name: 'nniCircuitId', label: 'NNI Circuit ID', type: 'text', required: true, placeholder: 'Enter NNI Circuit ID' },
            
            // Technical Specifications Section
            { name: 'techSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'serviceProviderVlan', label: 'Service Provider VLAN', type: 'text', required: true, placeholder: 'Enter Service Provider VLAN' },
            { name: 'serviceProviderTpid', label: 'Service Provider TPID', type: 'text', required: true, placeholder: '0x8100 or 0x88a8' },
            { name: 'maxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'text', required: true, placeholder: '9000' },
            
            // For Out-of-State Circuits Only Section
            { name: 'outOfStateHeader', label: 'For Out-of-State Circuits Only', type: 'sectionHeader' },
            { name: 'circuitProtectionRequired', label: 'Circuit protection required', type: 'select', required: false, placeholder: 'Select option', options: ['Yes', 'No', 'N/A'] },
            
            // Special Requirements Section
            { name: 'specialRequirementsHeader', label: 'Special Requirements', type: 'sectionHeader' },
            { name: 'specialRequirements', label: 'Special Requirements', type: 'textarea', required: false, placeholder: 'Enter any special requirements or additional notes' },
          ],
        },
        {
          title: 'Location Z – UNI',
          fields: [
            // Contact Information Section
            { name: 'locZContactInfoHeader', label: 'Contact Information', type: 'sectionHeader' },
            { name: 'locZOnSiteContactName', label: 'On Site Contact Name', type: 'text', required: true, placeholder: 'Enter on-site contact name' },
            { name: 'locZMobileNumber', label: 'Mobile Number (SMS approved)', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'locZAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZEmail', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Technical Contacts Section
            { name: 'locZTechContactHeader', label: 'Technical Contacts', type: 'sectionHeader' },
            { name: 'locZTechnicalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Enter technical contact name' },
            { name: 'locZTechnicalContactTitle', label: 'Title', type: 'text', required: false, placeholder: 'Enter title' },
            { name: 'locZTechMobileNumber', label: 'Phone number', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'locZTechAlternativeNumber', label: 'Alternative Number', type: 'text', required: false, placeholder: '+1 (555) 987-6543' },
            { name: 'locZTechEmail', label: 'Email', type: 'text', required: false, placeholder: 'technical@example.com' },
            
            // Physical Locations Section
            { name: 'locZPhysicalLocHeader', label: 'Physical Locations', type: 'sectionHeader' },
            { name: 'locZAddress', label: 'Address', type: 'text', required: true, placeholder: 'Street address' },
            { name: 'locZCityStateZip', label: 'City, State, Zip', type: 'text', required: true, placeholder: 'City, State, ZIP' },

            // Technical Specifications Section
            { name: 'locZTechSpecsHeader', label: 'Technical Specifications', type: 'sectionHeader' },
            { name: 'locZCustomerVlan', label: 'Customer VLAN', type: 'text', required: true, placeholder: 'e.g., 200', helpText: 'VLAN ID for tagging (2-4094)' },
            { name: 'locZCircuitSpeed', label: 'Circuit Speed', type: 'select', required: true, placeholder: 'Select circuit speed', options: ['10 Mbps', '50 Mbps', '100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZMaxMtuFrameSize', label: 'Maximum MTU Frame Size', type: 'select', required: true, placeholder: 'Select MTU size', options: ['1500 bytes', '1522 bytes', '9000 bytes (Jumbo)', '9216 bytes (Jumbo)'] },
            { name: 'locZPhysicalPortHandoff', label: 'Physical Port Handoff', type: 'select', required: true, placeholder: 'Select handoff type', options: ['Copper (RJ45)', 'Fiber (LC)', 'Fiber (SC)', 'SFP', 'SFP+', 'XFP'] },
            { name: 'locZPhysicalPortSpeed', label: 'Physical Port Speed', type: 'select', required: true, placeholder: 'Select port speed', options: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps', '100 Gbps'] },
            { name: 'locZAvailablePower', label: 'Available Power', type: 'select', required: true, placeholder: 'Select power type', options: ['110V AC', '220V AC', 'DC -48V', 'Multiple available'] },
            { name: 'locZPreferredCpeMounting', label: 'Preferred CPE Mounting', type: 'select', required: true, placeholder: 'Select mounting preference', options: ['Wall Mount', 'Rack Mount', 'Desktop', 'No Preference'] },
            
            // Special Redundancy Requirements Section
            { name: 'locZRedundancyHeader', label: 'Special Redundancy Requirements', type: 'sectionHeader' },
            { name: 'locZRedundancyRequirements', label: 'Redundancy Requirements', type: 'textarea', required: false, placeholder: 'Describe any specific redundancy requirements or special considerations' },
          ],
        },
      ],
    },
    ENNI: {
      name: 'ENNI - External Network to Network Interface',
      steps: [
        {
          title: 'Order for ENNI',
          fields: [
            // Order Type Section
            { name: 'orderTypeHeader', label: 'Order Type', type: 'sectionHeader' },
            { name: 'serviceType', label: 'Service Type: ENNI', type: 'text', required: true, placeholder: 'ENNI' },
            { name: 'customerPonOrder', label: 'Customer PON/Order #', type: 'text', required: true, placeholder: 'Enter Customer PON/Order #' },
            { name: 'desiredDueDate', label: 'Desired Due Date', type: 'text', required: true, placeholder: 'MM/DD/YYYY' },
            { name: 'requestedBandwidth', label: 'Requested Bandwidth (Mbps/Gbps)', type: 'text', required: true, placeholder: 'e.g., 1 Gbps, 10 Gbps' },
            { name: 'customerCid', label: 'Customer CID for Requested Service', type: 'text', required: true, placeholder: 'Enter Customer CID' },
            
            // Customer Information Section
            { name: 'customerInfoHeader', label: 'Customer Information', type: 'sectionHeader' },
            { name: 'customerName', label: 'Customer Name', type: 'text', required: true, placeholder: 'Enter customer name' },
            { name: 'orderInitiatorContactName', label: 'Order Initiator Contact Name', type: 'text', required: true, placeholder: 'Enter order initiator contact name' },
            { name: 'orderContactPhone', label: 'Order Contact Phone', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'orderContactEmail', label: 'Order Contact Email', type: 'text', required: true, placeholder: 'contact@example.com' },
            
            // Customer Billing Information Section
            { name: 'billingInfoHeader', label: 'Customer Billing Information', type: 'sectionHeader' },
            { name: 'billingAddress', label: 'Address', type: 'text', required: true, placeholder: 'Billing address' },
            { name: 'billingContactName', label: 'Contact Name', type: 'text', required: true, placeholder: 'Billing contact name' },
            { name: 'billingContactPhone', label: 'Contact Phone', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'billingEmail', label: 'Email', type: 'text', required: true, placeholder: 'billing@example.com' },
            { name: 'taxExempt', label: 'Tax Exempt', type: 'select', required: true, placeholder: 'Select option', options: ['Yes', 'No'] },
            
            // Customer NOC Information Section
            { name: 'nocInfoHeader', label: 'Customer NOC Information', type: 'sectionHeader' },
            { name: 'nocMainPhone', label: 'Main Phone', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'nocMainEmail', label: 'Main Email', type: 'text', required: true, placeholder: 'noc@example.com' },
            { name: 'nocMaintenanceEmail', label: 'Maintenance Events Email', type: 'text', required: true, placeholder: 'maintenance@example.com' },
            
            // Service Location Information Section
            { name: 'serviceLocationHeader', label: 'Service Location Information', type: 'sectionHeader' },
            
            // Location A (ENNI) Subsection
            { name: 'locationASubheader', label: 'Location A (ENNI)', type: 'sectionHeader' },
            { name: 'locationAAddress', label: 'Address (Address, City, State, Zip Code)', type: 'text', required: true, placeholder: 'Street Address, City, State, ZIP' },
            { name: 'enniCircuitId', label: 'ENNI Circuit ID (TBD)', type: 'text', required: false, placeholder: 'ENNI Circuit ID - TBD' },
            
            // Local Contact Subsection
            { name: 'localContactSubheader', label: 'Local Contact', type: 'sectionHeader' },
            { name: 'localContactName', label: 'Name (Service Delivery)', type: 'text', required: true, placeholder: 'Local contact name' },
            { name: 'localContactPhone', label: 'Phone', type: 'text', required: true, placeholder: '+1 (555) 123-4567' },
            { name: 'localContactEmail', label: 'Email', type: 'text', required: true, placeholder: 'local@example.com' },
            
            // Alternate Local Contact Subsection
            { name: 'altLocalContactSubheader', label: 'Alternate Local Contact', type: 'sectionHeader' },
            { name: 'altLocalContactName', label: 'Name', type: 'text', required: false, placeholder: 'Alternate contact name' },
            { name: 'altLocalContactPhone', label: 'Phone', type: 'text', required: false, placeholder: '+1 (555) 123-4567' },
            { name: 'altLocalContactEmail', label: 'Email', type: 'text', required: false, placeholder: 'alternate@example.com' },
            
            // Comments / Notes Section
            { name: 'commentsNotesHeader', label: 'Comments / Notes', type: 'sectionHeader' },
            { name: 'commentsNotes', label: 'Comments / Notes', type: 'textarea', required: false, placeholder: 'Enter any additional comments or notes about this order' },
          ],
        },
      ],
    },
  };

  return configs[serviceType] || configs.DIA;
}