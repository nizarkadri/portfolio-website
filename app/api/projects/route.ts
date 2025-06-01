import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
    // Debug: Log the current working directory
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);
    
    // Debug: Check if data directory exists
    const dataDir = path.join(cwd, 'data');
    console.log('Data directory path:', dataDir);
    console.log('Data directory exists:', fs.existsSync(dataDir));
    
    if (fs.existsSync(dataDir)) {
      console.log('Data directory contents:', fs.readdirSync(dataDir));
    }
    
    // Debug: Check projects directory
    const projectsDirectory = path.join(cwd, 'data', 'projects');
    console.log('Projects directory path:', projectsDirectory);
    console.log('Projects directory exists:', fs.existsSync(projectsDirectory));
    
    if (!fs.existsSync(projectsDirectory)) {
      // Try alternative paths
      const altPath1 = path.join(cwd, 'data/projects');
      const altPath2 = path.resolve(cwd, 'data', 'projects');
      const altPath3 = path.join(process.env.PWD || cwd, 'data', 'projects');
      
      console.log('Alternative path 1:', altPath1, 'exists:', fs.existsSync(altPath1));
      console.log('Alternative path 2:', altPath2, 'exists:', fs.existsSync(altPath2));
      console.log('Alternative path 3:', altPath3, 'exists:', fs.existsSync(altPath3));
      
      return NextResponse.json(
        { 
          error: 'Projects directory not found',
          debug: {
            cwd,
            projectsDirectory,
            dataDir,
            dataDirExists: fs.existsSync(dataDir),
            projectsDirExists: fs.existsSync(projectsDirectory)
          }
        },
        { status: 500 }
      );
    }
    
    // Get file names under /projects
    const fileNames = fs.readdirSync(projectsDirectory);
    console.log('Found project files:', fileNames);
    
    const allProjectsData = fileNames
      .filter(fileName => fileName.endsWith('.md')) // Only process .md files
      .map((fileName) => {
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

    console.log('Processed projects:', allProjectsData.length);
    return NextResponse.json(allProjectsData);
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Enhanced error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        cwd: process.cwd()
      },
      { status: 500 }
    );
  }
} 