import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * A non-modal BottomSheet that allows interaction with the content behind it.
 */
const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  return (
    // Main container. It covers the screen but is non-interactive.
    <div
      className={`
        fixed inset-0 z-50 flex items-end
        ${/* 
          THIS IS THE KEY FIX: The container is non-interactive, allowing
          clicks to pass through to the content behind it.
        */''}
        pointer-events-none
        transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}
      aria-hidden={!isOpen}
    >
      {/* Semi-transparent backdrop (inherits pointer-events-none) */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* The sheet panel */}
      <div
        className={`
          relative w-full bg-white rounded-t-2xl shadow-lg
          transform transition-transform duration-300 ease-in-out
          p-4 pt-6
          ${/* 
            THIS IS THE OTHER HALF OF THE FIX: We explicitly re-enable
            pointer events for the sheet panel itself.
          */''}
          pointer-events-auto
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        role="dialog"
        aria-modal="false"
      >
        {/* Grabber handle */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"
          aria-hidden="true"
        />

        {/* Content area */}
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;