
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const therapies = [
  {
    title: 'Detoxification',
    points: [
      'A process supervised by medical professionals to treat withdrawals due to chemical abuse.',
      'This process normally takes 3 to 4 days depending on the individual’s impact of addiction.',
      'It also provides to diagnose other physical complications which had been neglected.',
      'It enables the recovery process to take off smoothly.',
    ],
  },
  {
    title: 'Psycho Therapy',
    points: [
      "It's a systematic application of learning techniques in treatment.",
      "This therapy focuses on the change in patients' overall functioning.",
      'This includes behavior problems from the childhood.',
      'Educative sessions lead to total abstinence.',
      'Needs are assessed with coping skills.',
    ],
  },
  {
    title: 'Cognitive Therapy',
    description: "Cognitive Behavior Therapy is a psychotherapeutic approach, a talking therapy that aims to solve problems conveying dysfunctional behavior. It's a systematic procedure done with professionalism, making the person do their own inventory and accept their behaviors.",
  },
  {
    title: 'Group Therapy',
    points: [
      'Is a technique in treating patients in a group.',
      'This therapy breaks denial syndrome and acceptance of self is mooted.',
      'All significant people sit in a circle and discuss specific topics.',
      'Peer support in open sharing attracts them to open up their feelings without hesitation.',
      'Therapist without prejudice conducts within the norms of therapy.',
      'It is a type of confrontation towards self, so as to come to terms within oneself.',
    ],
  },
  {
    title: 'Individual Counseling',
    points: [
      'Involves insight to see the problems realistically.',
      'Helps the patient to maintain abstinence and needs are assessed with coping skills on an ongoing basis.',
      'Sensitive issues are also discussed with utmost confidentiality.',
      'This is a continuous process, even after treatment and discharge.',
    ],
  },
  {
    title: 'Family Therapy',
    points: [
      'While treating the chemical dependent, the entire family is brought together to discuss the related issues.',
      'This also helps the person to maintain abstinence and improve family situations and relationships.',
      'Helps them to come out of co-dependency.',
      'One support person is given intensive counseling to help their emotive interdependence.',
    ],
  },
  {
    title: 'Child Counseling',
    points: [
      'Children experience challenges and problems associated with their alcoholic parent.',
      'The impact ranges from minimal effect to serious lifelong problems.',
      'It may be simple or unnoticed of magnified results proved due to addictions.',
      'They are given counseling to handle their stressful situations and make them aware of help to be taken.',
      'Coping skills to manage their life situation.',
    ],
  },
    {
    title: 'Transit',
    description: "Is for our Patients to go to work from CONCERN and be with us and go for the meetings in the evening. This stay is only for three months.",
  },
];

const dailyRoutine = [
  { time: '6.00 A.M.', agenda: '"Good Morning"\nWake up, Freshen', duration: '1 Hour', highlight: false },
  { time: '7.00 A.M.', agenda: 'Tea', duration: '30 Minutes', highlight: false },
  { time: '7.30 A.M.', agenda: 'Warm up exercise and Yoga', duration: '30 Minutes', highlight: false },
  { time: '8.00 A.M.', agenda: 'Individual cubicle cleaning, washing, getting ready etc.', duration: '1 Hour', highlight: false },
  { time: '9.00 A.M.', agenda: 'Breakfast', duration: '30 Minutes', highlight: false },
  { time: '9.30 A.M.', agenda: 'Medicine', duration: '30 Minutes', highlight: false },
  { time: '10.00 A.M.', agenda: 'Daily Reflection', duration: '15 Minutes', highlight: false },
  { time: '10.15 A.M.', agenda: 'As Bill Sees It', duration: '15 Minutes', highlight: false },
  { time: '10.30 A.M.', agenda: 'Moral / Motivational story', duration: '30 Minutes', highlight: false },
  { time: '11.00 A.M.', agenda: 'Tea', duration: '30 Minutes', highlight: false },
  { time: '11.30 A.M.', agenda: 'Cognitive Behavioural Therapy (CBT)', duration: '1 Hour', highlight: false },
  { time: '12.30 A.M.', agenda: "Counsellor's time with patients", duration: '1 Hour', highlight: false },
  { time: '1.30 P.M.', agenda: 'Lunch and rest', duration: '1 Hour 30 Minutes', highlight: false },
  { time: '3.00 P.M.', agenda: 'Group Activity', duration: '1 Hour', highlight: false },
  { time: '4.00 P.M.', agenda: 'Tea', duration: '30 Minutes', highlight: false },
  { time: '4.30 P.M.', agenda: 'Group Therapy', duration: '1 Hour', highlight: false },
  { time: '5.30 P.M.', agenda: 'In / Out-door games, recreation,\ncalls to family and TV time', duration: '1 Hour 30 Minutes', highlight: false },
  { time: '7.00 P.M.', agenda: "Day's thoughts and feelings", duration: '45 Minutes', highlight: false },
  { time: '7.45 P.M.', agenda: 'Dinner', duration: '45 Minutes', highlight: false },
  { time: '8.30 P.M.', agenda: 'Medicine', duration: '30 Minutes', highlight: false },
  { time: '9.00 P.M.', agenda: 'Prayer and Meditation and thanks giving to God\nby individuals at bed and retire.\n"Good Night"', duration: 'Till next morning 6 A.M.', highlight: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function TherapyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <motion.h1 
        className="mb-8 text-center text-3xl font-bold text-primary md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Therapies We Offer
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {therapies.map((therapy) => (
          <motion.div key={therapy.title} variants={itemVariants} className="flex">
            <Card className="flex flex-col shadow-md transition-shadow hover:shadow-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-primary">{therapy.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {therapy.description ? (
                  <p className="text-muted-foreground text-justify">{therapy.description}</p>
                ) : (
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground text-justify">
                    {therapy.points?.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily Routine Section */}
      <motion.div
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary md:text-3xl uppercase tracking-wide">
            Concern – Daily Routine for Patients
          </h2>
        </div>

        <div className="overflow-x-auto rounded-lg border shadow-md">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-bold text-primary w-[120px] md:w-[150px]">TIME</th>
                <th className="px-4 py-3 text-center font-bold text-primary">AGENDA</th>
                <th className="px-4 py-3 text-right font-bold text-primary w-[140px] md:w-[180px]">DURATION</th>
              </tr>
            </thead>
            <tbody>
              {dailyRoutine.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/40'}
                >
                  <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{item.time}</td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {item.agenda.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < item.agenda.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${item.highlight ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
