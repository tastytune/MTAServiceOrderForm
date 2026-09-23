import React from 'react';
import { Card } from '@/app/components/ui/card';
import mtaLogo from 'figma:asset/d95948f19ab7cdceaf369a28bb082f71bb4b04b3.png';

interface TaskListScreenProps {
  onSelectTask: (taskName: string) => void;
}

export function TaskListScreen({ onSelectTask }: TaskListScreenProps) {
  const tasks = [
    {
      name: 'EPL',
      amount: '—',
      stage: 'Pending',
      owner: 'Robert Johnson',
      dueDate: 'Jun 06',
      color: 'bg-orange-500'
    },
    {
      name: 'DIA',
      amount: '—',
      stage: 'Pending',
      owner: 'Robert Johnson',
      dueDate: 'Jun 20',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="max-w-8xl mx-auto bg-[#98636300]">
      {/* Contact Information Header — MTA logo on the left, directly under
          the "Local Mission. Global Vision." tagline baked into the globe
          background image. The Acme Corporation text is pinned to the
          top-right corner with absolute positioning (rather than relying on
          a flex "justify-between" against the logo), so it stays put in the
          corner regardless of the logo's own size or load state. */}
      <div className="relative w-full mb-6">
        <img src={mtaLogo} alt="MTA Logo" className="w-56 h-auto" />

        {/* No card, no border — just discreet white text sitting on the
            background image, matching the logo's own understated look. */}
        <div className="absolute -top-4 right-0 text-right">
          <div className="text-white font-semibold text-sm">Acme Corporation LLC</div>
          <div className="text-white/80 text-xs">Robert Johnson</div>
        </div>
      </div>

      <Card className="w-[60%] mx-auto bg-[rgba(236,248,253,0.95)] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#215279] text-white text-left text-sm font-semibold">
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  onClick={() => onSelectTask(task.name)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.color}`}></div>
                      <span className="text-gray-900 font-medium">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {task.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-100 text-[#215279] rounded-full text-xs font-medium">
                      {task.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {task.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
