export type Album = { slug: string; title: string };

export const ALBUM_TITLES: Record<string, string> = {
  'ministry-of-social-justice-and-empowerment': 'Ministry of Social Justice and Empowerment',
  'synopsis': 'Synopsis',
  'training-programmes': 'Training Programmes',
  'video-clips': 'Video Clips',
  'concern-premises': 'Concern Premises',
  'awareness-programmes': 'Awareness Programmes',
  'award-recognitions': 'Awards & Recognitions',
  'awards-recognitions': 'Awards & Recognitions',
  'sanctuary': 'Sanctuary',
};

export function slugToTitle(slug: string): string {
  return ALBUM_TITLES[slug] ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const PROGRAMME_ALBUMS: Album[] = [
  { slug: 'ministry-of-social-justice-and-empowerment', title: 'Ministry of Social Justice and Empowerment' },
  { slug: 'synopsis', title: 'Synopsis' },
  { slug: 'training-programmes', title: 'Training Programmes' },
  { slug: 'concern-premises', title: 'Concern Premises' },
  { slug: 'awareness-programmes', title: 'Awareness Programmes' },
  { slug: 'award-recognitions', title: 'Awards & Recognitions' },
];

export const SPECIAL_ALBUMS: Album[] = [
  { slug: 'video-clips', title: 'Video Clips' },
  { slug: 'sanctuary', title: 'Sanctuary' },
];

// Descending order — newest first
export const YEAR_ALBUMS: Album[] = [
  '2026', '2025', '2024', '2023', '2022', '2021', '2020',
  '2019', '2018', '2017', '2016', '2014', '2013', '2012', '2011', '2009',
].map(y => ({ slug: y, title: y }));

export const ALL_ALBUM_SLUGS: string[] = [
  ...PROGRAMME_ALBUMS.map(a => a.slug),
  ...SPECIAL_ALBUMS.map(a => a.slug),
  ...YEAR_ALBUMS.map(a => a.slug),
];
