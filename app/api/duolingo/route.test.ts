import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route'; // Assuming GET is the handler
import { NextRequest } from 'next/server';

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Helper to create a mock NextRequest
const createMockNextRequest = (searchParams: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/duolingo');
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.append(key, value);
  }
  return new NextRequest(url);
};

// Expected fetch options from route.ts
const EXPECTED_FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
  },
  cache: 'no-store',
};

describe('Duolingo API Route - GET Handler', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test('should fetch and process data for a specific username', async () => {
    const username = 'testuser';
    const mockDuolingoAPIData = { // Renamed to avoid confusion with processed data
      users: [
        {
          username: "testuser",
          name: "Test User",
          streak: 10,
          totalXp: 1000,
          picture: "/testuser.jpg", // As provided by Duolingo API
          courses: [
            { title: "Spanish", xp: 500 }, // 500 / 60 = 8.33 -> level 8, progress (20/60)*100 = 33
            { title: "French", xp: 150 }  // 150 / 60 = 2.5  -> level 2, progress (30/60)*100 = 50
          ]
        }
      ]
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDuolingoAPIData,
    });

    const req = createMockNextRequest({ username });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(`https://www.duolingo.com/2017-06-30/users?username=${username}`, EXPECTED_FETCH_OPTIONS);
    
    const expectedAPIDataUser = mockDuolingoAPIData.users[0];
    expect(responseBody).toEqual({
      username: expectedAPIDataUser.username,
      name: expectedAPIDataUser.name,
      streak: expectedAPIDataUser.streak,
      totalXp: expectedAPIDataUser.totalXp,
      profilePicture: expectedAPIDataUser.picture, // Route uses picture directly
      languages: expectedAPIDataUser.courses.map(course => ({
        language: course.title,
        level: Math.floor(course.xp / 60),
        xp: course.xp,
        progress: Math.min(100, Math.round((course.xp % 60) / 60 * 100)),
      })),
    });
  });

  test('should fetch and process data for default username (nizarkadri)', async () => {
    const defaultUsername = 'nizarkadri';
    const mockDuolingoAPIData = {
      users: [
        {
          username: defaultUsername,
          name: "Nizar Kadri",
          streak: 100,
          totalXp: 20000, // 20000 / 60 = 333.33 -> level 333, progress (20/60)*100 = 33
          picture: "/nizarkadri.jpg",
          courses: [{ title: "German", xp: 18000 }] // 18000 / 60 = 300 -> level 300, progress 0
        }
      ]
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDuolingoAPIData,
    });

    const req = createMockNextRequest(); // No username, should default
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(`https://www.duolingo.com/2017-06-30/users?username=${defaultUsername}`, EXPECTED_FETCH_OPTIONS);
    
    const expectedAPIDataUser = mockDuolingoAPIData.users[0];
    expect(responseBody).toEqual({
      username: expectedAPIDataUser.username,
      name: expectedAPIDataUser.name,
      streak: expectedAPIDataUser.streak,
      totalXp: expectedAPIDataUser.totalXp,
      profilePicture: expectedAPIDataUser.picture,
      languages: expectedAPIDataUser.courses.map(course => ({
        language: course.title,
        level: Math.floor(course.xp / 60),
        xp: course.xp,
        progress: Math.min(100, Math.round((course.xp % 60) / 60 * 100)),
      })),
    });
  });

  test('should return 500 if user not found (empty users array)', async () => {
    const username = 'nonexistentuser';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ users: [] }), 
    });

    const req = createMockNextRequest({ username });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });
  
  test('should return 200 with undefined username if API provides user object without username property', async () => {
    const usernameParam = 'userwithmissingusernameprop';
    const mockDuolingoAPIData = {
      users: [
        {
          // username property is missing
          name: "Malformed User",
          streak: 10,
          totalXp: 1000,
          picture: "/malformeduser.jpg",
          courses: [{ title: "Klingon", xp: 500 }]
        }
      ]
    };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDuolingoAPIData,
    });

    const req = createMockNextRequest({ username: usernameParam });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200); // Route does not throw 500 for this
    const expectedAPIDataUser = mockDuolingoAPIData.users[0];
    expect(responseBody).toEqual({
      username: undefined, // Username will be undefined
      name: expectedAPIDataUser.name,
      streak: expectedAPIDataUser.streak,
      totalXp: expectedAPIDataUser.totalXp,
      profilePicture: expectedAPIDataUser.picture,
      languages: expectedAPIDataUser.courses.map(course => ({
        language: course.title,
        level: Math.floor(course.xp / 60),
        xp: course.xp,
        progress: Math.min(100, Math.round((course.xp % 60) / 60 * 100)),
      })),
    });
  });


  test('should return 500 on fetch network failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network failed'));

    const req = createMockNextRequest({ username: 'anyuser' });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });

  test('should return 500 if Duolingo API returns non-OK status (e.g., 403)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    });

    const req = createMockNextRequest({ username: 'anyuser' });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });
  
  test('should return 500 if Duolingo API returns non-OK status (e.g., 500 server error)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error from Duolingo' }),
    });

    const req = createMockNextRequest({ username: 'anyuser' });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });


  test('should return 500 if Duolingo API returns unexpected JSON (e.g., users field missing)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ notUsers: [] }), // 'users' array is missing
    });

    const req = createMockNextRequest({ username: 'anyuser' });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });

  test('should return 500 if Duolingo API returns unexpected JSON (e.g., courses not an array)', async () => {
    const username = 'testusercourses';
    const mockDuolingoAPIData = {
      users: [
        {
          username: "testusercourses",
          name: "Test User Courses",
          streak: 10,
          totalXp: 1000,
          picture: "/testusercourses.jpg",
          courses: "not an array" // Malformed
        }
      ]
    };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDuolingoAPIData,
    });

    const req = createMockNextRequest({ username });
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch Duolingo data');
  });
});
