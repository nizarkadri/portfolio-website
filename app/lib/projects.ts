'use server';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import {
  PROJECT_PLACEHOLDER_IMAGE,
  Project,
  ProjectFrontmatter,
  ProjectSummary,
} from './project-shared';

const projectsDirectory = path.join(process.cwd(), 'data/projects');
const allowedProjectImageExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif']);

function getProjectFileNames() {
  return fs.readdirSync(projectsDirectory).filter((fileName) => fileName.endsWith('.md'));
}

function slugToTitle(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeProjectImagePath(imageUrl?: string) {
  if (!imageUrl) {
    return null;
  }

  const normalizedPath = imageUrl.trim().replace(/\\/g, '/');

  if (!normalizedPath.startsWith('/images/Projects/')) {
    return null;
  }

  const extension = path.extname(normalizedPath).toLowerCase();

  if (!allowedProjectImageExtensions.has(extension)) {
    return null;
  }

  return normalizedPath;
}

function projectImageExists(imageUrl: string) {
  const relativePath = imageUrl.replace(/^\/+/, '').split('/');
  return fs.existsSync(path.join(process.cwd(), 'public', ...relativePath));
}

function resolveProjectImage(slug: string, imageUrl?: string) {
  const preferredImage = normalizeProjectImagePath(imageUrl);
  const candidates = [
    preferredImage,
    ...Array.from(allowedProjectImageExtensions).map((extension) => `/images/Projects/${slug}${extension}`),
    PROJECT_PLACEHOLDER_IMAGE,
  ].filter((candidate, index, list): candidate is string => Boolean(candidate) && list.indexOf(candidate) === index);

  const resolvedImage = candidates.find(projectImageExists);

  return resolvedImage || PROJECT_PLACEHOLDER_IMAGE;
}

function normalizeProject(slug: string, data: ProjectFrontmatter): ProjectSummary {
  const technologies = Array.isArray(data.technologies) ? data.technologies : [];
  const highlights = Array.isArray(data.highlights) ? data.highlights.slice(0, 3) : [];

  return {
    slug,
    title: data.title?.trim() || slugToTitle(slug),
    description: data.description?.trim() || '',
    summary: data.summary?.trim() || data.description?.trim() || '',
    imageUrl: resolveProjectImage(slug, data.imageUrl),
    technologies,
    featured: Boolean(data.featured),
    order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
    repoUrl: data.repoUrl?.trim() || undefined,
    liveUrl: data.liveUrl?.trim() || undefined,
    year: data.year?.trim() || undefined,
    status: data.status?.trim() || undefined,
    impact: data.impact?.trim() || undefined,
    highlights,
  };
}

function compareProjects(a: ProjectSummary, b: ProjectSummary) {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  if (a.order !== b.order) {
    return a.order - b.order;
  }

  const aYear = Number.parseInt(a.year || '', 10) || 0;
  const bYear = Number.parseInt(b.year || '', 10) || 0;

  if (aYear !== bYear) {
    return bYear - aYear;
  }

  return a.title.localeCompare(b.title);
}

function readProjectSummary(fileName: string): ProjectSummary {
  const slug = fileName.replace(/\.md$/, '');
  const fullPath = path.join(projectsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return normalizeProject(slug, matterResult.data as ProjectFrontmatter);
}

const getSortedProjectsDataCached = cache(async (): Promise<ProjectSummary[]> => {
  return getProjectFileNames().map(readProjectSummary).sort(compareProjects);
});

export async function getSortedProjectsData(): Promise<ProjectSummary[]> {
  return getSortedProjectsDataCached();
}

export async function getFeaturedProjectsData(limit = 3): Promise<ProjectSummary[]> {
  const projects = await getSortedProjectsData();
  const featuredProjects = projects.filter((project) => project.featured);

  return (featuredProjects.length > 0 ? featuredProjects : projects).slice(0, limit);
}

const getProjectDataCached = cache(async (slug: string): Promise<Project> => {
  const fullPath = path.join(projectsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark().use(html).process(matterResult.content);

  return {
    ...normalizeProject(slug, matterResult.data as ProjectFrontmatter),
    contentHtml: processedContent.toString(),
  };
});

export async function getProjectData(slug: string): Promise<Project> {
  return getProjectDataCached(slug);
}

export async function getAllProjectSlugs() {
  return getProjectFileNames().map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}