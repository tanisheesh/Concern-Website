'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const sanitize = (s: string) => s.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').trim();

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const contactFormSchema = z.object({
  title: z.string().min(1, 'Title is required').transform(sanitize),
  name: z.string().min(2, 'Name must be at least 2 characters.').transform(sanitize),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.').transform(sanitize),
  email: z.string().email('Please enter a valid email address.'),
  comments: z.string().min(10, 'Comments must be at least 10 characters.').max(5000).transform(sanitize),
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
    secure: false,
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
        <p><strong>Name:</strong> ${escapeHtml(title)}. ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <hr>
        <p><strong>Comments:</strong></p>
        <p>${escapeHtml(comments)}</p>
      `,
    });
    return { success: true, message: 'Thank you for your enquiry. We will get back to you soon.' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, message: 'Sorry, there was an error sending your message. Please try again later.' };
  }
}
