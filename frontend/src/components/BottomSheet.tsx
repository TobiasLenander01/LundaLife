// BottomSheet.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useDrag } from '@use-gesture/react';

interface BottomSheetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: React.ReactNode;
  peekHeight?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onOpen,
  onClose,
  children,
  peekHeight = 80,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    if (sheetRef.current) {
      const sheetHeight = sheetRef.current.offsetHeight;
      const openY = 0;
      const closedY = sheetHeight - peekHeight;

      animate(y, isOpen ? openY : closedY, {
        type: 'spring',
        damping: 25,
        stiffness: 250,
      });
    }
  }, [isOpen, peekHeight, y]);

  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy], memo = y.get() }) => {
      if (vy > 0.5 && dy > 0) {
        onClose();
      } else if (vy > 0.5 && dy < 0) {
        onOpen();
      } else if (last) {
        const sheetHeight = sheetRef.current?.offsetHeight ?? window.innerHeight;
        if (memo + my < sheetHeight / 2) {
          onOpen();
        } else {
          onClose();
        }
      } else {
        y.set(memo + my);
      }
      return memo;
    },
    {
      from: () => [0, y.get()],
      bounds: { top: 0 },
      rubberband: 0.2,
      axis: 'y',
    }
  );

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
      
      <motion.div
        ref={sheetRef}
        {...bind() as any}
        className={`
          absolute bottom-0 left-0 right-0
          w-full bg-white rounded-t-2xl shadow-lg
          p-4 pt-6
          pointer-events-auto
          touch-none
        `}
        style={{ y }}
        role="dialog"
        aria-modal="false"
      >
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        />
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default BottomSheet;