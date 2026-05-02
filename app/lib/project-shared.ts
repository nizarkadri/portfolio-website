export const PROJECT_PLACEHOLDER_IMAGE = '/images/Projects/project-placeholder.svg';

export interface ProjectFrontmatter {
  title?: string;
  description?: string;
  summary?: string;
  imageUrl?: string;
  technologies?: string[];
  featured?: boolean;
  order?: number;
  repoUrl?: string;
  liveUrl?: string;
  year?: string;
  status?: string;
  impact?: string;
  highlights?: string[];
}

export interface ProjectSummary {
  slug: string;
  title: string;
  description: string;
  summary: string;
  imageUrl: string;
  technologies: string[];
  featured: boolean;
  order: number;
  repoUrl?: string;
  liveUrl?: string;
  year?: string;
  status?: string;
  impact?: string;
  highlights: string[];
}

export interface Project extends ProjectSummary {
  contentHtml: string;
}
