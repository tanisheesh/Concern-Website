import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Reports & ITR',
  description: 'Access our Annual Reports and Income Tax Returns for fiscal years 2022-2023, 2023-2024, 2024-2025, and 2025-2026. Download comprehensive financial documents and organizational reports.',
  keywords: 'annual reports, income tax returns, ITR, financial reports, transparency, fiscal year reports',
  openGraph: {
    title: 'Annual Reports & ITR',
    description: 'Access our Annual Reports and Income Tax Returns. Download comprehensive financial documents and organizational reports.',
    type: 'website',
  },
};

export default function AnnualReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
