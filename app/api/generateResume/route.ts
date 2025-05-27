import OpenAI from 'openai';
import PromptTemplate from '../../../components/PromptTemplate';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "<OPENROUTER_API_KEY>",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "<YOUR_SITE_URL>",
    "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "<YOUR_SITE_NAME>",
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, jobDescription } = body;

    if (!email || !jobDescription) {
      return NextResponse.json(
        { error: 'Email and job description are required' },
        { status: 400 }
      );
    }

    // Get the system prompt from PromptTemplate
    const systemPromptContent = PromptTemplate();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
    //   model: "google/gemini-2.5-pro-preview",
        model:"deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": systemPromptContent
            }
          ],
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Job Description:\n\n${jobDescription}\n\nPlease tailor my resume for this position and provide the complete LaTeX document.`
            }
          ]
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": `%-------------------------
                                % Resume in Latex
                                % Author : Jake Gutierrez
                                % Based off of: https://github.com/sb2nov/resume
                                % License : MIT
                                %------------------------`
                }
            ]
        }
      ],
    });

    const tailoredResume = completion.choices[0].message.content;

    // Here you could also send an email with the resume
    // For now, we'll just return the generated resume
    return NextResponse.json({
      success: true,
      message: 'Resume generated successfully',
      resume: tailoredResume,
      email: email
    });

  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}