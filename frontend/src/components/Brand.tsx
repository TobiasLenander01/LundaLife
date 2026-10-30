import Image from 'next/image';

interface BrandProps {
  // Show the tagline under the name (desktop side panel)
  showTagline?: boolean;
}

export default function Brand({ showTagline = false }: BrandProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Image src="/images/logo.png" alt="" width={40} height={40} loading="eager" className="size-9 shrink-0" />
      <div className="leading-tight">
        <span className="block text-lg font-semibold tracking-tight text-brand">LundaLife</span>
        {showTagline && <span className="block text-sm text-slate-500">What&apos;s on at the nations</span>}
      </div>
    </div>
  );
}
