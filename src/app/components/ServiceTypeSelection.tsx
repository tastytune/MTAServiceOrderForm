import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Check } from 'lucide-react';

interface ServiceTypeSelectionProps {
  onSelectService: (serviceType: string) => void;
}

const serviceTypes = [
  { 
    id: 'DIA', 
    name: 'DIA', 
    description: 'Dedicated Internet Access',
    price: '299',
    features: [
      'Dedicated bandwidth',
      'Guaranteed upload/download speeds',
      '24/7 network monitoring'
    ]
  },
  { 
    id: 'EPL_P2P', 
    name: 'EPL Point-to-Point', 
    description: 'Ethernet Private Line',
    price: '399',
    features: [
      'Point-to-point connectivity',
      'Low latency connection',
      'Scalable bandwidth options'
    ]
  },
  { 
    id: 'EVPL_P2P', 
    name: 'EVPL Point-to-Point', 
    description: 'Ethernet Virtual Private Line',
    price: '349',
    features: [
      'Virtual private line',
      'Flexible VLAN configuration',
      'Cost-effective solution'
    ]
  },
  { 
    id: 'ACCESS_EPL', 
    name: 'Access EPL', 
    description: 'Access Ethernet Private Line',
    price: '249',
    features: [
      'Last-mile connectivity',
      'Carrier-grade reliability',
      'Flexible interface options'
    ]
  },
  { 
    id: 'ACCESS_EVPL', 
    name: 'Access EVPL', 
    description: 'Access Ethernet Virtual Private Line',
    price: '229',
    features: [
      'Virtual access connectivity',
      'Multi-tenant support',
      'Enhanced bandwidth efficiency'
    ]
  },
  { 
    id: 'ENNI', 
    name: 'ENNI', 
    description: 'External Network to Network Interface',
    price: '499',
    features: [
      'Network interconnection',
      'High-capacity interfaces',
      'Carrier-to-carrier connectivity'
    ]
  },
];

export function ServiceTypeSelection({ onSelectService }: ServiceTypeSelectionProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl mb-2 text-white font-normal">  <span className="text-white/90 font-normal">Select your </span>
                    <span className="text-white font-bold">Service Type</span></h1>
        <p className="text-white/90">Please select the service type you are onboarding</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {serviceTypes.map((service) => (
          <Card 
            key={service.id}
            className="p-8 bg-white backdrop-blur-sm hover:shadow-2xl transition-all border flex flex-col hover:scale-105 cursor-pointer"
          >
            <div className="text-center mb-6">
              <h3 className="mb-2" style={{ color: '#215279', fontWeight: 800, fontSize: '32px' }}>{service.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            </div>
            

            
            <button 
              onClick={() => onSelectService(service.id)}
              className="w-full px-6 py-3 rounded-lg text-white font-semibold transition-shadow hover:shadow-[rgba(99,224,201,0.6)_0px_6px_0px_0px]"
              style={{ background: 'linear-gradient(to right, rgb(33, 82, 121), rgb(99, 224, 201))' }}
            >
              SELECT SERVICE
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}