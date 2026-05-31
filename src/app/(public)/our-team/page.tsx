
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Briefcase, Wrench, Handshake, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const medicalTeam = [
  { name: 'Dr. Mohamed Nidhal S, M.D., FNR., PGDHM.', role: 'Medical Officer - Neurorehabilitation' },
  { name: 'Dr. Sathish Kumar, M.B.B.S., D.P.M., D.N.B.', role: 'Consultant Psychiatrist' },
  { name: 'Dr. Thiruvikraman, M.B.B.S., D.P.M.', role: 'Visiting Consultant Neuro Psychiatrist' },
  { name: 'Dr. G. Manjari, B.D.S., M.P.H.', role: 'Psychologist and Counsellor' },
  { name: 'Mr. M. Kabilan, M.Sc. (Applied Psychology)', role: 'Psychologist and Counsellor' },
  { name: 'Nurses and Ward boys', role: '' },
];

const managementStaff = [
  { name: 'Mr. T. Rajesh, M.S.W.', role: 'Manager cum In-charge' },
  { name: 'Mrs. P Lanthangi, B.A., M.Sc. (Yoga)', role: 'Project Coordinator' },
  { name: 'Mr. J. Ethuraj, D.P.T.', role: 'Project Coordinator' },
  { name: 'Honorary Volunteers', role: '' },
  { name: 'Trainer cum Supervisors, Outreach Workers, Peer Educators, Cooks, House-keepers & Chowkidars', role: '' },
];

const technicalSupporters = [
  { name: 'Arch. Chamraj Suresh Babu, M.L.A.', role: 'Design Consultant' },
  { name: 'Mr. Madhavan', role: 'Web Designer' },
  { name: 'Mr. Tanish Poddar, B.Tech.', role: 'Web Developer' },
  { name: 'Mr. Nishant Ranjan, B.Tech', role: 'Web Developer' },
  { name: 'Ms. Nidhi Nayana, B.Tech', role: 'Web Developer' },
];

const committeeOfSupporters = [
    { name: 'Ar. Kalpana. S.', role: 'Trustee, Zonta Resource Centre' },
    { name: 'Ms. Latha Suresh', role: 'Director SAN INDIA Social Auditor' },
    { name: 'Mr. P. Bhojaraj, M.Com', role: 'BR Logistics' },
    { name: 'Ms. Marie Banu', role: 'Director CSIM' },
    { name: 'Mr. R. Vijayakrishnan, B.com., F.C.A.', role: 'Chartered Accountant' },
    { name: 'Mr. P.S. Kamalakara Rao, F.C.A.', role: 'Chartered Accountant' },
    { name: 'Dr. Benhur B.V.Sc.', role: 'Nutricon Bio-Science P Ltd' },
    { name: 'Mr. Suresh Govindraj', role: 'Kothagiri, Nilgris District, Tamil Nadu' },
    { name: 'Mrs. Pavithra Sharath', role: 'Idea Guru, Media Partner' },
];

const pillarsOfStrength = [
    { name: 'Ministry of Social Justice and Empowerment (MoSJE)', role: 'Govt. Of India, New Delhi' },
    { name: 'National Institute of Social Defence', role: 'New Delhi'},
    { name: 'State Bank of India', role: 'Head Office, Chennai' },
    { name: 'Centre for Social Initiative and Management (CSIM)', role: 'Alapakkam, Chennai' },
    { name: 'Zonta Resource Center', role: 'Madambakkam, Chennai' },
    { name: 'Link Up Garments for CSR Activities', role: 'Erungattukottai, Chennai' },
    { name: 'Milestone Specialty Equipment P Ltd', role: '' },
    { name: 'Vastarakala Export P Ltd', role: 'Thirumuluzhi, Chennai' },
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

const TeamCard = ({ title, members, icon: Icon }: { title: string; members: { name: string; role: string }[]; icon: React.ElementType }) => (
  <Card className="shadow-md transition-shadow hover:shadow-xl flex flex-col h-full">
    <CardHeader className="flex flex-row items-start gap-4">
      <Icon className="h-8 w-8 text-primary" />
      <CardTitle className="text-xl md:text-2xl text-primary mt-1">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-4">
        {members.map((member, index) => (
          <li key={index}>
            <p className="font-semibold text-base">{member.name}</p>
            {member.role && <p className="text-sm text-muted-foreground">{member.role}</p>}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function OurTeamPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <motion.h1 
        className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Team
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex">
          <TeamCard title="Medical Team" members={medicalTeam} icon={Stethoscope} />
        </motion.div>
        <motion.div variants={itemVariants} className="flex">
          <TeamCard title="Management Staff" members={managementStaff} icon={Briefcase} />
        </motion.div>
        <motion.div variants={itemVariants} className="flex">
          <TeamCard title="Technical Supporters" members={technicalSupporters} icon={Wrench} />
        </motion.div>
      </motion.div>

       <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
       >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <TeamCard title="Our Committee of Supporters" members={committeeOfSupporters} icon={Handshake} />
            <TeamCard title="Our Pillars of Strength" members={pillarsOfStrength} icon={Shield} />
        </div>
      </motion.div>
    </div>
  );
}
