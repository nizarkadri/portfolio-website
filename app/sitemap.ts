import { MetadataRoute } from 'next'
import { getSortedProjectsData } from './lib/projects'
import { getAllPosts } from './lib/blog'

function getBaseUrl() {
  // Primary: Use environment variable (set in CI/CD)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Google Cloud Run: Auto-detect service URL if available
  if (process.env.GOOGLE_CLOUD_RUN_SERVICE && process.env.GOOGLE_CLOUD_RUN_REGION) {
    return `https://${process.env.GOOGLE_CLOUD_RUN_SERVICE}-${process.env.GOOGLE_CLOUD_RUN_REGION}.a.run.app`
  }
  
  // Production fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://nizarsway.com'
  }
  
  // Development fallback
  return 'http://localhost:3000'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  
  // Get all projects for dynamic sitemap generation
  const projects = await getSortedProjectsData()
  const posts = await getAllPosts()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]
  
  // Dynamic project pages
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
  // Dynamic blog pages
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...projectPages, ...blogPages]
} 