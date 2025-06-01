import { Resend } from 'resend';
import { NextResponse } from 'next/server';



type RecruiterData = {
  userType: 'recruiter';
  email: string;
  company: string;
  position: string;
  jobDescription: string;
  employmentType: string;
  interview: string;
  workLocation: string;
  locationDetails?: string;
  message?: string;
};

type ResumeRequestData = {
  userType: 'resume_request';
  email: string;
  jobDescription: string;
  message?: string;
};

type ClientData = {
  userType: 'client';
  email: string;
  name: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  message: string;
};

type InquiryData = RecruiterData | ResumeRequestData | ClientData;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_EMAIL!,
      to: 'nikk4apps@gmail.com',
      subject: `New ${data.userType} inquiry`,
      replyTo: data.email,
      text: generatePlainText(data),
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {

    const err = error as Error;
    console.error(err);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to send email', error: err.message }),
      { status: 500 }
    );
  }
}

function generatePlainText(data: InquiryData): string {
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
