import React from "react";
import { FiPlus } from "react-icons/fi"; // Feather Icons

const PlusIconWithTooltip = ({color}) => {
  return (
    <div className="relative inline-block group">
      {/* Plus Icon */}
      <button className={`p-2  ${color?color:"bg-blue-500"} text-white rounded-full hover:bg-blue-600 transition-colors`}>
        <FiPlus size={24} />
      </button>

      {/* Tooltip */}
      <span className="absolute left-1/2 bottom-full mb-2 w-max transform -translate-x-1/2 
        bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 
        transition-opacity pointer-events-none whitespace-nowrap">
        Add New Item
      </span>
    </div>
  );
};

export default PlusIconWithTooltip;
