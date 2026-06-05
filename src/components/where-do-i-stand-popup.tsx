'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function WhereDoIStandPopup() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/assessments')}
      aria-label="Where do i stand? Go to assessments"
      className="group fixed bottom-4 left-4 z-50 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <div className="ml-3 flex flex-col items-center">
        <div className="animate-text-flicker relative mb-1 rounded-2xl bg-primary px-3.5 py-2 text-center shadow-lg">
          <span className="whitespace-nowrap text-sm font-semibold text-primary-foreground">
            Where do i stand?
          </span>
          <span
            className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-primary"
            aria-hidden="true"
          />
        </div>
        <Image
          src="/images/DoubtEmoji-jukebox-bg-removed.png"
          alt=""
          width={72}
          height={72}
          className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-md transition-transform group-hover:scale-110 sm:h-20 sm:w-20"
        />
      </div>
    </button>
  );
}
