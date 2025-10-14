import React from "react";

const PipelineTabs = ({ stages, stageLabels, applications, activeStage, setActiveStage }) => {
  const getStageCount = (stageKey) => applications.filter(a => a.stage === stageKey).length;

  return (
    <div className="bg-white border-b sticky top-[68px] z-10 shadow-sm">
      <div className="flex space-x-8 px-6 py-3 overflow-x-auto">
        {stages.map((stage) => {
          const label = stageLabels[stage];
          const count = getStageCount(stage);
          const isActive = stage === activeStage;

          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`
                relative cursor-pointer py-2 text-sm font-medium whitespace-nowrap transition duration-150
                ${isActive 
                  ? 'text-[#D64948] after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D64948]'
                  : 'text-gray-500 hover:text-[#3F4040]'
                }
              `}
            >
              {label}
              {count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? "bg-[#FCEAEA] text-[#D64948]" : "bg-gray-100 text-gray-700"
                  }`}
                >
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
