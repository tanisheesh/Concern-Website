
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAnnualReports, getIncomeTaxReturns } from '@/lib/pdf-drive';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TableSkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

async function AnnualReportsTable() {
  const reports = await getAnnualReports();

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">No annual reports available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Year</TableHead>
            <TableHead className="text-right">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.year}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="default">
                  <a href={report.viewLink} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

async function ITRTable() {
  const reports = await getIncomeTaxReturns();

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">No income tax returns available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Year</TableHead>
            <TableHead className="text-right">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.year}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="default">
                  <a href={report.viewLink} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AnnualReportsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">Annual Reports & ITR</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Access our Annual Reports and Income Tax Returns.
          </p>
        </div>

        {/* Annual Reports Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">Annual Reports</h2>
          <Suspense fallback={<TableSkeleton />}>
            <AnnualReportsTable />
          </Suspense>
        </section>

        {/* Income Tax Returns Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">Income Tax Returns</h2>
          <Suspense fallback={<TableSkeleton />}>
            <ITRTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
