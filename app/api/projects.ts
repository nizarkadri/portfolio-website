// This file is deprecated. Use app/lib/projects.ts instead.
// This is kept for backward compatibility

'use server';

// * **Explanation:**
//     *   `getSortedProjectsData()`: Reads all Markdown files in the `data/projects` directory, extracts the frontmatter data, and returns an array of project data (without the full Markdown content). This is used for the project listing page.
//     *   `getProjectData(slug)`: Reads a *single* Markdown file based on the `slug`, extracts the frontmatter, *and* converts the Markdown content to HTML. This is used for the individual project detail pages.
//     * `getAllProjectSlugs()`: Returns an array of `slug` that is required by the `getStaticPaths` in the project detail page.
//     *   `fs`, `path`:  Node.js modules for working with the file system.
//     *   `gray-matter`:  Parses the Markdown frontmatter.
//     *   `remark`, `remark-html`: Converts Markdown to HTML. You need to install these: `npm install gray-matter remark remark-html`.
 
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const projectsDirectory = path.join(process.cwd(), 'data/projects');

export async function getSortedProjectsData() {
  throw new Error("This function is deprecated. Use app/lib/projects.ts instead.");
}

export async function getProjectData() {
  throw new Error("This function is deprecated. Use app/lib/projects.ts instead.");
}

export async function getAllProjectSlugs() {
  throw new Error("This function is deprecated. Use app/lib/projects.ts instead.");
}