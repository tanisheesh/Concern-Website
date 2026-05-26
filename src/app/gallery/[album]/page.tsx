'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CarouselApi } from "@/components/ui/carousel";
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ALBUM_TITLES, slugToTitle } from '@/lib/albums';

type MediaItem = { id: string; name: string; url: string; isVideo: boolean; mimeType: string };

export default function AlbumPage() {
  const params = useParams();
  const albumSlug = typeof params.album === 'string' ? params.album : '';

  // Validate slug: known named album OR a 4-digit year
  const isKnown = albumSlug in ALBUM_TITLES || /^\d{4}$/.test(albumSlug);
  if (!isKnown) notFound();

  const albumTitle = slugToTitle(albumSlug);

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!albumSlug) return;

    const controller = new AbortController();

    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/gallery/${albumSlug}`, { signal: controller.signal });
        if (!res.ok) {
          setMedia([]);
          setIsLoading(false);
          return;
        }
        const fetchedMedia: MediaItem[] = await res.json();
        setMedia(fetchedMedia);
        setCount(fetchedMedia.length);
        setIsLoading(false);
      } catch (err) {
        // AbortError means this fetch was cancelled by navigation — don't touch state,
        // the new effect run will set isLoading(true) and fetch fresh data.
        if ((err as Error).name !== 'AbortError') {
          setMedia([]);
          setIsLoading(false);
        }
      }
    };

    fetchMedia();
    return () => controller.abort();
  }, [albumSlug]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', onSelect);
    return () => { api.off('select', onSelect); };
  }, [api]);

  const renderCarouselItems = () => {
    if (isLoading) {
      return (
        <CarouselItem>
          <Card className="overflow-hidden rounded-xl shadow-lg">
            <CardContent className="relative flex aspect-video items-center justify-center p-0">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </CarouselItem>
      );
    }

    if (media.length > 0) {
      return media.map((item) => (
        <CarouselItem key={item.id}>
          <Card className="overflow-hidden rounded-xl shadow-lg">
            <CardContent className="relative flex aspect-video items-center justify-center p-0">
              {item.isVideo ? (
                <video
                  controls
                  className="h-full w-full object-contain"
                  preload="metadata"
                >
                  <source src={item.url} type={item.mimeType} />
                  <track kind="captions" label="Captions unavailable" />
                </video>
              ) : (
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </CardContent>
          </Card>
        </CarouselItem>
      ));
    }

    return (
      <CarouselItem>
        <Card>
          <CardContent className="flex aspect-video items-center justify-center p-6">
            <p>No images or videos found in this album.</p>
          </CardContent>
        </Card>
      </CarouselItem>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <h1 className="mb-8 text-center text-3xl font-bold text-primary md:text-4xl">{albumTitle}</h1>
      <div className="flex justify-center">
        <Carousel
          setApi={setApi}
          opts={{ align: 'start', loop: media.length > 1 }}
          className="w-full max-w-sm md:max-w-4xl"
        >
          <CarouselContent>
            {renderCarouselItems()}
          </CarouselContent>
          {media.length > 1 && (
            <>
              <CarouselPrevious className="hidden md:inline-flex" />
              <CarouselNext className="hidden md:inline-flex" />
            </>
          )}
        </Carousel>
      </div>
      {!isLoading && count > 0 && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Slide {current} of {count}
        </div>
      )}
    </div>
  );
}
