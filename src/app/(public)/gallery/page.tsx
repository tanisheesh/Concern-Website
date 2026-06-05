
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Building2,
  FileText,
  ClipboardCheck,
  Users,
  Megaphone,
  Award,
  CalendarDays,
  Video,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PROGRAMME_ALBUMS, SPECIAL_ALBUMS, YEAR_ALBUMS, type Album } from '@/lib/albums';

const EmblemOfIndia = () => (
    <Image 
        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
        alt="Emblem of India"
        width={48}
        height={48}
        className="mx-auto h-10 w-10 text-primary transition-colors duration-300 group-hover:text-accent md:h-12 md:w-12"
    />
);

const programmeIconMap: Record<string, React.ElementType> = {
  'ministry-of-social-justice-and-empowerment': EmblemOfIndia,
  'synopsis': FileText,
  'training-programmes': ClipboardCheck,
  'video-clips': Video,
  'concern-premises': Building2,
  'awareness-programmes': Megaphone,
  'award-recognitions': Award,
  'sanctuary': HeartHandshake,
};



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};



export default function GalleryPage() {
  const programmeAlbums = PROGRAMME_ALBUMS;
  const yearAlbums = YEAR_ALBUMS;

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <motion.h1 
        className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Photo & Video Gallery
      </motion.h1>
      
      <section>
        <motion.h2 
            className="mb-6 text-center text-2xl font-bold text-primary/90 md:text-3xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            Programmes & Events
        </motion.h2>
        <motion.div 
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {programmeAlbums.map((album) => {
            const IconComponent = programmeIconMap[album.slug] || Users;
            return (
                <motion.div key={album.slug} variants={itemVariants}>
                    <Link href={`/gallery/${album.slug}`} className="group">
                        <Card className="flex h-full transform flex-col items-center justify-center text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                            <CardHeader>
                                <IconComponent className="mx-auto h-10 w-10 text-primary transition-colors duration-300 group-hover:text-accent md:h-12 md:w-12" />
                            </CardHeader>
                            <CardContent>
                            <p className="font-semibold text-sm md:text-base">{album.title}</p>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            );
          })}
        </motion.div>

        {/* Video Clips + Sanctuary — centered pair on desktop, normal grid on mobile */}
        <motion.div
            className="mt-6 grid grid-cols-2 gap-4 md:flex md:justify-center md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {SPECIAL_ALBUMS.map((album) => {
                const IconComponent = programmeIconMap[album.slug] || Users;
                return (
                    <motion.div key={album.slug} variants={itemVariants} className="md:w-1/3">
                        <Link href={`/gallery/${album.slug}`} className="group">
                            <Card className="flex h-full transform flex-col items-center justify-center text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                                <CardHeader>
                                    <IconComponent className="mx-auto h-10 w-10 text-primary transition-colors duration-300 group-hover:text-accent md:h-12 md:w-12" />
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold text-sm md:text-base">{album.title}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
      </section>

      <section className="mt-16">
        <motion.h2 
            className="mb-6 text-center text-2xl font-bold text-primary/90 md:text-3xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            By Year
        </motion.h2>
        <motion.div 
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 md:gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {yearAlbums.map((album) => (
             <motion.div key={album.slug} variants={itemVariants}>
                <Link href={`/gallery/${album.slug}`} className="group">
                <Card className="flex h-full transform flex-col items-center justify-center p-2 text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <CardHeader className="p-2">
                        <CalendarDays className="mx-auto h-8 w-8 text-primary transition-colors duration-300 group-hover:text-accent md:h-10 md:w-10" />
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="font-semibold text-sm md:text-base">{album.title}</p>
                    </CardContent>
                </Card>
                </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
