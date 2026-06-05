
'use client';
import { DailyRoutineTable } from '@/components/daily-routine-table';
import { WhereDoIStandPopup } from '@/components/where-do-i-stand-popup';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, MousePointerClick } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const managementCommittee = [
  { name: 'Mrs. Bhanu Suresh Babu, M.A., (M.Phil.) (Psy)', role: 'Founder & President, CONCERN Trust', imgSrc: '/images/committee/1.jpg' },
  { name: 'Mr. P. Suresh Babu, M.B.A., C.A.I.I.B., D.C.A.', role: 'Secretary, CONCERN Trust', imgSrc: '/images/committee/2.jpg' },
  { name: 'Mrs. Pavithra Chamraj, M.Sc., PhD.* (Stem Cells)', role: 'Treasurer, CONCERN Trust', imgSrc: '/images/committee/3.jpg' },
  { name: 'Mrs. Asha Vinay, M.S.W., (Med Psy), MPhil., B.Ed.', role: 'Trust Board Advisory member', imgSrc: '/images/committee/4.jpg' },
];

const facilities = [
  'Community Awareness Programmes',
  'Transit Home And Peer Support',
  'In-Patient / Out-Patient Services',
  'In-House Kitchen',
  'De-Toxification, Psychotherapy, Group Therapy',
  'Individual, Family, Child, And Marital Counselling',
  'Guide To Alcoholics Anonymous (AA), Narcotics Anonymous And Al-Anon',
  'Free Drop-In Counselling Centre For Children & Women Of Chemical Dependants',
  'Large Open Land For Outdoor Activities & Games.',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function Home() {

  return (
    <div className="flex flex-col">
      <WhereDoIStandPopup />
      {/* About Us & Vision/Mission Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:gap-16">
            <motion.div 
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-5xl">
                About Us
              </h2>
              <p className="text-lg text-muted-foreground text-justify">
                We are a Non-Profit Charitable Trust and Non-Governmental Organisation (NGO) working in the field of addiction - rehabilitation. We wish to share the benefits with other suffering men and women and their families. Members of <span className="font-semibold text-primary">CONCERN</span> have enormous experience in dealing with addiction at various levels with both men and women. Equipped with academic, professional and practical experience in the area of addiction treatment. We made it our Mission to Share our Very Personal Experience and Success. At <span className="font-semibold text-primary">CONCERN</span> we perceive the grip of addiction as a specific disorder and treat them in simple, medical and psychological method with Holistic Approach.
              </p>
              <p className="mt-4 text-lg text-muted-foreground text-justify">
                <span className="font-semibold text-primary">Bhanu Suresh Babu</span> (Founder President) treats with a Dedicated Tailor Made Program to suit individuals' need and people of <span className="font-semibold text-primary">CONCERN</span> have practical experience with professional training and academics. We walk hand in hand with the clients exploring the problem areas and finding solutions to guide them in the process of recovery.
              </p>
            </motion.div>
            <motion.div 
              className="space-y-6 flex flex-col justify-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
                <h3 className="mb-2 text-2xl font-bold text-primary">VISION</h3>
                <p className="text-muted-foreground text-justify">
                  <span className="font-semibold text-primary">CONCERN'S</span> concern is to Identify, Explore and Guide to Change.
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
                <h3 className="mb-2 text-2xl font-bold text-primary">MISSION</h3>
                <p className="text-muted-foreground text-justify">
                  To address the perils of addiction as a disease and not condemn. Suggest studied CHANGE Plan for sustained recovery. Growing and expanding for wider reach of <span className="font-semibold text-primary">CONCERN'S</span> concern in terms of Quality and Quantity.
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
                <h3 className="mb-2 text-2xl font-bold text-primary">VALUES</h3>
                <p className="text-muted-foreground text-justify">
                  Transparency, Empathy, Learning and Listening, Parting knowledge and experience Belongingness, Eventual CHANGE
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Image Section */}
      <motion.section 
        className="py-4 md:py-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container px-4 md:px-6">
           <div className="mx-auto max-w-5xl overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/images/About Us with Logo.jpg"
              alt="CONCERN team and premises"
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </motion.section>

      {/* Management Committee Section */}
       <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
            <motion.h2 
              className="text-center text-3xl font-bold text-primary md:text-4xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              Meet Our Management Committee
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
            {managementCommittee.map((member, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="text-center transition-shadow hover:shadow-xl h-full">
                    <CardContent className="flex flex-col items-center pt-6">
                        <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={member.imgSrc} alt={`${member.name}, ${member.role}`} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-lg">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
            </motion.div>
        </div>
        </section>


      {/* Facilities Section */}
      <section className="bg-secondary/50 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              Our Facilities
            </h2>
             <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto text-justify">
                The Comprehensive care with coping skills in our rehabilitation program guides the individual to cope up with the demands of daily living without addictive substance. The Holistic approach of our protocol is adapted to these special individuals' needs.
              </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {facilities.map((facility, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="flex flex-col p-6 shadow-md transition-shadow hover:shadow-lg h-full">
                  <div className="flex items-start">
                    <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <p className="text-base text-card-foreground">{facility}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
            <motion.div variants={itemVariants} className="h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group flex h-full w-full flex-col rounded-lg border border-dashed border-primary bg-primary/5 p-6 text-left shadow-md transition-all hover:border-solid hover:bg-primary/10 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="flex items-start">
                      <MousePointerClick className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-primary transition-transform group-hover:scale-110" />
                      <div>
                        <p className="text-base font-bold text-primary">Daily Routine for our clients</p>
                        <p className="mt-1 text-sm font-semibold text-primary underline underline-offset-4 group-hover:no-underline">
                          Click here
                        </p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-primary uppercase tracking-wide">
                      Concern – Daily Routine for Patients
                    </DialogTitle>
                  </DialogHeader>
                  <DailyRoutineTable />
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
