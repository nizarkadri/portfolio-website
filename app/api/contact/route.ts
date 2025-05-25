import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    await resend.emails.send({
      from: process.env.RESEND_EMAIL!,
      to: 'nikk4apps@gmail.com',
      subject: `New ${data.userType} inquiry`,
      replyTo: data.email,
      text: generatePlainText(data),
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to send email', error: error.message }),
      { status: 500 }
    );
  }
}

function generatePlainText(data: any): string {
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
