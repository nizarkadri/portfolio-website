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

 export function getSortedProjectsData() {
   // Get file names under /projects
   const fileNames = fs.readdirSync(projectsDirectory);
   const allProjectsData = fileNames.map((fileName) => {
     // Remove ".md" from file name to get id
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
   // Sort projects by date (if you add a date field)
   return allProjectsData;
 }

 export async function getProjectData(slug: string) {
     const fullPath = path.join(projectsDirectory, `${slug}.md`);
     const fileContents = fs.readFileSync(fullPath, 'utf8');

     // Use gray-matter to parse the post metadata section
     const matterResult = matter(fileContents);

     // Use remark to convert markdown into HTML string
     const processedContent = await remark()
         .use(html)
         .process(matterResult.content);
     const contentHtml = processedContent.toString();


     // Combine the data with the id and contentHtml
     return {
         slug,
         contentHtml,
         ...(matterResult.data as {
           title: string;
           description: string;
           imageUrl: string;
           technologies: string[];
         }),
     };
 }
 export function getAllProjectSlugs() {
   const fileNames = fs.readdirSync(projectsDirectory);

   return fileNames.map((fileName) => {
     return {
       params: {
         slug: fileName.replace(/\.md$/, ''),
       },
     };
   });
 }