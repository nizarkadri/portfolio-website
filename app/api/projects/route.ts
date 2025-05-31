import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'data/projects');

// interface Project {
//   slug: string;
//   title: string;
//   description: string;
//   imageUrl: string;
//   technologies: string[];
//   contentHtml?: string;
// }

// GET /api/projects
export async function GET() {
  try {
    // Get file names under /projects
    const fileNames = fs.readdirSync(projectsDirectory);
    const allProjectsData = fileNames.map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        slug,
        ...(matterResult.data as {
          title: string;
          description: string;
          imageUrl: string;
          technologies: string[];
        }),
      };
    });

    return NextResponse.json(allProjectsData);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 