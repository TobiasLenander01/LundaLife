'use client';

import { ReactNode } from 'react';
import { Drawer } from 'vaul';

// Collapsed (header only), half screen, and fully expanded
export const SNAP_POINTS: (number | string)[] = ['148px', 0.55, 1];

interface BottomSheetProps {
  title: string;
  snap: number | string | null;
  onSnapChange: (snap: number | string | null) => void;
  children: ReactNode;
}

/**
 * A bottom sheet that is always open and can be dragged between snap points (mobile only).
 * It is non-modal, so the map behind it stays interactive.
 */
export default function BottomSheet({ title, snap, onSnapChange, children }: BottomSheetProps) {
  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={onSnapChange}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-20 flex h-full max-h-[calc(100%-4.5rem-env(safe-area-inset-top))] flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.12)] outline-none md:hidden"
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>

          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-3">
            <div className="h-1.5 w-10 rounded-full bg-slate-300" />
          </div>

          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
