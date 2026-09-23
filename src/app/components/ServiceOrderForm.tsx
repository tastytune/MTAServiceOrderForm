import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Info, MapPin, Mail } from 'lucide-react';

// Country and State/Province data
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'MX', label: 'Mexico' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const CANADA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

const UK_REGIONS = [
  'England', 'Scotland', 'Wales', 'Northern Ireland'
];

const MEXICO_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
  'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
  'Veracruz', 'Yucatán', 'Zacatecas'
];

const getStatesForCountry = (country: string) => {
  switch (country) {
    case 'US': return US_STATES;
    case 'CA': return CANADA_PROVINCES;
    case 'UK': return UK_REGIONS;
    case 'MX': return MEXICO_STATES;
    default: return [];
  }
};

// Mock address predictions to emulate the Google Places Autocomplete pattern:
// the user types a few characters of the street address and picks a full,
// pre-validated address from a dropdown, which then fills City/State/ZIP/Country.
interface AddressSuggestion {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const MOCK_ADDRESS_SUGGESTIONS: AddressSuggestion[] = [
  { line1: '742 Evergreen Terrace', city: 'Springfield', state: 'Illinois', zip: '62701', country: 'US' },
  { line1: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'California', zip: '94043', country: 'US' },
  { line1: '350 Fifth Avenue', line2: 'Empire State Building', city: 'New York', state: 'New York', zip: '10118', country: 'US' },
  { line1: '1 Infinite Loop', city: 'Cupertino', state: 'California', zip: '95014', country: 'US' },
  { line1: '221B Baker Street', city: 'London', state: 'England', zip: 'NW1 6XE', country: 'UK' },
  { line1: '1 Yonge Street', city: 'Toronto', state: 'Ontario', zip: 'M5E 1E5', country: 'CA' },
  { line1: 'Paseo de la Reforma 222', city: 'Ciudad de México', state: 'México', zip: '06600', country: 'MX' },
];

// Fallback location pools used to synthesize plausible suggestions when the
// typed text doesn't match one of the curated addresses above — real address
// autocomplete APIs always return *something* as you type, so the mock does too.
const FALLBACK_LOCATIONS: Omit<AddressSuggestion, 'line1' | 'line2'>[] = [
  { city: 'Springfield', state: 'Illinois', zip: '62701', country: 'US' },
  { city: 'Mountain View', state: 'California', zip: '94043', country: 'US' },
  { city: 'New York', state: 'New York', zip: '10118', country: 'US' },
  { city: 'Cupertino', state: 'California', zip: '95014', country: 'US' },
];

const buildFallbackSuggestions = (query: string): AddressSuggestion[] => {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const looksNumeric = /^\d+$/.test(trimmed);
  const line1 = looksNumeric ? `${trimmed} Main Street` : `${trimmed} Street`;
  return FALLBACK_LOCATIONS.map((location) => ({ line1, ...location }));
};

const getAddressSuggestions = (query: string): AddressSuggestion[] => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const knownMatches = MOCK_ADDRESS_SUGGESTIONS.filter((addr) =>
    `${addr.line1} ${addr.city} ${addr.state} ${addr.zip}`
      .toLowerCase()
      .includes(normalized),
  );

  if (knownMatches.length > 0) return knownMatches.slice(0, 5);

  // No curated address matched — synthesize suggestions so the field always
  // behaves like a real autocomplete instead of silently showing nothing.
  return buildFallbackSuggestions(query).slice(0, 4);
};

interface ServiceOrderFormProps {
  serviceType: string;
  onBack: () => void;
  onNext: (formData: any) => void;
}

export function ServiceOrderForm({ serviceType, onBack, onNext }: ServiceOrderFormProps) {
  const [formData, setFormData] = useState<any>({
    invoiceCountry: 'US', // Default to US
    billingCountry: 'US' // MTA only does business in Alaska (US) — always US
  });
  const [billingMode, setBillingMode] = useState<'existing' | 'new'>('existing');
  const [selectedBillingContact, setSelectedBillingContact] = useState<string>('LP');
  const [operationsMode, setOperationsMode] = useState<'existing' | 'new'>('existing');
  const [selectedOperationsContact, setSelectedOperationsContact] = useState<string>('LP');
  const [onsiteMode, setOnsiteMode] = useState<'existing' | 'new'>('existing');
  const [selectedOnsiteContact, setSelectedOnsiteContact] = useState<string>('PL');
  const [billingAddressMode, setBillingAddressMode] = useState<'existing' | 'new'>('existing');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('LOC1');
  const [billingAddressSuggestions, setBillingAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showBillingAddressSuggestions, setShowBillingAddressSuggestions] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBillingAddressLine1Change = (value: string) => {
    handleInputChange('billingAddressLine1', value);
    const matches = getAddressSuggestions(value);
    setBillingAddressSuggestions(matches);
    setShowBillingAddressSuggestions(matches.length > 0);
  };

  const handleSelectBillingAddressSuggestion = (address: AddressSuggestion) => {
    setFormData((prev: any) => ({
      ...prev,
      billingAddressLine1: address.line1,
      billingAddressLine2: address.line2 || '',
      billingCity: address.city,
      billingState: address.state,
      billingZip: address.zip,
      billingCountry: address.country,
    }));
    setShowBillingAddressSuggestions(false);
    setBillingAddressSuggestions([]);
  };

  const handleCountryChange = (value: string) => {
    setFormData({
      ...formData,
      invoiceCountry: value,
      invoiceState: '' // Reset state when country changes
    });
  };

  const availableStates = getStatesForCountry(formData.invoiceCountry || 'US');

  const handleSubmit = () => {
    console.log('Service Order Form submitted:', formData);
    onNext(formData);
  };

  // Generate a random service order number
  const orderNumber = React.useMemo(() => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Order Number */}
      <div className="mb-6 text-center">
      </div>

      <Card className="bg-white/95 backdrop-blur-sm shadow-xl bg-[rgba(236,248,253,0.95)] px-[32px] pt-[0px] pb-[32px] bg-[#ffffffd1] bg-[#4a7c8d] bg-[#ddf7ffb0] bg-[#ffffffd9]">
        
        
        <div className="space-y-6">
          {/* Contact Information Section */}
          <div>
            <div className="text-white -mx-8 mb-4 px-[16px] py-[12px] rounded-tl-[12px] rounded-tr-[13px] rounded-t-[12px] rounded-b-[0px] bg-[#215279fc]">
              <h3 className="font-semibold text-lg text-[#fdfeff]">Contact Information</h3>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xl font-bold text-[#215279]">Acme Corporation LLC</div>
                  <div className="text-xl font-bold text-[#215279]">Robert Johnson</div>
                  <div className="text-base text-gray-700">742 Evergreen Terrace, Springfield, IL 62701</div>
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <a href="mailto:robert.johnson@acme.com" className="hover:underline text-[#215279]">
                      robert.johnson@acme.com
                    </a>
                    <span>|</span>
                    <span>(555) 123-4567</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-[#215279]">
                    YOUR MTA BUSINESS CONTACT
                  </div>
                  <div className="text-base font-semibold text-[#215279]">Nicolas Schtumpe</div>
                  <div className="text-sm text-gray-700">
                    +1 (907) 555-0143 · rjohnson@mtasolutions.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address Information + Billing Contact Information, side
              by side as two columns (Billing Address on the left, Billing
              Contact on the right) instead of stacked full-width sections. */}
          <div className="grid grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col h-full">
            <div className="text-white px-4 py-3 mb-4 mt-6 bg-[#215279]">
              <h3 className="font-semibold text-lg text-[#ffffff]">Billing Address Information</h3>
            </div>

            {/* Conditional Content — "existing" is the default: in production
                this list is pre-populated from Salesforce and the matching
                record is already selected, so there's no separate "Select
                existing" step. "+ Create new" is offered as a lightweight
                escape hatch only for the rare case where no record matches
                (or a genuinely new address is needed). Wrapped in a flex
                column that fills the section's full (grid-stretched) height,
                so the trailing link/button lines up with the neighboring
                Billing Contact column via mt-auto below, regardless of how
                many fields each form has. */}
            <div className="flex flex-col flex-1">
            {billingAddressMode === 'existing' ? (
              /* Radio Card List — stacked single column: this section now
                 shares a row with Billing Contact, so a 2-across grid would
                 be too cramped at half width. */
              <div className="space-y-3 mb-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBillingAddress === 'LOC1'
                      ? 'bg-[#ddf4ff] border-[#215279]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedBillingAddress === 'LOC1' ? 'text-[#215279]' : 'text-gray-900'}`}>742 Evergreen Terrace</div>
                    <div className={`text-sm ${selectedBillingAddress === 'LOC1' ? 'text-[#215279]' : 'text-gray-600'}`}>Springfield, IL 62701, United States</div>
                  </div>
                  <input
                    type="radio"
                    name="billingAddress"
                    value="LOC1"
                    checked={selectedBillingAddress === 'LOC1'}
                    onChange={(e) => setSelectedBillingAddress(e.target.value)}
                    className="w-5 h-5 accent-[#215279]"
                  />
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBillingAddress === 'LOC2'
                      ? 'bg-[#ddf4ff] border-[#215279]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedBillingAddress === 'LOC2' ? 'text-[#215279]' : 'text-gray-900'}`}>1600 Amphitheatre Parkway</div>
                    <div className={`text-sm ${selectedBillingAddress === 'LOC2' ? 'text-[#215279]' : 'text-gray-600'}`}>Mountain View, CA 94043, United States</div>
                  </div>
                  <input
                    type="radio"
                    name="billingAddress"
                    value="LOC2"
                    checked={selectedBillingAddress === 'LOC2'}
                    onChange={(e) => setSelectedBillingAddress(e.target.value)}
                    className="w-5 h-5 accent-[#215279]"
                  />
                </label>
              </div>
            ) : null}

            {billingAddressMode === 'existing' ? (
              /* text-left overrides the button's default centered text —
                 without it, this button (a flex item stretched full-width
                 by its "flex flex-col" parent) renders its label centered
                 instead of flush with the radio cards above it. */
              <button
                type="button"
                onClick={() => setBillingAddressMode('new')}
                className="text-sm font-medium text-left text-[#215279] hover:underline mt-auto"
              >
                + Create new
              </button>
            ) : (
              /* Create New Address Form */
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setBillingAddressMode('existing')}
                  className="text-sm font-medium text-[#215279] hover:underline"
                >
                  ← Back to list
                </button>

                <div className="relative">
                  <Label htmlFor="billingAddressLine1" className="text-gray-600 text-sm">
                    Address Line 1
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="billingAddressLine1"
                    placeholder="Start typing an address..."
                    autoComplete="off"
                    value={formData.billingAddressLine1 || ''}
                    onChange={(e) => handleBillingAddressLine1Change(e.target.value)}
                    onFocus={() => {
                      if (billingAddressSuggestions.length > 0) {
                        setShowBillingAddressSuggestions(true);
                      }
                    }}
                    onBlur={() => setShowBillingAddressSuggestions(false)}
                    className="mt-1"
                  />

                  {showBillingAddressSuggestions && billingAddressSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                      {billingAddressSuggestions.map((address, index) => (
                        <li key={`${address.line1}-${index}`}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectBillingAddressSuggestion(address)}
                            className="w-full flex items-start gap-3 px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                          >
                            <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                            <span>
                              <span className="block text-sm text-gray-900">
                                {address.line1}
                                {address.line2 ? `, ${address.line2}` : ''}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {address.city}, {address.state} {address.zip}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <Label htmlFor="billingAddressLine2" className="text-gray-600 text-sm">
                    Address Line 2
                  </Label>
                  <Input
                    id="billingAddressLine2"
                    placeholder="Suite, unit, floor, building (optional)"
                    value={formData.billingAddressLine2 || ''}
                    onChange={(e) => handleInputChange('billingAddressLine2', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingCity" className="text-gray-600 text-sm">
                      City
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="billingCity"
                      placeholder="City"
                      value={formData.billingCity || ''}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingState" className="text-gray-600 text-sm">
                      State / Province
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <select
                      id="billingState"
                      value={formData.billingState || ''}
                      onChange={(e) => handleInputChange('billingState', e.target.value)}
                      className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                    >
                      <option value="">Select state/province</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingZip" className="text-gray-600 text-sm">
                      ZIP / Postal Code
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="billingZip"
                      placeholder={formData.billingCountry === 'US' ? '12345' : 'Postal code'}
                      value={formData.billingZip || ''}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingCountry" className="text-gray-600 text-sm">
                      Country
                    </Label>
                    {/* MTA only does business in Alaska (US), so Country is always
                        "United States" — shown as a fixed, non-editable value instead
                        of a select the user could change to something invalid. */}
                    <div
                      id="billingCountry"
                      className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 flex items-center"
                    >
                      United States
                    </div>
                  </div>
                </div>

              </div>
            )}
            </div>
          </div>

          {/* Billing Contact Section */}
          <div className="flex flex-col h-full">
            <div className="bg-[#215279] text-white px-4 py-3 mb-4 mt-6">
              <h3 className="font-semibold text-lg">Billing Contact Information</h3>
            </div>

            {/* Conditional Content — wrapped in a flex column that fills the
                section's full (grid-stretched) height, so the trailing
                link/button lines up with the neighboring Billing Address
                column via mt-auto below. "existing" is the default: in
                production this list is pre-populated from Salesforce and
                the matching contact is already selected, so there's no
                separate "Select existing" step. "+ Create new" is offered
                only as a lightweight escape hatch. */}
            <div className="flex flex-col flex-1">
            {billingMode === 'existing' ? (
              /* Radio Card List — stacked single column: this section now
                 shares a row with Billing Address, so a 2-across grid would
                 be too cramped at half width. */
              <div className="space-y-3 mb-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBillingContact === 'LP'
                      ? 'bg-[#ddf4ff] border-[#215279]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedBillingContact === 'LP'
                      ? 'bg-[#215279]/10 text-[#215279]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    LP
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedBillingContact === 'LP' ? 'text-[#215279]' : 'text-gray-900'}`}>Laura Pineda</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedBillingContact === 'LP' ? 'text-[#215279]' : 'text-gray-600'}`}>
                      Finance Director
                      <span title="l.pineda@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="billingContact"
                    value="LP"
                    checked={selectedBillingContact === 'LP'}
                    onChange={(e) => setSelectedBillingContact(e.target.value)}
                    className="w-5 h-5 accent-[#215279]"
                  />
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBillingContact === 'JM'
                      ? 'bg-[#ddf4ff] border-[#215279]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedBillingContact === 'JM'
                      ? 'bg-[#215279]/10 text-[#215279]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    JM
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedBillingContact === 'JM' ? 'text-[#215279]' : 'text-gray-900'}`}>Jorge Mejia</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedBillingContact === 'JM' ? 'text-[#215279]' : 'text-gray-600'}`}>
                      IT Manager
                      <span title="j.mejia@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="billingContact"
                    value="JM"
                    checked={selectedBillingContact === 'JM'}
                    onChange={(e) => setSelectedBillingContact(e.target.value)}
                    className="w-5 h-5 accent-[#215279]"
                  />
                </label>
              </div>
            ) : null}

            {billingMode === 'existing' ? (
              /* text-left overrides the button's default centered text —
                 without it, this button (a flex item stretched full-width
                 by its "flex flex-col" parent) renders its label centered
                 instead of flush with the radio cards above it. */
              <button
                type="button"
                onClick={() => setBillingMode('new')}
                className="text-sm font-medium text-left text-[#215279] hover:underline mt-auto"
              >
                + Create new
              </button>
            ) : (
              /* Create New Form */
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setBillingMode('existing')}
                  className="text-sm font-medium text-[#215279] hover:underline"
                >
                  ← Back to list
                </button>

                {/* Customer Invoice Address Section */}


                <div>
                  <Label className="text-gray-700 flex items-center gap-2 mb-3">
                    <span>
                      Billing Contact
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  </Label>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingContactSalutation" className="text-gray-600 text-sm">
                          Salutation
                        </Label>
                        <select
                          id="billingContactSalutation"
                          value={formData.billingContactSalutation || ''}
                          onChange={(e) => handleInputChange('billingContactSalutation', e.target.value)}
                          className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                        >
                          <option value="">--None--</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="billingContactFirstName" className="text-gray-600 text-sm">
                          First Name
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="billingContactFirstName"
                          placeholder="First Name"
                          value={formData.billingContactFirstName || ''}
                          onChange={(e) => handleInputChange('billingContactFirstName', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingContactMiddleName" className="text-gray-600 text-sm">
                          Middle Name
                        </Label>
                        <Input
                          id="billingContactMiddleName"
                          placeholder="Middle Name"
                          value={formData.billingContactMiddleName || ''}
                          onChange={(e) => handleInputChange('billingContactMiddleName', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="billingContactLastName" className="text-gray-600 text-sm">
                          Last Name
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="billingContactLastName"
                          placeholder="Last Name"
                          value={formData.billingContactLastName || ''}
                          onChange={(e) => handleInputChange('billingContactLastName', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingPhone" className="text-gray-700 flex items-center gap-2">
                      <span>
                        Phone
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </Label>
                    <Input
                      id="billingPhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.billingPhone || ''}
                      onChange={(e) => handleInputChange('billingPhone', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingEmail" className="text-gray-700 flex items-center gap-2">
                      <span>
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      placeholder="billing@example.com"
                      value={formData.billingEmail || ''}
                      onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

              </div>
            )}
            </div>
          </div>
          </div>

          {/* Operations/Technical Contact Information + Onsite Contact, side
              by side as two columns, same treatment as Billing
              Address/Billing Contact above. */}
          <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="bg-[#378394] text-white px-4 py-3 mb-4 mt-6">
              <h3 className="font-semibold text-lg">Operations/Technical Contact Information</h3>
            </div>

            {/* Conditional Content — "existing" is the default: in production
                this list is pre-populated from Salesforce and the matching
                contact is already selected, so there's no separate "Select
                existing" step. "+ Create new" is offered only as a
                lightweight escape hatch. */}
            {operationsMode === 'existing' ? (
              /* Radio Card List — stacked single column: this section now
                 shares a row with Onsite Contact, so a 2-across grid would
                 be too cramped at half width. */
              <div className="space-y-3 mb-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedOperationsContact === 'LP'
                      ? 'bg-[rgba(55,131,148,0.12)] border-[#378394]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedOperationsContact === 'LP'
                      ? 'bg-[#378394]/10 text-[#378394]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    ZP
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedOperationsContact === 'LP' ? 'text-[#378394]' : 'text-gray-900'}`}>Zutanito Pérez</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedOperationsContact === 'LP' ? 'text-[#378394]' : 'text-gray-600'}`}>
                      Operations Director
                      <span title="z.perez@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="operationsContact"
                    value="LP"
                    checked={selectedOperationsContact === 'LP'}
                    onChange={(e) => setSelectedOperationsContact(e.target.value)}
                    className="w-5 h-5 accent-[#378394]"
                  />
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedOperationsContact === 'JM'
                      ? 'bg-[rgba(55,131,148,0.12)] border-[#378394]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedOperationsContact === 'JM'
                      ? 'bg-[#378394]/10 text-[#378394]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    MO
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedOperationsContact === 'JM' ? 'text-[#378394]' : 'text-gray-900'}`}>Marcus Oliver Thompson</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedOperationsContact === 'JM' ? 'text-[#378394]' : 'text-gray-600'}`}>
                      Technical Operations Manager
                      <span title="m.thompson@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="operationsContact"
                    value="JM"
                    checked={selectedOperationsContact === 'JM'}
                    onChange={(e) => setSelectedOperationsContact(e.target.value)}
                    className="w-5 h-5 accent-[#378394]"
                  />
                </label>
              </div>
            ) : null}

            {operationsMode === 'existing' ? (
              <button
                type="button"
                onClick={() => setOperationsMode('new')}
                className="text-sm font-medium text-[#378394] hover:underline"
              >
                + Create new
              </button>
            ) : (
              /* Create New Form */
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setOperationsMode('existing')}
                  className="text-sm font-medium text-[#378394] hover:underline"
                >
                  ← Back to list
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operationsSalutation" className="text-gray-600 text-sm">
                      Salutation
                    </Label>
                    <select
                      id="operationsSalutation"
                      value={formData.operationsSalutation || ''}
                      onChange={(e) => handleInputChange('operationsSalutation', e.target.value)}
                      className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                    >
                      <option value="">--None--</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="operationsFirstName" className="text-gray-600 text-sm">
                      First Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="operationsFirstName"
                      placeholder="First Name"
                      value={formData.operationsFirstName || ''}
                      onChange={(e) => handleInputChange('operationsFirstName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operationsMiddleName" className="text-gray-600 text-sm">
                      Middle Name
                    </Label>
                    <Input
                      id="operationsMiddleName"
                      placeholder="Middle Name"
                      value={formData.operationsMiddleName || ''}
                      onChange={(e) => handleInputChange('operationsMiddleName', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="operationsLastName" className="text-gray-600 text-sm">
                      Last Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="operationsLastName"
                      placeholder="Last Name"
                      value={formData.operationsLastName || ''}
                      onChange={(e) => handleInputChange('operationsLastName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operationsPhone" className="text-gray-600 text-sm">
                      Phone
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="operationsPhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.operationsPhone || ''}
                      onChange={(e) => handleInputChange('operationsPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="operationsEmail" className="text-gray-600 text-sm">
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="operationsEmail"
                      type="email"
                      placeholder="operations@example.com"
                      value={formData.operationsEmail || ''}
                      onChange={(e) => handleInputChange('operationsEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Onsite Contact Section */}
          <div>
            <div className="bg-[#378394] text-white px-4 py-3 mb-4 mt-6">
              <h3 className="font-semibold text-lg">Onsite Contact</h3>
            </div>

            {/* Conditional Content — "existing" is the default: in production
                this list is pre-populated from Salesforce and the matching
                contact is already selected, so there's no separate "Select
                existing" step. "+ Create new" is offered only as a
                lightweight escape hatch. */}
            {onsiteMode === 'existing' ? (
              /* Radio Card List — stacked single column: this section now
                 shares a row with Operations/Technical Contact, so a
                 2-across grid would be too cramped at half width. */
              <div className="space-y-3 mb-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedOnsiteContact === 'PL'
                      ? 'bg-[rgba(55,131,148,0.12)] border-[#378394]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedOnsiteContact === 'PL'
                      ? 'bg-[#378394]/10 text-[#378394]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    PL
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedOnsiteContact === 'PL' ? 'text-[#378394]' : 'text-gray-900'}`}>Perenganito López</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedOnsiteContact === 'PL' ? 'text-[#378394]' : 'text-gray-600'}`}>
                      Onsite Coordinator
                      <span title="p.lopez@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="onsiteContact"
                    value="PL"
                    checked={selectedOnsiteContact === 'PL'}
                    onChange={(e) => setSelectedOnsiteContact(e.target.value)}
                    className="w-5 h-5 accent-[#378394]"
                  />
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedOnsiteContact === 'DAM'
                      ? 'bg-[rgba(55,131,148,0.12)] border-[#378394]'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedOnsiteContact === 'DAM'
                      ? 'bg-[#378394]/10 text-[#378394]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    DA
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${selectedOnsiteContact === 'DAM' ? 'text-[#378394]' : 'text-gray-900'}`}>Diego Armando Maradona</div>
                    <div className={`flex items-center gap-1.5 text-sm ${selectedOnsiteContact === 'DAM' ? 'text-[#378394]' : 'text-gray-600'}`}>
                      Site Manager
                      <span title="d.maradona@empresa.com" className="inline-flex">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-label="Email" />
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="onsiteContact"
                    value="DAM"
                    checked={selectedOnsiteContact === 'DAM'}
                    onChange={(e) => setSelectedOnsiteContact(e.target.value)}
                    className="w-5 h-5 accent-[#378394]"
                  />
                </label>
              </div>
            ) : null}

            {onsiteMode === 'existing' ? (
              <button
                type="button"
                onClick={() => setOnsiteMode('new')}
                className="text-sm font-medium text-[#378394] hover:underline"
              >
                + Create new
              </button>
            ) : (
              /* Create New Form */
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setOnsiteMode('existing')}
                  className="text-sm font-medium text-[#378394] hover:underline"
                >
                  ← Back to list
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="onsiteSalutation" className="text-gray-600 text-sm">
                      Salutation
                    </Label>
                    <select
                      id="onsiteSalutation"
                      value={formData.onsiteSalutation || ''}
                      onChange={(e) => handleInputChange('onsiteSalutation', e.target.value)}
                      className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                    >
                      <option value="">--None--</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="onsiteFirstName" className="text-gray-600 text-sm">
                      First Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="onsiteFirstName"
                      placeholder="First Name"
                      value={formData.onsiteFirstName || ''}
                      onChange={(e) => handleInputChange('onsiteFirstName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="onsiteMiddleName" className="text-gray-600 text-sm">
                      Middle Name
                    </Label>
                    <Input
                      id="onsiteMiddleName"
                      placeholder="Middle Name"
                      value={formData.onsiteMiddleName || ''}
                      onChange={(e) => handleInputChange('onsiteMiddleName', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="onsiteLastName" className="text-gray-600 text-sm">
                      Last Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="onsiteLastName"
                      placeholder="Last Name"
                      value={formData.onsiteLastName || ''}
                      onChange={(e) => handleInputChange('onsiteLastName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="onsitePhone" className="text-gray-600 text-sm">
                      Phone
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="onsitePhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.onsitePhone || ''}
                      onChange={(e) => handleInputChange('onsitePhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="onsiteEmail" className="text-gray-600 text-sm">
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="onsiteEmail"
                      type="email"
                      placeholder="onsite@example.com"
                      value={formData.onsiteEmail || ''}
                      onChange={(e) => handleInputChange('onsiteEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
          </div>

          {/* Escalation Contact Section */}
          <div>
            <div className="bg-[#215279] text-white px-4 py-3 mb-4 mt-6">
              <h3 className="font-semibold text-lg">Escalation Contact</h3>
            </div>

            {/* Escalation Contact 1 + Escalation Contact 2, side by side as
                two columns under the shared "Escalation Contact" header,
                same treatment as the contact sections above. */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-700 flex items-center gap-2 mb-3">
                  <span>
                    Escalation Contact 1
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </Label>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalation1Salutation" className="text-gray-600 text-sm">
                        Salutation
                      </Label>
                      <select
                        id="escalation1Salutation"
                        value={formData.escalation1Salutation || ''}
                        onChange={(e) => handleInputChange('escalation1Salutation', e.target.value)}
                        className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                      >
                        <option value="">--None--</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="escalation1FirstName" className="text-gray-600 text-sm">
                        First Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="escalation1FirstName"
                        placeholder="First Name"
                        value={formData.escalation1FirstName || ''}
                        onChange={(e) => handleInputChange('escalation1FirstName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalation1MiddleName" className="text-gray-600 text-sm">
                        Middle Name
                      </Label>
                      <Input
                        id="escalation1MiddleName"
                        placeholder="Middle Name"
                        value={formData.escalation1MiddleName || ''}
                        onChange={(e) => handleInputChange('escalation1MiddleName', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="escalation1LastName" className="text-gray-600 text-sm">
                        Last Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="escalation1LastName"
                        placeholder="Last Name"
                        value={formData.escalation1LastName || ''}
                        onChange={(e) => handleInputChange('escalation1LastName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalationPhone1" className="text-gray-600 text-sm">
                        Phone
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="escalationPhone1"
                        placeholder="+1 (555) 123-4567"
                        value={formData.escalationPhone1 || ''}
                        onChange={(e) => handleInputChange('escalationPhone1', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="escalationEmail1" className="text-gray-600 text-sm">
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="escalationEmail1"
                        type="email"
                        placeholder="escalation1@example.com"
                        value={formData.escalationEmail1 || ''}
                        onChange={(e) => handleInputChange('escalationEmail1', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 flex items-center gap-2 mb-3">
                  <span>Escalation Contact 2</span>
                </Label>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalation2Salutation" className="text-gray-600 text-sm">
                        Salutation
                      </Label>
                      <select
                        id="escalation2Salutation"
                        value={formData.escalation2Salutation || ''}
                        onChange={(e) => handleInputChange('escalation2Salutation', e.target.value)}
                        className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                      >
                        <option value="">--None--</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="escalation2FirstName" className="text-gray-600 text-sm">
                        First Name
                      </Label>
                      <Input
                        id="escalation2FirstName"
                        placeholder="First Name"
                        value={formData.escalation2FirstName || ''}
                        onChange={(e) => handleInputChange('escalation2FirstName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalation2MiddleName" className="text-gray-600 text-sm">
                        Middle Name
                      </Label>
                      <Input
                        id="escalation2MiddleName"
                        placeholder="Middle Name"
                        value={formData.escalation2MiddleName || ''}
                        onChange={(e) => handleInputChange('escalation2MiddleName', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="escalation2LastName" className="text-gray-600 text-sm">
                        Last Name
                      </Label>
                      <Input
                        id="escalation2LastName"
                        placeholder="Last Name"
                        value={formData.escalation2LastName || ''}
                        onChange={(e) => handleInputChange('escalation2LastName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="escalationPhone2" className="text-gray-600 text-sm">
                        Phone
                      </Label>
                      <Input
                        id="escalationPhone2"
                        placeholder="+1 (555) 123-4567"
                        value={formData.escalationPhone2 || ''}
                        onChange={(e) => handleInputChange('escalationPhone2', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="escalationEmail2" className="text-gray-600 text-sm">
                        Email
                      </Label>
                      <Input
                        id="escalationEmail2"
                        type="email"
                        placeholder="escalation2@example.com"
                        value={formData.escalationEmail2 || ''}
                        onChange={(e) => handleInputChange('escalationEmail2', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div>
            <div className="bg-[#215279] text-white px-4 py-3 mb-4 mt-6">
              <h3 className="font-semibold text-lg">Signatures</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="signatoryTitle" className="text-gray-700 flex items-center gap-2">
                  <span>
                    Title
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </Label>
                <Input
                  id="signatoryTitle"
                  placeholder="Enter signatory title"
                  value={formData.signatoryTitle || ''}
                  onChange={(e) => handleInputChange('signatoryTitle', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signatorySalutation" className="text-gray-600 text-sm">
                    Salutation
                  </Label>
                  <select
                    id="signatorySalutation"
                    value={formData.signatorySalutation || ''}
                    onChange={(e) => handleInputChange('signatorySalutation', e.target.value)}
                    className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-background"
                  >
                    <option value="">--None--</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="signatoryFirstName" className="text-gray-600 text-sm">
                    First Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="signatoryFirstName"
                    placeholder="First Name"
                    value={formData.signatoryFirstName || ''}
                    onChange={(e) => handleInputChange('signatoryFirstName', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signatoryMiddleName" className="text-gray-600 text-sm">
                    Middle Name
                  </Label>
                  <Input
                    id="signatoryMiddleName"
                    placeholder="Middle Name"
                    value={formData.signatoryMiddleName || ''}
                    onChange={(e) => handleInputChange('signatoryMiddleName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="signatoryLastName" className="text-gray-600 text-sm">
                    Last Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="signatoryLastName"
                    placeholder="Last Name"
                    value={formData.signatoryLastName || ''}
                    onChange={(e) => handleInputChange('signatoryLastName', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg border-2 border-[#215279] text-[#215279] font-medium hover:border-[#215279] transition-colors"
          >
            Back
          </button>
          
          <button 
            onClick={handleSubmit}
            className="px-8 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-[rgba(99,224,201,0.6)_0px_6px_0px_0px]"
            style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}
          >
            Continue to Service Details
          </button>
        </div>
      </Card>
    </div>
  );
}