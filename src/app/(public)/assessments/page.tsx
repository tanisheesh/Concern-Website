'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { motion } from 'framer-motion';


const selfDiagnosisQuestions = [
  "Do you lose time from work due to drinking?",
  "Is drinking making your home life unhappy?",
  "Do you drink because you are shy with other people?",
  "Is drinking affecting your reputation?",
  "Have you ever felt remorse after drinking?",
  "Ever got into financial difficulties as a result of drinking?",
  "Do you turn to lower companions or inferior environment?",
  "Does drinking make you careless of your family’s welfare?",
  "Has your ambition decreased since drinking?",
  "Do you crave for a drink at a definite time daily?",
  "Do you want a drink the next morning?",
  "Does drinking cause you to have difficulty in sleeping?",
  "Has your efficiency decreased since drinking?",
  "Is drinking jeopardizing your job or business?",
  "Do you drink to escape from worries or troubles?",
  "Do you drink alone?",
  "Have you had a complete loss of memory due to drinking?",
  "Has a physician ever treated you for drinking?",
  "Do you drink to build your self-confidence?",
  "Have you been in a hospital or institution due to drinking?",
];

const saddQuestions = [
  'Do you find difficulty in getting the thought of drink out of your mind?',
  'Is getting drunk more important than your next meal?',
  'Do you plan your day so that you know you will be able to get a drink?',
  'Do you start drinking in the morning and continue drinking in the afternoon and evening as well?',
  'Do you drink for the effect of alcohol without caring what kind of drink you have?',
  'Do you drink as much as you want without considering what you have to do the next day?',
  'Given that many problems might be caused by alcohol, do you still drink too much?',
  'Do you find yourself unable to stop Drinking once you start?',
  'Do you try to control your drinking by deliberately giving it up completely for days or weeks at a time?',
  'The morning after a heavy drinking session, do you need your first alcoholic drink to get you going?',
  'The morning after a heavy drinking session, do you wake up with a definite shakiness in your hands?',
  'After a heavy drinking session do you vomit (throw up)?',
  'The morning after a heavy drinking session, do you go out of your way to avoid people?',
  'After a heavy drinking session do you see frightening things that you later realize were not real?',
  'Do you go drinking and the next day find that you have forgotten what happened the night before?',
];

const saddOptions = [
    { label: 'Never', value: 0 },
    { label: 'Sometimes', value: 1 },
    { label: 'Often', value: 2 },
    { label: 'Always', value: 3 },
];

export default function AssessmentsPage() {
  const [selfDiagnosisAnswers, setSelfDiagnosisAnswers] = useState<{ [key: number]: string }>({});
  const [saddAnswers, setSaddAnswers] = useState<{ [key: number]: number }>({});
  const [selfDiagnosisResult, setSelfDiagnosisResult] = useState<string | null>(null);
  const [saddResult, setSaddResult] = useState<string | null>(null);

  const handleSelfDiagnosisChange = (index: number, value: 'yes' | 'no') => {
    setSelfDiagnosisAnswers(prev => ({ ...prev, [index]: value }));
    setSelfDiagnosisResult(null); // Reset result when an answer changes
  };

  const handleSaddChange = (index: number, value: string) => {
    setSaddAnswers(prev => ({ ...prev, [index]: parseInt(value, 10) }));
    setSaddResult(null); // Reset result when an answer changes
  };

  const calculateSelfDiagnosis = () => {
    const yesCount = Object.values(selfDiagnosisAnswers).filter(ans => ans === 'yes').length;
    if (yesCount >= 3) {
      setSelfDiagnosisResult("You are definitely an alcoholic.");
    } else if (yesCount === 2) {
      setSelfDiagnosisResult("The chances are that you are an alcoholic.");
    } else if (yesCount === 1) {
      setSelfDiagnosisResult("There is a definite warning that you may have an addiction.");
    } else {
      setSelfDiagnosisResult("Your answers do not indicate signs of alcoholism. However, if you have any concerns, please consult a professional.");
    }
  };

  const calculateSadd = () => {
    const totalScore = Object.values(saddAnswers).reduce((sum, value) => sum + value, 0);
    if (totalScore >= 20) {
      setSaddResult(`Your score is ${totalScore}. This indicates a High level of alcohol dependence.`);
    } else if (totalScore >= 10) {
      setSaddResult(`Your score is ${totalScore}. This indicates a Medium level of alcohol dependence.`);
    } else if (totalScore >= 1) {
      setSaddResult(`Your score is ${totalScore}. This indicates a Low level of alcohol dependence.`);
    } else {
      setSaddResult(`Your score is ${totalScore}. This indicates an Absence of alcohol dependence.`);
    }
  };
  
  const allSelfDiagnosisAnswered = Object.keys(selfDiagnosisAnswers).length === selfDiagnosisQuestions.length;
  const allSaddAnswered = Object.keys(saddAnswers).length === saddQuestions.length;

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">Self-Assessments</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Confidential questionnaires to help you understand your relationship with alcohol.
          </p>
        </div>

        <Tabs defaultValue="self-diagnosis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="self-diagnosis">Self Diagnosis</TabsTrigger>
            <TabsTrigger value="sadd">SADD Questionnaire</TabsTrigger>
          </TabsList>
          
          <TabsContent value="self-diagnosis" className="mt-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary md:text-2xl">Do You Border on Addiction?</CardTitle>
                <CardDescription className="text-justify">
                  Answer the following questions as honestly as you can. Your responses are confidential and will help you assess your relationship with alcohol.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selfDiagnosisQuestions.map((question, index) => (
                     <div key={index} className="rounded-lg border bg-card text-card-foreground p-4 transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</span>
                            <p className="font-semibold text-sm md:text-base flex-grow">{question}</p>
                             <RadioGroup
                                onValueChange={(value) => handleSelfDiagnosisChange(index, value as 'yes' | 'no')}
                                className="flex space-x-6"
                                >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id={`sd-yes-${index}`} />
                                    <Label htmlFor={`sd-yes-${index}`}>Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id={`sd-no-${index}`} />
                                    <Label htmlFor={`sd-no-${index}`}>No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                     </div>
                  ))}
                </div>
                 <Button onClick={calculateSelfDiagnosis} className="mt-8 w-full" disabled={!allSelfDiagnosisAnswered}>
                    Show My Result
                </Button>
              </CardContent>
            </Card>

            {selfDiagnosisResult && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="mt-6 bg-accent/20 shadow-md border-accent">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary md:text-2xl flex items-center gap-2">
                                <Lightbulb className="h-6 w-6"/>
                                Your Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold text-accent-foreground">{selfDiagnosisResult}</p>
                            <p className="pt-4 text-xs text-muted-foreground text-justify">
                                This is not a medical diagnosis. If you are concerned about your drinking, please consult with a healthcare professional.
                                Courtesy and Reference - The above test questions are used by John Hopkins University Hospital, Baltimore.
                            </p>
                        </CardContent>
                    </Card>
                 </motion.div>
            )}
          </TabsContent>

          <TabsContent value="sadd" className="mt-8">
             <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary md:text-2xl">SADD Questionnaire</CardTitle>
                 <CardDescription className="text-justify">
                    This questionnaire helps measure physiological dependence and cognitive/behavioral events related to alcohol. Please answer honestly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {saddQuestions.map((question, index) => (
                    <div key={index} className="rounded-lg border bg-card text-card-foreground p-4 transition-shadow hover:shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold md:mb-0 mb-2">{index + 1}</span>
                             <p className="font-semibold text-sm md:text-base flex-grow">{question}</p>
                            <RadioGroup
                                onValueChange={(value) => handleSaddChange(index, value)}
                                className="grid grid-cols-2 gap-2 sm:flex sm:space-x-4 justify-start md:justify-end"
                            >
                                {saddOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value.toString()} id={`sadd-${index}-${option.value}`} />
                                    <Label htmlFor={`sadd-${index}-${option.value}`}>{option.label}</Label>
                                </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                  ))}
                </div>
                <Button onClick={calculateSadd} className="mt-8 w-full" disabled={!allSaddAnswered}>
                    Show My Result
                </Button>
              </CardContent>
            </Card>

            {saddResult && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="mt-6 bg-accent/20 shadow-md border-accent">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary md:text-2xl flex items-center gap-2">
                                <Lightbulb className="h-6 w-6"/>
                                Your Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold text-accent-foreground">{saddResult}</p>
                            <p className="pt-4 text-xs text-muted-foreground text-justify">
                                This is not a medical diagnosis. If you are concerned about your drinking, please consult with a healthcare professional.
                                Courtesy and Reference - Raistrick, Dunbar and R.Davidson. British Journal of addiction 78.pp. 89-95. 1983.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
