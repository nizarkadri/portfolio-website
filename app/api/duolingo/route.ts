import { NextResponse } from 'next/server';

async function fetchDuolingoData(username: string) {
  try {
    // Using the unofficial Duolingo API endpoint
    const response = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Duolingo data');
    }

    const data = await response.json();
    
    // Process the data to match our expected format
    const user = data.users[0];
    
    if (!user) {
      throw new Error('User not found');
    }

    // Extract relevant information
    const processedData = {
      username: user.username,
      name: user.name,
      streak: user.streak,
      totalXp: user.totalXp,
      profilePicture: user.picture,
      languages: user.courses.map((course: any) => ({
        language: course.title,
        level: Math.floor(course.xp / 60), // Rough estimate of level based on XP
        xp: course.xp,
        progress: Math.min(100, Math.round((course.xp % 60) / 60 * 100)), // Rough estimate of level progress
      })),
    };

    return processedData;
  } catch (error) {
    console.error('Error fetching Duolingo data:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'nizarkadri';

  try {
    const data = await fetchDuolingoData(username);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Duolingo data' },
      { status: 500 }
    );
  }
} 