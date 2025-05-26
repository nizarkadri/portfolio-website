import { expect, test, describe, vi, beforeEach } from 'vitest';
import { GET } from './route'; // Assuming GET is the handler
import fs from 'fs';
import path from 'path';

// Mock fs
vi.mock('fs');

const SKILL_ICONS_DIR = path.join(process.cwd(), 'public/images/NewIcons');

describe('Skill Icons API Route - GET Handler', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  test('should retrieve and return multiple icon filenames successfully', async () => {
    const mockFilenames = ['icon1.svg', 'icon2.png', 'icon3.jpg', 'another.gif'];
    (fs.readdirSync as vi.Mock).mockReturnValue(mockFilenames);

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fs.readdirSync).toHaveBeenCalledWith(SKILL_ICONS_DIR);
    expect(responseBody).toEqual(mockFilenames);
  });

  test('should return an empty array when the NewIcons directory is empty', async () => {
    const mockFilenames: string[] = [];
    (fs.readdirSync as vi.Mock).mockReturnValue(mockFilenames);

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fs.readdirSync).toHaveBeenCalledWith(SKILL_ICONS_DIR);
    expect(responseBody).toEqual([]);
  });

  test('should return 500 if fs.readdirSync fails', async () => {
    const errorMessage = 'readdirSync failed catastrophically';
    (fs.readdirSync as vi.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(fs.readdirSync).toHaveBeenCalledWith(SKILL_ICONS_DIR);
    expect(responseBody.error).toBe('Failed to fetch skill icons');
  });
});
