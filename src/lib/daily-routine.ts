export type DailyRoutineItem = {
  time: string;
  agenda: string;
  duration: string;
  highlight: boolean;
};

export const dailyRoutine: DailyRoutineItem[] = [
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
  { time: '12.30 P.M.', agenda: "Counsellor's time with patients", duration: '1 Hour', highlight: false },
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
