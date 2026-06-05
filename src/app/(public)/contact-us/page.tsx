import type { Metadata } from 'next';
import ContactForm from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with CONCERN for enquiries, admissions, or any other information. Fill out our form or find our location on the map.',
};

export default function ContactUsPage() {
  return <ContactForm />;
}
