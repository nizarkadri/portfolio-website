import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { contactSchema, type ContactFormData } from '../../../lib/schemas/contact';
import { rateLimit, getClientIp } from '../../../lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit per client IP
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const json = await req.json();
    const parsed = contactSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid form data', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data: ContactFormData = parsed.data;

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL) {
      console.error('Contact route: missing Resend env vars');
      return NextResponse.json(
        { message: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: 'nikk4apps@gmail.com',
      subject: `New ${data.userType} inquiry`,
      replyTo: data.email,
      text: generatePlainText(data),
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    // Log full error server-side; do NOT leak err.message to the client
    console.error('Contact route error:', error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function generatePlainText(data: ContactFormData): string {
  if (data.userType === 'recruiter') {
    return `
Recruiter Inquiry

Company: ${data.company}
Position: ${data.position}
Job Description: ${data.jobDescription}
Employment Type: ${data.employmentType}
Interview: ${data.interview}
Work Location: ${data.workLocation}
Location Details: ${data.locationDetails || 'N/A'}
Email: ${data.email}

Message:
${data.message}
    `.trim();
  } else if (data.userType === 'resume_request') {
    return `
Resume Request

Email: ${data.email}
Job Description: ${data.jobDescription}

Message:
${data.message}
    `.trim();
  } else {
    return `
Client Inquiry

Name: ${data.name}
Project Type: ${data.projectType}
Budget: ${data.budget || 'N/A'}
Timeline: ${data.timeline || 'N/A'}
Email: ${data.email}

Message:
${data.message}
    `.trim();
  }
}
