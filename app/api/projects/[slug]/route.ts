import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const projectsDirectory = path.join(process.cwd(), 'data/projects');

// GET /api/projects/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } } 
  // context: { params: { slug: string } }
) {
  // Properly await params before destructuring
  // const params = await Promise.resolve(context.params);
  const { slug } = params;

  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Read markdown file as string
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Combine the data with the slug and contentHtml
    const projectData = {
      slug,
      contentHtml,
      ...(matterResult.data as {
        title: string;
        description: string;
        imageUrl: string;
        technologies: string[];
      }),
    };

    return NextResponse.json(projectData);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
} 