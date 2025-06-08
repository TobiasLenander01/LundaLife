'use client';

import { useState } from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import React from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
}

const snapPoints = ['200px', '500px', 1];

export default function Drawer({ open, onOpenChange, children, title }: DrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      fadeFromIndex={1}
    >
      <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
      <VaulDrawer.Portal>
        <VaulDrawer.Content
          data-testid="content"
          className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]"
        >
          <VaulDrawer.Title className="sr-only">{title}</VaulDrawer.Title>
          <div className="p-4 bg-white flex-1 h-full rounded-t-[10px]">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
            <div className="max-w-md mx-auto">
              {children}
            </div>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}