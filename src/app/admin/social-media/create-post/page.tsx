import type { Metadata } from 'next';
import CreatePostClient from './create-post-client';

export const metadata: Metadata = { title: 'Create Post' };

export default function CreatePostPage() {
  return <CreatePostClient />;
}
