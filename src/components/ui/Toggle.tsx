import type { ReactNode } from 'react';

interface ToggleProps {
  leftLabel: ReactNode;
  rightLabel: ReactNode;
  isLeft: boolean;
  onToggle: () => void;
}

export default function Toggle({ leftLabel, rightLabel, isLeft, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 cursor-pointer text-sm select-none"
      role="switch"
      aria-checked={!isLeft}
    >
      <span className={isLeft ? 'font-bold text-navy-dark' : 'text-gray-400'}>{leftLabel}</span>
      <span
        className={`relative inline-block w-10 h-5 rounded-full transition-colors ${
          isLeft ? 'bg-gray-300' : 'bg-navy-dark'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            !isLeft ? 'translate-x-5' : ''
          }`}
        />
      </span>
      <span className={!isLeft ? 'font-bold text-navy-dark' : 'text-gray-400'}>{rightLabel}</span>
    </button>
  );
}
