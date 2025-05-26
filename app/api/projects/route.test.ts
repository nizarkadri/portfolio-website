import { expect, test, describe, vi, beforeEach } from 'vitest';
import { GET } from './route'; // Assuming GET is the handler
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

// Mock fs and gray-matter
vi.mock('fs');
vi.mock('gray-matter');

const PROJECTS_DIR = path.join(process.cwd(), 'data/projects');

describe('Projects API Route - GET Handler', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  test('should retrieve and process multiple project files correctly', async () => {
    const mockFiles = ['project-a.md', 'project-b.md'];
    const mockContentA = `---
title: Project A
description: Desc A
imageUrl: /img/a.jpg
technologies: ["Tech1", "Tech2"]
---
Content A`;
    const mockContentB = `---
title: Project B
description: Desc B
imageUrl: /img/b.jpg
technologies: ["Tech3"]
---
Content B`;

    const mockFrontmatterA = { title: 'Project A', description: 'Desc A', imageUrl: '/img/a.jpg', technologies: ["Tech1", "Tech2"] };
    const mockFrontmatterB = { title: 'Project B', description: 'Desc B', imageUrl: '/img/b.jpg', technologies: ["Tech3"] };

    (fs.readdirSync as vi.Mock).mockReturnValue(mockFiles);
    
    (fs.readFileSync as vi.Mock)
      .mockImplementation((filePath) => {
        if (filePath === path.join(PROJECTS_DIR, 'project-a.md')) {
          return mockContentA;
        }
        if (filePath === path.join(PROJECTS_DIR, 'project-b.md')) {
          return mockContentB;
        }
        throw new Error('File not found in mock');
      });

    (matter as unknown as vi.Mock).mockImplementation((content) => {
      if (content === mockContentA) {
        return { data: mockFrontmatterA };
      }
      if (content === mockContentB) {
        return { data: mockFrontmatterB };
      }
      return { data: {} }; // Default empty if content not recognized
    });

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fs.readdirSync).toHaveBeenCalledWith(PROJECTS_DIR);
    expect(fs.readFileSync).toHaveBeenCalledWith(path.join(PROJECTS_DIR, 'project-a.md'), 'utf8');
    expect(fs.readFileSync).toHaveBeenCalledWith(path.join(PROJECTS_DIR, 'project-b.md'), 'utf8');
    expect(matter).toHaveBeenCalledWith(mockContentA);
    expect(matter).toHaveBeenCalledWith(mockContentB);

    expect(responseBody).toEqual([
      { slug: 'project-a', ...mockFrontmatterA },
      { slug: 'project-b', ...mockFrontmatterB },
    ]);
  });

  test('should return an empty array when the projects directory is empty', async () => {
    (fs.readdirSync as vi.Mock).mockReturnValue([]);

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fs.readdirSync).toHaveBeenCalledWith(PROJECTS_DIR);
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(matter).not.toHaveBeenCalled();
    expect(responseBody).toEqual([]);
  });

  test('should return 500 if fs.readdirSync fails', async () => {
    const errorMessage = 'readdirSync failed';
    (fs.readdirSync as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch projects');
  });

  test('should return 500 if fs.readFileSync fails for a file', async () => {
    const mockFiles = ['project-a.md'];
    const errorMessage = 'readFileSync failed';

    (fs.readdirSync as vi.Mock).mockReturnValue(mockFiles);
    (fs.readFileSync as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(fs.readFileSync).toHaveBeenCalledWith(path.join(PROJECTS_DIR, 'project-a.md'), 'utf8');
    expect(responseBody.error).toBe('Failed to fetch projects');
  });

  test('should return 500 if gray-matter fails for a file', async () => {
    const mockFiles = ['project-a.md'];
    const mockContentA = "Valid content but matter will fail";
    const errorMessage = 'gray-matter failed';

    (fs.readdirSync as vi.Mock).mockReturnValue(mockFiles);
    (fs.readFileSync as vi.Mock).mockReturnValue(mockContentA);
    (matter as unknown as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(matter).toHaveBeenCalledWith(mockContentA);
    expect(responseBody.error).toBe('Failed to fetch projects');
  });
});
