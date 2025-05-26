import { expect, test, describe, vi, beforeEach } from 'vitest';
import { GET } from './route'; // Adjust path as needed
import fs from 'fs';
import matter from 'gray-matter';
import { remark } from 'remark'; // Import remark itself
import html from 'remark-html'; // Import remark-html
import path from 'path';
import { NextRequest } from 'next/server';

// Mock modules
vi.mock('fs');
vi.mock('gray-matter');
vi.mock('remark-html', () => ({ default: vi.fn() })); // Mock default export of remark-html

// Mock remark chain
const mockProcess = vi.fn();
const mockUse = vi.fn().mockReturnThis(); // .use() returns 'this' (the remark instance)
const mockRemarkInstance = { use: mockUse, process: mockProcess };
vi.mock('remark', () => ({
  remark: vi.fn(() => mockRemarkInstance),
}));


const PROJECTS_DIR = path.join(process.cwd(), 'data/projects');

// Helper to create a mock NextRequest (not strictly used for params by route but good for structure)
const createMockNextRequest = (urlPath: string = '/') => {
  const url = new URL(`http://localhost${urlPath}`);
  return new NextRequest(url);
};


describe('Project Detail API Route - GET Handler', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Reset all mocks before each test
     // Ensure remark() itself returns the mock instance for each test
    (remark as vi.Mock).mockReturnValue(mockRemarkInstance);
    // Ensure mockUse is reset and still returns 'this' (mockRemarkInstance)
    mockUse.mockReset().mockReturnThis();
    // Ensure mockProcess is reset for each test
    mockProcess.mockReset();
  });

  test('should retrieve and process a specific project file successfully', async () => {
    const slug = 'test-project';
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    const markdownContent = `---
title: Test Project
description: A test description.
imageUrl: /test.jpg
technologies: ["TestTech"]
---
## Hello World
This is content.`;
    const frontmatter = { title: 'Test Project', description: 'A test description.', imageUrl: '/test.jpg', technologies: ["TestTech"] };
    const rawContent = '## Hello World\nThis is content.';
    const processedHtml = '<h2>Hello World</h2><p>This is content.</p>';

    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockReturnValue(markdownContent);
    (matter as unknown as vi.Mock).mockReturnValue({ data: frontmatter, content: rawContent });
    
    // Configure mockProcess for this successful test case
    mockProcess.mockResolvedValueOnce({ toString: () => processedHtml });

    const req = createMockNextRequest(`/api/projects/${slug}`);
    const context = { params: { slug } };
    const response = await GET(req as any, context);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(matter).toHaveBeenCalledWith(markdownContent);
    expect(remark).toHaveBeenCalled(); // Check if remark() was called
    expect(mockUse).toHaveBeenCalledWith(html); // Check if .use(html) was called
    expect(mockProcess).toHaveBeenCalledWith(rawContent); // Check if .process(rawContent) was called
    
    expect(responseBody).toEqual({
      slug,
      contentHtml: processedHtml,
      ...frontmatter,
    });
  });

  test('should return 404 if project file does not exist', async () => {
    const slug = 'non-existent-project';
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    (fs.existsSync as vi.Mock).mockReturnValue(false);

    const req = createMockNextRequest(`/api/projects/${slug}`);
    const context = { params: { slug } };
    const response = await GET(req as any, context);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    expect(responseBody.error).toBe('Project not found');
  });

  test('should return 500 if fs.readFileSync fails', async () => {
    const slug = 'fail-read';
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    const errorMessage = 'readFileSync failed';

    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const req = createMockNextRequest(`/api/projects/${slug}`);
    const context = { params: { slug } };
    const response = await GET(req as any, context);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(responseBody.error).toBe('Failed to fetch project');
  });

  test('should return 500 if gray-matter fails', async () => {
    const slug = 'fail-matter';
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    const markdownContent = "Invalid frontmatter content";
    const errorMessage = 'gray-matter failed';

    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockReturnValue(markdownContent);
    (matter as unknown as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const req = createMockNextRequest(`/api/projects/${slug}`);
    const context = { params: { slug } };
    const response = await GET(req as any, context);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(matter).toHaveBeenCalledWith(markdownContent);
    expect(responseBody.error).toBe('Failed to fetch project');
  });

  test('should return 500 if remark processing fails', async () => {
    const slug = 'fail-remark';
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    const markdownContent = `---
title: Test
---
Some content`;
    const frontmatter = { title: 'Test' };
    const rawContent = 'Some content';
    const errorMessage = 'remark processing failed';

    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockReturnValue(markdownContent);
    (matter as unknown as vi.Mock).mockReturnValue({ data: frontmatter, content: rawContent });
    
    // Configure mockProcess (which is remarkInstance.process) to throw for this test case
    mockProcess.mockImplementation(async () => {
      throw new Error(errorMessage);
    });
    
    const req = createMockNextRequest(`/api/projects/${slug}`);
    const context = { params: { slug } };
    const response = await GET(req as any, context);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(remark).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith(html);
    expect(mockProcess).toHaveBeenCalledWith(rawContent);
    expect(responseBody.error).toBe('Failed to fetch project');
  });
});
