'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const team = [
  {
    name: 'Bhanu Suresh Babu, M.A., (M.Phil) (Psychology)',
    role: 'Psychologist and Counsellor',
    points: [
      'Consultant and therapist for families and persons addicted to alcohol and drugs.',
      'Over 30 years of experience and knowledge in the field of counselling, awareness programs using psycho social techniques for rehabilitation counselling for chemical dependents, community-based programs on prevention.',
      'She also Protects Children from Child abuse under POSCO Act and POSH Prevention of Sexual harassment in work place as ICC Internal complaints committee in reputed Organizations viz. SBI Life.',
      'She also deals with Cognitive impairment and Deviations in persons in Acute care, jointly with Specialized Professionals by inpatient and out-patient facilities.',
    ],
  },
  {
    name: 'Dr. S. Thiru Vikraman. M.B.B.S., D.P.M., F.I.P.S',
    role: 'Neuro-psychiatrist',
    points: [
      'Qualified consultant psychiatrist committed to comprehensive mental health care.',
      'Extensive experience of 17 years.',
      'Adopts compassionate, structured and holistic treatment programmes.',
      'He combines medical management, psychotherapy and community-based support ensuring comprehensive care for each individual.',
      'The testimonies of patients are his results.',
    ],
  },
  {
    name: 'Dr. Mohamed Nidhal, M.D., F.N.R., INPCC, PGDHM,',
    role: 'Neuro-palliative physician',
    points: [
      'Specialized neuropalliative, geriatric care for chronic life-limiting illness.',
      'OP, IP, home visits and teleconsultant.',
      'Expert management of pain, spasticity, seizures, dyspnea and other distressing symptoms.',
      'Advance planning and end-of-life care support.',
      'Holistic approach integrating medical, functional and psychosocial care dedicated to patient specific.',
    ],
  },
];

export default function SanctuaryPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 max-w-4xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl font-bold text-primary underline md:text-4xl">
            CONCERN Sanctuary
          </h1>
          <p className="mt-2 text-lg italic text-muted-foreground">A Nest Away Home</p>
        </motion.div>

        {/* Intro paragraphs */}
        <motion.div variants={itemVariants} className="space-y-4 text-justify text-base leading-relaxed">
          <p>
            In everyday life, some of us face and others come across the critical challenges faced with
            respect to{' '}
            <span className="italic text-accent font-medium">
              acute psychiatric, geriatric and palliative care
            </span>
            . Unfortunately, women are more or equally come under this illness. CONCERN has been
            pondering this sickness.
          </p>
          <p>
            President of CONCERN trust Mrs. Bhanu Suresh Babu decided to join hands with Dr. Thiru
            Vikraman, neuro-psychiatrist and Dr. Mohamed Nidhal, Neuro palliative physician to address
            these issues especially for women.
          </p>
          <p>
            After meticulous planning and discussions on ethical care, professional rehabilitation
            services, sustainable social impact, structured programs, transparent governance, CONCERN
            sanctuary decided to launch an exclusive centre for men and women for the above needs.
          </p>
          <p>
            CONCERN sanctuary was formally opened on 22<sup>nd</sup> of March 2026 with the help of
            grateful donors, well wishers and our past clients.
          </p>
        </motion.div>

        {/* Team members */}
        {team.map((member) => (
          <motion.div key={member.name} variants={itemVariants} className="space-y-2">
            <h2 className="text-lg font-bold text-primary">{member.name}</h2>
            <p className="font-semibold text-primary">{member.role}</p>
            <ul className="space-y-2 pl-2">
              {member.points.map((point, i) => (
                <li key={i} className="flex gap-2 text-justify text-base leading-relaxed">
                  <span className="mt-1 text-primary shrink-0">✦</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Gallery link */}
      <div className="mt-10 text-center">
        <p className="text-xl font-bold text-primary">
          Kindly visit{' '}
          <Link href="/gallery/sanctuary" className="underline text-red-600 hover:text-red-500 transition-colors">
            Gallery
          </Link>{' '}
          for more about CONCERN Sanctuary.
        </p>
      </div>
    </div>
  );
}
