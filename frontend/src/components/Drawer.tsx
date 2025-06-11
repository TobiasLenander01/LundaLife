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
      {/* Overlay behind the drawer */}
      <VaulDrawer.Overlay className="fixed inset-0 bg-black/50" />

      {/* The actual drawer*/}
      <VaulDrawer.Portal>
        <VaulDrawer.Content className="fixed flex flex-col bg-white rounded-t-[20px] bottom-0 left-0 right-0 top-[15vh] h-full">
          {/* VaulDrawer.Title is required for screen readers */}
          <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>

          {/* This div holds the content of the drawer */}
          <div className="p-4 flex-1 h-full rounded-t-[10px] overflow-y-auto">

            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            
            {/* Children content */}
            <div>
              {children}
            </div>

          </div>

        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}