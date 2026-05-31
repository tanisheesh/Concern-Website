
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

const trainingSections = [
  {
    title: 'Staff Training',
    content: 'We conduct training programs for staff of Rehabilitation centers for de-addiction. The trainees who work on community based organization also consist of recovering persons; hence, training enables them to cope with the demands of running a center.',
  },
  {
    title: 'Interns',
    content: 'We have imparted Internship to MSW college students, Law college students, Nurses from various reputed Institutions from Tamil Nadu, Kerala and Karnataka. They have benefitted largely by our training.',
  },
  {
    title: 'Training Programmes',
    content: 'We also conduct training programs for students and people working for addiction. We provide training on addiction issues - including alcohol and drug addictions and also provide printed manual and hand out for references.',
  },
  {
    title: 'HR Policy',
    content: 'We specialize in working with HR Departments in Organizations and assist them in employee assessment programs for problems in absenteeism and performance.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function TrainingPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-4xl space-y-10">
        <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-primary md:text-4xl">Training</h1>
        </motion.div>

        <motion.p 
            className="text-center text-lg text-muted-foreground text-justify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          CONCERN in association with CSIM (Centre for Social Initiative and Management) conduct twice in a year "RehabVenture and Social entrepreneurship".
        </motion.p>

        <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {trainingSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
                <Card className="shadow-md transition-shadow hover:shadow-xl h-full">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl text-primary">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-justify">{section.content}</p>
                </CardContent>
                </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
            <p className="text-xl font-bold text-primary">
                Kindly Visit <Link href="/gallery/training-programmes" className="underline text-accent-foreground hover:text-accent transition-colors">Gallery</Link> for all activities of training.
            </p>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <Card className="bg-secondary/50 shadow-md">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-primary">If We Can Help You, Please Contact Us.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                <Badge variant="default">Registered Trust No. 628 / 08</Badge>
                <Badge variant="default">IMH License No. RIV 135 dated 09.10.2025</Badge>
                <Badge variant="default">ISO 9001 : 2008 Certified</Badge>
                <Badge variant="default">Social Audit Network - United Kingdom</Badge>
                </div>
                <p className="pt-2 text-sm text-justify">
                (Donations are IT Exempted U/S 80G of IT Act 1961 Vide Approval No. AAATC9995QF20210 Dt. 24.09.2021)
                </p>
            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
