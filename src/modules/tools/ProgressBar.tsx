import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full bg-gray-200 h-1">
    <div
      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default ProgressBar;
