
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
import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Since this is a client component, we cannot export metadata directly.
// It should be defined on a parent server component or layout if server-side rendering is needed.

const EmblemOfIndia = () => (
    <Image 
        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
        alt="Emblem of India"
        width={48}
        height={48}
        className="mx-auto h-10 w-10 text-primary transition-colors duration-300 group-hover:text-accent md:h-12 md:w-12"
    />
);

const programmeIconMap: { [key: string]: React.ElementType } = {
  'ministry-of-social-justice-and-empowerment': EmblemOfIndia,
  'synopsis': FileText,
  'training-programmes': ClipboardCheck,
  'video-clips': Video,
  'concern-premises': Building2,
  'awareness-programmes': Megaphone,
  'award-recognitions': Award,
  'sanctuary': HeartHandshake,
};

// Simplified type for albums
type Album = {
  slug: string;
  title: string;
};

// Client-side fetching function
async function fetchAlbums(parentFolder: string): Promise<Album[]> {
  // In a real app, this would be an API call. For now, we simulate a fetch.
  // This part needs to be adapted if you have a real API endpoint for albums.
  console.log(`Fetching albums for: ${parentFolder}`);
  return []; // Returning empty to avoid build errors, needs implementation
}

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

const staticProgrammeAlbums: Album[] = [
    { slug: 'ministry-of-social-justice-and-empowerment', title: 'Ministry of Social Justice and Empowerment' },
    { slug: 'synopsis', title: 'Synopsis' },
    { slug: 'training-programmes', title: 'Training Programmes' },
    { slug: 'concern-premises', title: 'Concern Premises' },
    { slug: 'awareness-programmes', title: 'Awareness Programmes' },
    { slug: 'award-recognitions', title: 'Awards & Recognitions' },
];

const specialAlbums: Album[] = [
    { slug: 'video-clips', title: 'Video Clips' },
    { slug: 'sanctuary', title: 'Sanctuary' },
];

const staticYearAlbums: Album[] = [
    { "slug": "2026", "title": "2026" },
    { "slug": "2025", "title": "2025" },
    { "slug": "2024", "title": "2024" },
    { "slug": "2023", "title": "2023" },
    { "slug": "2022", "title": "2022" },
    { "slug": "2021", "title": "2021" },
    { "slug": "2020", "title": "2020" },
    { "slug": "2019", "title": "2019" },
    { "slug": "2018", "title": "2018" },
    { "slug": "2017", "title": "2017" },
    { "slug": "2016", "title": "2016" },
    { "slug": "2014", "title": "2014" },
    { "slug": "2013", "title": "2013" },
    { "slug": "2012", "title": "2012" },
    { "slug": "2011", "title": "2011" },
    { "slug": "2009", "title": "2009" }
].sort((a,b) => b.title.localeCompare(a.title));


export default function GalleryPage() {
  // Using static data for client component
  const programmeAlbums = staticProgrammeAlbums;
  const yearAlbums = staticYearAlbums;

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
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 md:gap-6"
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
            {specialAlbums.map((album) => {
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
