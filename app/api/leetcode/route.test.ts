import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route'; 
import { NextRequest } from 'next/server';

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const createMockNextRequest = () => {
  const url = new URL('http://localhost/api/leetcode');
  return new NextRequest(url);
};

const EXPECTED_LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const EXPECTED_USERNAME = 'nizarkadri'; 
const EXPECTED_GRAPHQL_QUERY_FROM_ROUTE = `
          query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                ranking
                reputation
                starRating
                userAvatar
              }
            }
          }
        `;

const EXPECTED_FETCH_PAYLOAD = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
  },
  body: JSON.stringify({
    query: EXPECTED_GRAPHQL_QUERY_FROM_ROUTE,
    variables: { username: EXPECTED_USERNAME },
  }),
};

// Fallback data as defined in route.ts
const ROUTE_FALLBACK_SOLVED = { total: 142, easy: 51, medium: 67, hard: 24 };
const ROUTE_FALLBACK_RANKING = 195634;


describe('LeetCode API Route - GET Handler', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test('should fetch and process data when all data is present', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: {
            acSubmissionNum: [
              { difficulty: "All", count: "150", submissions: "300" },
              { difficulty: "Easy", count: "70", submissions: "100" },
              { difficulty: "Medium", count: "50", submissions: "120" },
              { difficulty: "Hard", count: "30", submissions: "80" }
            ]
          },
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 10, starRating: 3 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });

    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(EXPECTED_LEETCODE_GRAPHQL_URL, EXPECTED_FETCH_PAYLOAD);
    
    const apiUser = mockLeetCodeAPIResponse.data.matchedUser;
    expect(responseBody).toEqual({
      username: apiUser.username,
      profileUrl: `https://leetcode.com/${apiUser.username}/`,
      solved: { total: 150, easy: 70, medium: 50, hard: 30 },
      ranking: apiUser.profile.ranking,
      avatar: apiUser.profile.userAvatar,
      reputation: apiUser.profile.reputation,
      starRating: apiUser.profile.starRating,
    });
  });

  test('should process data correctly when some difficulty counts are missing', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: {
            acSubmissionNum: [
              { difficulty: "All", count: "120", submissions: "220" },
              { difficulty: "Easy", count: "70", submissions: "100" },
              { difficulty: "Medium", count: "50", submissions: "120" }
              // "Hard" is missing
            ]
          },
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 10, starRating: 3 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });

    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.solved).toEqual({ total: 120, easy: 70, medium: 50, hard: 0 });
  });

  test('should use fallback "solved" data and potentially fallback "ranking" if API ranking is also 0, when all API counts are zero', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: {
            acSubmissionNum: [
              { difficulty: "All", count: "0", submissions: "0" },
              { difficulty: "Easy", count: "0", submissions: "0" },
              { difficulty: "Medium", count: "0", submissions: "0" },
              { difficulty: "Hard", count: "0", submissions: "0" }
            ]
          },
          // Case 1: API ranking is also 0, so ranking should fallback
          profile: { ranking: 0, userAvatar: "avatar.jpg", reputation: 0, starRating: 0 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.solved).toEqual(ROUTE_FALLBACK_SOLVED);
    expect(responseBody.ranking).toEqual(ROUTE_FALLBACK_RANKING); // API ranking was 0, so it uses fallback
    expect(responseBody.username).toEqual(EXPECTED_USERNAME);
    expect(responseBody.avatar).toEqual("avatar.jpg");
  });
  
  test('should NOT use fallback "ranking" if API ranking is non-zero, even if counts are zero', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: {
            acSubmissionNum: [
              { difficulty: "All", count: "0", submissions: "0" },
              { difficulty: "Easy", count: "0", submissions: "0" },
              { difficulty: "Medium", count: "0", submissions: "0" },
              { difficulty: "Hard", count: "0", submissions: "0" }
            ]
          },
          // Case 2: API ranking is non-zero, so ranking should NOT fallback
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 0, starRating: 0 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.solved).toEqual(ROUTE_FALLBACK_SOLVED); // Solved fallbacks because counts are 0
    expect(responseBody.ranking).toEqual(12345); // Ranking from API because it's non-zero
  });

  test('should NOT use fallback "ranking" when API ranking is 0 IF solved counts are non-zero', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: {
            acSubmissionNum: [ // Solved counts are non-zero
              { difficulty: "All", count: "10", submissions: "10" },
              { difficulty: "Easy", count: "5", submissions: "5" }
            ]
          },
          profile: { ranking: 0, userAvatar: "avatar.jpg", reputation: 1, starRating: 0 } // API ranking is 0
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.solved).toEqual({ total: 10, easy: 5, medium: 0, hard: 0 }); // Solved from API
    expect(responseBody.ranking).toEqual(0); // Ranking from API (0), does not fallback because solved counts are non-zero
    expect(responseBody.avatar).toEqual("avatar.jpg");
  });

  test('should use fallback "solved" data when acSubmissionNum is empty array', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: { acSubmissionNum: [] }, // Empty array
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 1, starRating: 0 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    // Since acSubmissionNum is empty, all individual counts (total, easy, medium, hard) will be 0.
    // This triggers the condition for solved fallback.
    expect(responseBody.solved).toEqual(ROUTE_FALLBACK_SOLVED); 
    expect(responseBody.ranking).toEqual(12345); // Ranking from API
  });

  test('should return 500 when acSubmissionNum is null due to TypeError', async () => {
     const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: {
          username: EXPECTED_USERNAME,
          submitStats: { acSubmissionNum: null }, // This will cause .find to fail
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 1, starRating: 0 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toContain('Failed to fetch LeetCode profile: Cannot read properties of null');
  });

  test('should return 500 on fetch network failure', async () => {
    const networkError = new Error('Network failed');
    fetchMock.mockRejectedValueOnce(networkError);
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe(`Failed to fetch LeetCode profile: ${networkError.message}`);
  });

  test('should return 500 if LeetCode API returns non-OK status', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 502, statusText: 'Bad Gateway' });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to fetch LeetCode profile');
  });

  test('should return 404 if matchedUser is null (user not found by API)', async () => {
    const mockLeetCodeAPIResponse = { data: { matchedUser: null } };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody.error).toBe('User not found or API returned unexpected data');
  });

  test('should return 404 if data.data is missing (unexpected API structure)', async () => {
    const mockLeetCodeAPIResponse = { notDataAtAll: {} }; 
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody.error).toBe('User not found or API returned unexpected data');
  });
  
  test('should return 404 if data.data.matchedUser path is broken (e.g. data.data has no matchedUser)', async () => {
    const mockLeetCodeAPIResponse = { data: {} }; // matchedUser is missing inside data.data
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody.error).toBe('User not found or API returned unexpected data');
  });
   
  test('should return 500 if submitStats is missing (leading to TypeError)', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: { 
          username: EXPECTED_USERNAME,
          // submitStats is missing
          profile: { ranking: 12345, userAvatar: "avatar.jpg", reputation: 1, starRating: 0 }
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toContain('Failed to fetch LeetCode profile: Cannot read properties of undefined'); 
  });

  test('should return 500 if profile is missing (leading to TypeError)', async () => {
    const mockLeetCodeAPIResponse = {
      data: {
        matchedUser: { 
          username: EXPECTED_USERNAME,
          submitStats: { acSubmissionNum: [] },
          // profile is missing
        }
      }
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockLeetCodeAPIResponse });
    const req = createMockNextRequest();
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toContain('Failed to fetch LeetCode profile: Cannot read properties of undefined');
  });
});
