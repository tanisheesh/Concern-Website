'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sendContactEmail } from '@/app/(public)/contact-us/actions';
import React from 'react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  comments: z.string().min(10, {
    message: 'Comments must be at least 10 characters.',
  }),
});

export default function ContactForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [statusMessage, setStatusMessage] = React.useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      name: '',
      phone: '',
      email: '',
      comments: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await sendContactEmail(values);
      setStatusMessage(result.message);
      if (result.success) {
        toast({ title: 'Form Submitted!', description: result.message });
        form.reset();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">Contact Us</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            For Enquiries, Admissions or any other related Information.
          </p>
        </div>

        <Card className="shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
                <CardTitle>Enquiry Form</CardTitle>
                <CardDescription>Please fill up and submit</CardDescription>
            </CardHeader>
            <CardContent>
                 <div aria-live="polite" aria-atomic="true" className="sr-only">
                   {statusMessage}
                 </div>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-1">
                                <FormLabel>Title</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Mr">Mr</SelectItem>
                                    <SelectItem value="Mrs">Mrs</SelectItem>
                                    <SelectItem value="Miss">Miss</SelectItem>
                                    <SelectItem value="Ms">Ms</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                <FormLabel>Name</FormLabel>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} disabled={isPending} className="pl-10" />
                                    </FormControl>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                       </div>

                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="Your Phone Number" {...field} disabled={isPending} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="Your Email Address" {...field} disabled={isPending} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                       </div>
                        
                        <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Comments</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Your comments or questions" className="min-h-[120px]" {...field} disabled={isPending}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Enquiry
                            </>
                          )}
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>

        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle>Our Location</CardTitle>
            <CardDescription>Find us on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.184202221021!2d80.16922699999999!3d12.895874099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52594b3f02af09%3A0x4fcf3c1d53b75ecf!2sCONCERN%20DDAC%20Rehabilitation%20Center!5e1!3m2!1sen!2sin!4v1752213696055!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title="CONCERN Location Map"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-md"
                ></iframe>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Registered Trust No. 628 / 08</Badge>
          <Badge variant="default">License No. RV-082 dated 02.05.2026</Badge>
          <Badge variant="default">ISO 9001 : 2008 Certified</Badge>
          <Badge variant="default">Social Audit Network - United Kingdom</Badge>
          <Badge variant="default">
            Donations IT Exempted U/S 80G — Approval No. AAATC9995Q25CH01/02 dated 10.03.2026
          </Badge>
        </div>

      </div>
    </div>
  );
}
