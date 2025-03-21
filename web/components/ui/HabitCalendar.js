// web/components/ui/HabitCalendar.js (Suggested)
import React from 'react';
import { Tooltip } from 'react-tooltip'; // Assuming a tooltip library is added

export default function HabitCalendar({ data }) {
    return (
        <div>
            {data.map((month, index) => (
                <div key={index} className="mb-6">
                    <h4 className="text-lg text-blue-300 mb-2">{month.name}</h4>
                    <div className="grid grid-cols-7 gap-1">
                        {Object.entries(month.days).map(([day, completed]) => (
                            <div
                                key={day}
                                data-tooltip-id={`day-${month.name}-${day}`}
                                className={`w-8 h-8 flex items-center justify-center rounded-sm ${
                                    completed
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {day}
                                <Tooltip id={`day-${month.name}-${day}`} place="top">
                                    {completed ? 'Completed' : 'Not Completed'} - {month.name} {day}
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
