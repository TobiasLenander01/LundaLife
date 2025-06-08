'use client';

import { Drawer as VaulDrawer } from 'vaul';
import React from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function Drawer({ open, onOpenChange, children }: DrawerProps) {

  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
      <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
      <VaulDrawer.Portal>
        <VaulDrawer.Content data-testid="content" className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]">
          <VaulDrawer.Title className="sr-only">Title</VaulDrawer.Title> {/* Required for screen readers */}
          <div className="p-4 bg-white flex-1 h-full rounded-t-[10px] overflow-y-auto">

            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />

            {/* Content */}
            <div className="max-w-md mx-auto">
              {children}
            </div>

          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}