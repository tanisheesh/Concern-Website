
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  isVisible: boolean;
}

export default function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={cn(
            'fixed inset-0 z-[100] flex items-center justify-center bg-background'
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: 'backOut',
            }}
          >
            <Image
              src="/images/concern-logo.jpg"
              alt="Concern Logo"
              width={400}
              height={100}
              className="h-auto w-80 object-contain md:w-96"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
