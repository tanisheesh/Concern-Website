'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const sanitize = (s: string) => s.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').trim();

const contactFormSchema = z.object({
  title: z.string().transform(sanitize),
  name: z.string().transform(sanitize),
  phone: z.string().transform(sanitize),
  email: z.string().email(),
  comments: z.string().max(5000),
});

export async function sendContactEmail(formData: unknown) {
  const parsedData = contactFormSchema.safeParse(formData);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const { title, name, phone, email, comments } = parsedData.data;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO_EMAIL,
      subject: `New Enquiry from ${title}. ${name}`,
      html: `
        <h1>New Website Enquiry</h1>
        <p><strong>Name:</strong> ${title}. ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <hr>
        <p><strong>Comments:</strong></p>
        <p>${comments}</p>
      `,
    });
    return { success: true, message: 'Thank you for your enquiry. We will get back to you soon.' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, message: 'Sorry, there was an error sending your message. Please try again later.' };
  }
}
