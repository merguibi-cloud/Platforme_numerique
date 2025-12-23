"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterButtonProps {
  label: string;
  options?: string[];
  onSelect?: (value: string) => void;
}

export const FilterButton = ({
  label,
  options,
  onSelect,
}: FilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value: string) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => (options ? setIsOpen((prev) => !prev) : onSelect?.(label))}
        className="inline-flex items-center space-x-2 border border-[#032622] px-4 py-2 hover:bg-[#eae5cf] transition-colors"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && options && (
        <div className="absolute z-20 mt-2 w-48 border border-[#032622] bg-[#F8F5E4] shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left px-4 py-2 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

