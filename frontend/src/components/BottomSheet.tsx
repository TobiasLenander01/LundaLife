'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { Drawer } from 'vaul';
import type { ReactNode } from 'react';

interface VaulDrawerProps {
  children: ReactNode;
  title: string;
}

const snapPoints = ['148px', '800px', 1];

export default function BottomSheet({ children, title }: VaulDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  
  const FADE_FROM_INDEX = 1;

  return (
    <Drawer.Root
      open={true}
      dismissible={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      fadeFromIndex={FADE_FROM_INDEX}
    >
      <Drawer.Overlay className="fixed inset-0 bg-black/60 pointer-events-none" />
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-3xl bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]"
        >
          <div
            className={clsx('flex flex-col max-w-md mx-auto w-full p-4 pt-5', {
              'overflow-y-auto': snap === 1,
              'overflow-hidden': snap !== 1,
            })}
          >
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-4" />
            <Drawer.Title className="sr-only">{title}</Drawer.Title>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}