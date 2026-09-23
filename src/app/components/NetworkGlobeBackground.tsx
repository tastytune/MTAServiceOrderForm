import React from 'react';

// A lightweight, original animation evoking MTA's "network map" visual
// language (globe + PoP markers + connecting lines) — hand-drawn stylized
// shapes and CSS/SVG animation, not a copy of any source site's assets or
// code. Meant to sit behind the form at low opacity (see App.tsx), so it's
// kept simple and low-contrast rather than a literal geographic map.

const LOCATIONS = [
  { name: 'Fairbanks', x: 430, y: 210 },
  { name: 'Wasilla', x: 385, y: 285 },
  { name: 'Palmer', x: 460, y: 275 },
  { name: 'Anchorage', x: 400, y: 330 },
  { name: 'Ft. St. John', x: 660, y: 300 },
  { name: 'Calgary', x: 745, y: 365 },
  { name: 'Seattle', x: 615, y: 430 },
  { name: 'Portland', x: 605, y: 470 },
  { name: 'Chicago', x: 910, y: 350 },
];

// Curved connector paths between the markers above, grouped roughly the
// same way as the reference: a small ring around the Alaska cluster, two
// long arcs reaching south to Seattle/Portland, and a wider loop linking
// Ft. St. John / Calgary / Chicago.
const CONNECTIONS = [
  'M430,210 Q460,250 460,275',
  'M460,275 Q430,310 400,330',
  'M400,330 Q385,300 385,285',
  'M385,285 Q400,240 430,210',
  'M400,330 Q480,420 615,430',
  'M385,285 Q470,440 605,470',
  'M660,300 Q700,330 745,365',
  'M745,365 Q820,300 910,350',
  'M660,300 Q780,270 910,350',
  'M660,300 Q630,370 615,430',
  'M745,365 Q680,400 615,430',
];

export function NetworkGlobeBackground() {
  return (
    <div className="w-full h-full overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <style>{`
        @keyframes ngPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes ngDashFlow {
          to { stroke-dashoffset: -48; }
        }
        @keyframes ngDrift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .ng-pulse-ring {
          transform-origin: center;
          transform-box: fill-box;
          animation: ngPulse 2.8s ease-out infinite;
        }
        .ng-connection {
          stroke-dasharray: 6 10;
          animation: ngDashFlow 3.4s linear infinite;
        }
        .ng-drift {
          animation: ngDrift 11s ease-in-out infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 1200 700"
        className="w-full h-full ng-drift"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ngGlobe" cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="rgb(45,100,145)" />
            <stop offset="55%" stopColor="rgb(33,82,121)" />
            <stop offset="100%" stopColor="rgb(20,50,75)" />
          </radialGradient>
          <linearGradient id="ngLand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(99,224,201)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="rgb(15,122,111)" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Globe */}
        <circle cx="600" cy="350" r="420" fill="url(#ngGlobe)" />
        <circle cx="600" cy="350" r="420" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Latitude / longitude guide lines */}
        <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
          <ellipse cx="600" cy="350" rx="420" ry="140" />
          <ellipse cx="600" cy="350" rx="420" ry="280" />
          <ellipse cx="600" cy="350" rx="140" ry="420" />
          <ellipse cx="600" cy="350" rx="280" ry="420" />
        </g>

        {/* Stylized landmass blobs — simplified, original shapes, not a
            traced geographic map. */}
        <path
          d="M330,150 C300,190 290,250 330,290 C350,320 390,300 410,260 C440,220 430,170 400,150 C380,135 350,130 330,150 Z"
          fill="url(#ngLand)"
        />
        <path
          d="M420,260 C500,220 620,240 700,280 C820,260 950,300 990,360 C1010,400 960,430 900,410 C800,440 700,420 640,460 C560,500 470,470 440,410 C400,360 390,300 420,260 Z"
          fill="url(#ngLand)"
        />

        {/* Connections — flowing dashed lines between PoPs */}
        {CONNECTIONS.map((d, i) => (
          <path
            key={i}
            d={d}
            className="ng-connection"
            stroke="rgba(153,255,230,0.8)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ animationDelay: `${(i % 5) * -0.6}s` }}
          />
        ))}

        {/* Location markers — pulsing PoP dots */}
        {LOCATIONS.map((loc, i) => (
          <g key={loc.name}>
            <circle
              className="ng-pulse-ring"
              cx={loc.x}
              cy={loc.y}
              r="6"
              fill="rgba(153,255,230,0.55)"
              style={{ animationDelay: `${(i % 6) * -0.45}s` }}
            />
            <circle cx={loc.x} cy={loc.y} r="4.5" fill="rgb(99,224,201)" stroke="rgb(15,122,111)" strokeWidth="1" />
            <text x={loc.x + 10} y={loc.y + 4} fontSize="13" fontWeight="600" fill="rgba(255,255,255,0.85)">
              {loc.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
