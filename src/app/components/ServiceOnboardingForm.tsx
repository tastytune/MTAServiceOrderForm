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
  const [sameAsContactInfo, setSameAsContactInfo] = useState<Record<string, boolean>>({});
  // "Same as Location A" for the Location Z Technical Specifications section —
  // unlike the contact-info convenience checkbox, this defaults unchecked
  // because circuit/port specs genuinely differ per location more often than not.
  const [sameAsLocationATechSpecs, setSameAsLocationATechSpecs] = useState(false);

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

  // Same-as-contact-info state is keyed per step, and per column ('A'/'Z') for
  // steps that show both locations side by side — so Location A and Location Z
  // each keep their own independent checkbox state on the merged screen.
  const sameAsKey = (column?: 'A' | 'Z') => `${currentStep}${column ? `-${column}` : ''}`;

  const handleSameAsContactInfo = (checked: boolean, column?: 'A' | 'Z') => {
    const key = sameAsKey(column);
    setSameAsContactInfo({ ...sameAsContactInfo, [key]: checked });

    if (checked) {
      const prefix = column === 'Z' ? 'locZ' : '';

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

  // Location Z's own Technical Specifications inputs, hidden when
  // "Same as Location A" is checked in favor of a read-only mirror of A's values.
  const LOC_Z_TECH_SPEC_FIELDS = ['locZCircuitSpeed', 'locZMaxMtuFrameSize', 'locZPhysicalPortHandoff', 'locZPhysicalPortSpeed', 'locZAvailablePower', 'locZPreferredCpeMounting'];

  // Both A and Z physical addresses are already known from the Opportunity —
  // shown as a single plain-text line under each column title instead of a
  // section of inputs. Mock values stand in for what would really come from
  // the Opportunity/Quote.
  const locationAAddressSummary = serviceOrderData?.locationAAddress || '120 S LaSalle St · Suite 400, 3rd Floor';
  const locationZAddressSummary = serviceOrderData?.locationZAddress || '500 W Madison St · Telecom Room, 2nd Floor';

  // Helper function to determine if a field is a technical contact field
  const isTechnicalContactField = (fieldName: string) => {
    const techFields = ['technicalContactName', 'technicalContactTitle', 'techMobileNumber', 'techAlternativeNumber', 'techEmail'];
    const locZTechFields = ['locZTechnicalContactName', 'locZTechnicalContactTitle', 'locZTechMobileNumber', 'locZTechAlternativeNumber', 'locZTechEmail'];
    return techFields.includes(fieldName) || locZTechFields.includes(fieldName);
  };

  // "Same as previous Operations/Technical Contact" defaults to checked for a
  // step/column the user hasn't touched yet, so every place that reads this value
  // must apply the same default — otherwise the checkbox shows checked while
  // the rest of the UI (contact card, hidden fields) behaves as unchecked.
  const isSameAsContactChecked = (column?: 'A' | 'Z') => sameAsContactInfo[sameAsKey(column)] ?? true;

  // Helper function to check if a technical-contact field should be hidden/disabled
  const isFieldDisabled = (fieldName: string, column?: 'A' | 'Z') => {
    if (isSameAsContactChecked(column) && isTechnicalContactField(fieldName)) {
      return true;
    }
    // Location Z's own Technical Specifications inputs collapse (animated,
    // not unmounted) when "Same as Location A" is checked, so the swap to
    // the summary card grows/shrinks instead of snapping.
    if (column === 'Z' && sameAsLocationATechSpecs && LOC_Z_TECH_SPEC_FIELDS.includes(fieldName)) {
      return true;
    }
    return false;
  };

  const renderField = (field: any, column?: 'A' | 'Z') => {
    // Technical contact fields are fully removed from the grid (not just
    // visually collapsed) when "Same as previous..." is checked, so their
    // row-gap doesn't leave empty vertical space behind.
    if (isSameAsContactChecked(column) && isTechnicalContactField(field.name)) {
      return null;
    }

    return (
      <div key={field.name} className={field.type === 'sectionHeader' || field.type === 'textarea' ? 'col-span-2' : ''}>
        {field.type === 'sectionHeader' ? (
          <>
            <div
              className={`text-white px-4 py-3 -mx-8 mb-4 ${column ? '' : 'mt-2'}`}
              style={{ backgroundColor: sectionHeaderBg(column) }}
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {field.label}
                <div className="relative group">
                  <Info className="w-5 h-5 text-white/70 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                    {field.label === 'Physical Location: Address - CPE'
                      ? 'Enter the full service address, including street, city, state, and ZIP. Specify the exact location of the CPE (floor, room, suite).'
                      : field.label === 'Technical Specifications'
                      ? 'Specify the requested bandwidth for the EPL service. 10Mbps through 10Gbps. Specify the required MTU size, value can be between 1500 and 9000. Specify desired handoff type. Example: Copper Ethernet or Optical - Single Mode. Specify the port speed. Example: 100Mbps, 1Gbps, or 10Gbps. Indicate AC or DC power availability. Specify the preferred mounting option for the CPE. Example: 19" Rack mount, 23" Rack mount or Wall mount.'
                      : field.label === 'Technical Contacts'
                      ? 'Provide the technical point of contact responsible for coordinating installation and ongoing support at this location. Check "Same as previous Operations/Technical Contact" to reuse the contact already provided earlier in the Service Order instead of entering a new one here.'
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
                    id={`sameAsContact-${currentStep}-${column || 'main'}`}
                    checked={isSameAsContactChecked(column)}
                    onChange={(e) => handleSameAsContactInfo(e.target.checked, column)}
                    className="w-4 h-4 text-[#215279] border-gray-300 rounded focus:ring-[#215279]"
                  />
                  <label
                    htmlFor={`sameAsContact-${currentStep}-${column || 'main'}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >Same as previous Operations/Technical Contact </label>
                </div>
                {isSameAsContactChecked(column) && serviceOrderData && (
                  <div className={`flex items-center gap-4 p-4 border-2 rounded-lg mb-4 ${contactCardClass(column)}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${contactAvatarClass(column)}`}>
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

            {/* "Same as Location A" checkbox for Location Z's Technical Specifications */}
            {column === 'Z' && field.label === 'Technical Specifications' && (
              <>
                <div className="flex items-center gap-2 mb-2 p-[0px]">
                  <input
                    type="checkbox"
                    id="sameAsLocationATechSpecs"
                    checked={sameAsLocationATechSpecs}
                    onChange={(e) => setSameAsLocationATechSpecs(e.target.checked)}
                    className="w-4 h-4 text-[#215279] border-gray-300 rounded focus:ring-[#215279]"
                  />
                  <label
                    htmlFor="sameAsLocationATechSpecs"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >Same as Location A</label>
                </div>
                {/* Always mounted (never conditionally rendered) so the
                    max-height/opacity transition below can actually animate
                    it open/closed instead of popping in and out instantly. */}
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    opacity: sameAsLocationATechSpecs ? 1 : 0,
                    maxHeight: sameAsLocationATechSpecs ? '500px' : '0px'
                  }}
                >
                  <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg mb-4 text-sm text-gray-700 space-y-1">
                    <div><span className="font-semibold">Circuit Speed:</span> {formData.circuitSpeed || '—'}</div>
                    <div><span className="font-semibold">Maximum MTU Frame Size:</span> {formData.maxMtuFrameSize || '—'}</div>
                    <div><span className="font-semibold">Physical Port Handoff:</span> {formData.physicalPortHandoff || '—'}</div>
                    <div><span className="font-semibold">Physical Port Speed:</span> {formData.physicalPortSpeed || '—'}</div>
                    <div><span className="font-semibold">Available Power:</span> {formData.availablePower || '—'}</div>
                    <div><span className="font-semibold">Preferred CPE Mounting:</span> {formData.preferredCpeMounting || '—'}</div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Hide technical contact fields when checkbox is checked */}
            {!(isSameAsContactChecked(column) && isTechnicalContactField(field.name)) && (
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  opacity: isFieldDisabled(field.name, column) ? 0 : 1,
                  maxHeight: isFieldDisabled(field.name, column) ? '0px' : '500px'
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
                    className={`mt-2 ${fieldTintClass(column)}`}
                  />
                )}

                {field.type === 'select' && (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => handleInputChange(field.name, value)}
                  >
                    <SelectTrigger id={field.name} className={`mt-2 ${fieldTintClass(column)}`}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option: string) => (
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
                    className={`mt-2 ${fieldTintClass(column)}`}
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
    );
  };

  // Splits a flat field list into per-section chunks (each chunk starts with
  // its sectionHeader field). Used to render Location A and Location Z
  // section-by-section, side by side, instead of as two independent columns —
  // that way if one side expands (e.g. unchecking "Same as previous..."
  // reveals extra inputs), only that section grows taller; every section
  // below it still starts at the same height on both sides, so headers like
  // "Technical Specifications" never drift out of alignment between columns.
  const groupIntoSections = (fields: any[]) => {
    const sections: any[][] = [];
    fields.forEach((field) => {
      if (field.type === 'sectionHeader' || sections.length === 0) {
        sections.push([field]);
      } else {
        sections[sections.length - 1].push(field);
      }
    });
    return sections;
  };

  // Location A / Location Z color coding for the merged dual-location screen —
  // navy for A (existing brand color), a darker teal for Z (same family as the
  // app's teal accent, e.g. the "Onboarding Complete" gradient), so the two
  // columns stay identifiable at a glance without introducing a new palette.
  // Only used where `column` is explicitly 'A' or 'Z'; single-column steps are
  // untouched.
  const isColumnZ = (column?: 'A' | 'Z') => column === 'Z';

  // Section header bar background — inline style since the color is dynamic.
  const sectionHeaderBg = (column?: 'A' | 'Z') => (isColumnZ(column) ? 'rgb(55,131,148)' : 'rgb(33,82,121)');

  // Subtle tinted background on the field inputs themselves, per column.
  const fieldTintClass = (column?: 'A' | 'Z') => {
    if (column === 'Z') return 'bg-[rgba(55,131,148,0.07)] border-[rgba(55,131,148,0.35)]';
    if (column === 'A') return 'bg-[rgba(33,82,121,0.06)] border-[rgba(33,82,121,0.3)]';
    return '';
  };

  // "Same as previous..." summary card colors (border/background/avatar/text),
  // per column, matching the same navy/teal color coding used everywhere else.
  const contactCardClass = (column?: 'A' | 'Z') => {
    if (column === 'Z') return 'border-[rgb(55,131,148)] bg-[rgba(55,131,148,0.06)]';
    return 'border-[rgb(33,82,121)] bg-[rgba(33,82,121,0.05)]';
  };
  const contactAvatarClass = (column?: 'A' | 'Z') => {
    if (column === 'Z') return 'bg-[rgba(55,131,148,0.15)] text-[rgb(55,131,148)]';
    return 'bg-[rgba(33,82,121,0.12)] text-[rgb(33,82,121)]';
  };

  return (
    <div className={currentStepConfig.dualLocation ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
      <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-xl bg-[rgba(236,248,253,0.95)] bg-[#ecf8fda6]">
        {/* font-[Montserrat] removed below — that font was never actually
            loaded, so this was silently falling back to the browser
            default. h2 now inherits Poppins globally (see theme.css). */}
        {!currentStepConfig.dualLocation && (
          <h2 className="text-xl mb-1 text-[rgb(33,82,121)] text-[20px] leading-tight">
            <span className="font-light text-[24px]">Enter your </span>
            <span className="font-bold text-[24px]">{currentStepConfig.title}</span>
          </h2>
        )}

        {currentStepConfig.dualLocation ? (
          <>
            <div className="grid grid-cols-2 gap-x-8 mt-4">
              <div className="pl-4 pr-8 py-3 border-l-4 border-[rgb(33,82,121)]">
                <h3 className="text-lg font-bold text-[rgb(33,82,121)] mb-1">Location A – UNI</h3>
                <p className="text-sm text-gray-700 pb-2 border-b-2 border-[rgb(33,82,121)]">{locationAAddressSummary}</p>
              </div>
              <div className="pl-8 pr-8 py-3 border-l-4 border-[rgb(55,131,148)]">
                <h3 className="text-lg font-bold text-[rgb(55,131,148)] mb-1">Location Z – UNI</h3>
                <p className="text-sm text-gray-700 pb-2 border-b-2 border-[rgb(55,131,148)]">{locationZAddressSummary}</p>
              </div>
            </div>

            {(() => {
              const sectionsA = groupIntoSections(currentStepConfig.fieldsA);
              const sectionsZ = groupIntoSections(currentStepConfig.fieldsZ);
              const sectionCount = Math.max(sectionsA.length, sectionsZ.length);
              return Array.from({ length: sectionCount }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 gap-x-8 mt-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5 content-start pl-8 pr-8 border-l-4 border-[rgb(33,82,121)]">
                    {(sectionsA[i] || []).map((field: any) => renderField(field, 'A'))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5 content-start pl-8 border-l-4 border-[rgb(55,131,148)]">
                    {(sectionsZ[i] || []).map((field: any) => renderField(field, 'Z'))}
                  </div>
                </div>
              ));
            })()}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {currentStepConfig.fields.map((field: any) => renderField(field))}
          </div>
        )}

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
          title: 'Location A & Location Z – UNI',
          dualLocation: true,
          fieldsA: [
            // Physical address is already known from the Opportunity — shown as a
            // plain-text line under the "Location A" column title, not as inputs.

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
          fieldsZ: [
            // Physical address is already known from the Opportunity — shown as a
            // plain-text line under the "Location Z" column title, not as inputs.

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