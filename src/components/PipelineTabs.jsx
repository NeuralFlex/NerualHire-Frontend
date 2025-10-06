// src/components/PipelineTabs.jsx
import React from 'react';

const PipelineTabs = ({ stages, stageLabels, applications, activeStage, setActiveStage }) => {

    // Function to calculate the count for each stage
    const getStageCount = (stageKey) => {
        return applications.filter(a => a.stage === stageKey).length;
    };

    return (
        <div className="bg-white border-b sticky top-[68px] z-10 shadow-sm"> {/* NOTE: top-[68px] assumes HeaderBar is 68px tall for sticky behavior */}
            <div className="flex space-x-8 px-6 py-3 overflow-x-auto">
                
                {/* We map over all the stages to create a tab for each */}
                {stages.map((stage) => {
                    const label = stageLabels[stage];
                    const count = getStageCount(stage);
                    const isActive = stage === activeStage;
                    
                    return (
                        <button
                            key={stage}
                            onClick={() => setActiveStage(stage)}
                            // Tailwind classes for the tab appearance
                            className={`
                                relative cursor-pointer py-2 text-sm font-medium whitespace-nowrap transition duration-150
                                ${isActive 
                                    // Active Tab Style: Indigo text and bottom border
                                    ? 'text-indigo-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-indigo-600'
                                    // Inactive Tab Style
                                    : 'text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            {label} 
                            {/* Display count badge */}
                            {count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold 
                                    ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineTabs;