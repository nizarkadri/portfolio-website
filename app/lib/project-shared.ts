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
  /** The live app needs an invite: the link says so and points to the contact page. */
  liveInviteOnly?: boolean;
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
  /** The live app needs an invite: the link says so and points to the contact page. */
  liveInviteOnly?: boolean;
  year?: string;
  status?: string;
  impact?: string;
  highlights: string[];
}

export interface Project extends ProjectSummary {
  contentHtml: string;
}
