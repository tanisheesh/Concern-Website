import { cn } from "@/lib/utils";

const colors = [
  'text-[#347515]',
  'text-[#3c8616]',
  'text-[#479d1b]',
  'text-[#52b31c]',
  'text-[#5bca20]',
  'text-[#67df26]',
  'text-[#71ef31]',
];

export const ConcernLogo = ({ className }: { className?: string }) => (
  <div className={cn('flex font-bold', className)}>
    {'CONCERN'.split('').map((char, index) => (
      <span key={index} className={colors[index]}>
        {char}
      </span>
    ))}
  </div>
);

