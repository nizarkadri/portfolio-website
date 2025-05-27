const PromptTemplate = (): string => {
    const latexTemplateContent: string = `
    %-------------------------
    % Resume in Latex
    % Author : Jake Gutierrez
    % Based off of: https://github.com/sb2nov/resume
    % License : MIT
    %------------------------
    
    \\documentclass[letterpaper,11pt]{article}
    
    \\usepackage{latexsym}
    \\usepackage[empty]{fullpage}
    \\usepackage{titlesec}
    \\usepackage{marvosym}
    \\usepackage[usenames,dvipsnames]{color}
    \\usepackage{verbatim}
    \\usepackage{enumitem}
    \\usepackage[hidelinks]{hyperref}
    \\usepackage{fancyhdr}
    \\usepackage[english]{babel}
    \\usepackage{tabularx}
    \\input{glyphtounicode}
    \\usepackage[default]{sourcesanspro}
    
    \\pagestyle{fancy}
    \\fancyhf{}
    \\fancyfoot{}
    \\renewcommand{\\headrulewidth}{0pt}
    \\renewcommand{\\footrulewidth}{0pt}
    
    \\addtolength{\\oddsidemargin}{-0.5in}
    \\addtolength{\\evensidemargin}{-0.5in}
    \\addtolength{\\textwidth}{1in}
    \\addtolength{\\topmargin}{-0.7in} % Adjusted for potentially more content - MODIFIED
    \\addtolength{\\textheight}{1.0in} % Adjusted for potentially more content - MODIFIED
    
    \\urlstyle{same}
    \\raggedbottom
    \\raggedright
    \\setlength{\\tabcolsep}{0in}
    
    \\titleformat{\\section}{
      \\vspace{-9pt}\\scshape\\raggedright\\large % MODIFIED space before section
    }{}{0em}{}[\\color{black}\\titlerule \\vspace{-3pt}] % MODIFIED space after section rule
    \\pdfgentounicode=1
    
    \\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}} % MODIFIED space after item
    \\newcommand{\\resumeSubheading}[4]{
      \\vspace{2pt}\\item % MODIFIED space before subheading
        \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
          \\textbf{#1} & #2 \\\\
          \\textit{\\small#3} & \\textit{\\small #4} \\\\
        \\end{tabular*}\\vspace{-5pt}} % MODIFIED space after subheading
    \\newcommand{\\resumeProjectHeading}[2]{
      \\vspace{-1pt}\\item % MODIFIED space before project heading
        \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
          \\small#1 & #2 \\\\
        \\end{tabular*}\\vspace{-5pt}} % MODIFIED space after project heading
    \\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-1pt}} % MODIFIED space for subitem (this is in addition to \\resumeItem's vspace)
    \\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}, topsep=0pt, partopsep=0pt]}
    \\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{-3pt}} % MODIFIED space after list
    \\newcommand{\\resumeItemListStart}{\\begin{itemize}[topsep=0pt, partopsep=0pt]}
    \\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-3pt}} % MODIFIED space after list
    
    \\begin{document}
    
    \\begin{center}
      \\textbf{\\Huge \\scshape Nizar Kadri} \\\\ \\vspace{1pt} % MODIFIED space
      \\small 647-562-4423 $|$ \\href{mailto:nizar.main01@gmail.com}{nizar.main01@gmail.com} $|$ 
      \\href{https://linkedin.com/in/nizarkadri}{linkedin.com/in/nizarkadri} $|$ 
      \\href{https://github.com/nizarkadri}{github.com/nizarkadri}
    \\end{center}
    
    %-----------TECHNICAL SKILLS-----------
    \\section{Technical Skills}
     \\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt] % MODIFIED itemsep
      \\small{\\item{
        \\textbf{Languages:} Python, JavaScript (ES6+), TypeScript, Go, Java, C++, C\\#, HTML/CSS \\\\
        \\textbf{Frameworks & Libraries:} React.js, Next.js, Vue.js, Angular (7+), Node.js, Spring Boot, REST APIs, GraphQL \\\\
        \\textbf{Cloud & DevOps:} AWS (EC2, S3, Lambda, ECS, DynamoDB, RDS, Glue, CodeBuild, CodeDeploy), CI/CD, Jenkins, Docker, Kubernetes, Linux, Git, SQL, IBM Db2
        
      }}
     \\end{itemize}\\vspace{-12pt} % MODIFIED vspace to pull up next section
    
    %-----------EXPERIENCE-----------
    \\section{Experience}
    \\resumeSubHeadingListStart
    
    \\resumeSubheading
    {Software Engineer}{June 2022 -- Dec 2024}
    {CGI}{Toronto, Canada}
    \\resumeItemListStart
      \\resumeItem{Collaborated with product managers and stakeholders in feature design and roadmap discussions, translating designs into high-quality, maintainable, and scalable code using JavaScript (Vue.js) and other technologies.}
      \\resumeItem{Ensured end-to-end ownership of projects, from design through implementation to deployment on AWS infrastructure.}
      \\resumeItem{Led the performance re-architecture of Ontario's SEDAR Plus web portal, significantly improving accessibility (WCAG 2.1 compliance by 98\\%) and page performance by 70\\%.}
      \\resumeItem{Engineered and migrated monolithic systems to microservices architecture using Spring Boot and Docker, reducing deployment time by 40\\% and enhancing system scalability.}
      \\resumeItem{Developed and optimized REST APIs and rendering logic, achieving a 40\\% reduction in latency and a 50\\% increase in API throughput.}
      \\resumeItem{Provided strong analytical insights and applied design patterns to solve complex technical challenges.}
      \\resumeItem{Enhanced system robustness by integrating comprehensive unit and integration tests, reducing production issues by 45\\% and contributing to CI/CD pipelines.}
      \\resumeItem{Deployed components and services using Jenkins with AWS integration (including AWS CodeBuild and CodeDeploy).}
    \\resumeItemListEnd
    
    \\resumeSubheading
    {Cloud Administrator}{Sept 2021 -- May 2022}
    {Fiera Capital Corp}{Toronto, Canada}
    \\resumeItemListStart
      \\resumeItem{Migrated legacy infrastructure to Azure cloud, resulting in a 30\\% reduction in operational costs and a 25\\% decrease in downtime.}
      \\resumeItem{Designed and deployed internal knowledge-sharing portals using Microsoft SharePoint, improving team collaboration.}
    \\resumeItemListEnd
    
    \\resumeSubheading
    {Frontend Developer Intern}{Dec 2019 -- Apr 2020}
    {TechSym Solutions LLP}{(Remote)}
    \\resumeItemListStart
      \\resumeItem{Integrated 4 major e-commerce platforms using JavaScript and REST APIs, enhancing platform functionality.}
      \\resumeItem{Reverse-engineered APIs using Chrome DevTools and built testing tools as Chrome extensions.}
      \\resumeItem{Delivered high-performance frontend code for the production version of DealJaan.}
    \\resumeItemListEnd
    
    \\resumeSubHeadingListEnd
    
    %-----------PROJECTS-----------
    \\section{Projects}
    \\resumeSubHeadingListStart
    
    \\resumeProjectHeading{\\textbf{Concurrent Skin Disease Detection Platform} $|$ Node.js, React, Microsoft Custom Vision}{}
    \\resumeItemListStart
      \\resumeItem{Created an AI-enhanced web application for real-time skin disease detection using over 1,000 labeled images, demonstrating experience with user-facing products.}
      \\resumeItem{Integrated rendering optimizations and asynchronous image processing to support concurrent user access and ensure scalability.}
    \\resumeItemListEnd
    
    \\resumeProjectHeading{\\textbf{FMCG Business Intelligence Dashboard} $|$ Python, Android Studio, IBM Cognos}{}
    \\resumeItemListStart
      \\resumeItem{Built a POS simulation app and a business intelligence dashboard to visualize FMCG market insights using Python for data processing and IBM Cognos for visualization.}
      \\resumeItem{This project involved elements of building and managing a data pipeline from transaction simulation to insights visualization.}
    \\resumeItemListEnd
    
    \\resumeProjectHeading{\\textbf{Local Generative Model Deployment & Tuning} $|$ Python, Stable Diffusion, StyleGAN3, Kohya GUI}{}
    \\resumeItemListStart
      \\resumeItem{Installed, executed, and fine-tuned generative image models (e.g., SD 1.5, StyleGAN3) on a local GPU environment, optimizing for performance and controlled output variation.}
      \\resumeItem{Resolved complex build issues (CUDA, MSVC, xFormers) to successfully run PhotoMaker V2 on Windows.}
    \\resumeItemListEnd
    
    % \\resumeProjectHeading{\\textbf{Distributed Student Networking App} $|$ Node.js, Express, IBM Db2}{}
    % \\resumeItemListStart
    %  \\resumeItem{Designed and deployed a full-stack collaboration platform supporting live video, chat, and calendar events, showcasing an understanding of distributed systems.}
    % \\resumeItemListEnd
    
    \\resumeSubHeadingListEnd
    
    %-----------EDUCATION-----------
    \\section{Education}
    \\resumeSubHeadingListStart
    \\resumeSubheading
    {University of Windsor}{Windsor, ON, Canada}
    {Master of Applied Computing (AI/ML Focus)}{Sept 2020 -- May 2022}
    \\resumeSubheading
    {Ganpat University}{Gujarat, India}
    {Bachelor of Technology in Computer Science (IBM Cloud Certified)}{Aug 2016 -- Aug 2020}
    \\resumeSubHeadingListEnd
    
    \\end{document}
    `;


    const systemPromptContent: string = `
    You are an expert AI assistant specializing in tailoring professional LaTeX resumes. Your task is to adapt my original resume to a specific job description provided by the user, using my original resume's LaTeX structure as a strict template.
    
    **IMPORTANT INSTRUCTIONS:**
    
    1.  **Dual Role of Provided LaTeX:**
        The LaTeX code provided below serves TWO critical purposes:
        * **IT IS MY ORIGINAL RESUME:** The textual content within this LaTeX code (e.g., job titles, company names, bullet points under experiences and projects, skill listings, education details) is the **primary source of my professional information, skills, and experiences.** You must draw from this existing content.
        * **IT IS THE STRICT LATEX TEMPLATE:** The entire LaTeX structure, including document class, packages, custom commands (like \\resumeSubheading, \\resumeItem, etc.), sectioning, ordering, and all formatting, **MUST be preserved exactly.** You should not invent new LaTeX commands, alter existing ones, or change the overall layout.
    
    2.  **Your Task:**
        * Carefully analyze the **Job Description** that will be provided by the user in the next message.
        * Review my original resume content found within the LaTeX template below.
        * **Modify and tailor the textual content WITHIN the existing sections** (e.g., the text within \\resumeItem{} commands under 'Experience', the list of skills under 'Technical Skills', project descriptions, summary if present) of my resume to best highlight my qualifications for that specific job description.
        * This may involve:
            * Rewriting bullet points to use keywords from the job description.
            * Re-emphasizing certain skills or experiences that are particularly relevant.
            * Slightly reordering bullet points within a specific job or project for better alignment.
            * Condensing or expanding on certain points from my original content based on their relevance to the job description.
        * **CRITICAL: Do NOT change the LaTeX commands themselves, the defined section structure, or the overall formatting.** Your modifications must be to the *textual content* that these LaTeX commands encapsulate. For instance, if my original resume has three bullet points for a job, and you determine only two are highly relevant and need tailoring, you adapt those two and ensure they fit within the existing \\resumeItemListStart ... \\resumeItemListEnd structure.
        * If a major section of my original resume (e.g., a very old job, or a project completely unrelated) seems largely irrelevant to the job description, you should still include the section heading and its basic LaTeX structure as defined in the template, but you can significantly reduce or minimally tailor its textual content. The goal is to maintain template integrity.
    
    3.  **LaTeX Escaping:**
        * Ensure that any new or modified textual content you generate and insert into the LaTeX template is **properly LaTeX-escaped.** Special characters such as %, &, _, #, $, {, } must be written as \\%, \\&, \\_, \\#, \\$, \\{, \\} respectively. Pay close attention to this to prevent compilation errors.
    
    4.  **Output:**
        * The final output **MUST be the complete LaTeX document**, starting with \\documentclass and ending with \\end{document}, with the textual content tailored as requested. It should be ready for direct LaTeX compilation.
    
    Here is my original resume and the LaTeX template to be used:
    
    \`\`\`latex
    ${latexTemplateContent}
    \`\`\`
    
    I will now provide the job description.
    `;
    
    
    return (
        
        systemPromptContent
    )
}

export default PromptTemplate;