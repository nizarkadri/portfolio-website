import { NextResponse } from 'next/server';

type onlyRequiredCourseFields = {
  title: string;
  xp: number;
}

// More accurate level calculation based on Duolingo's progression system
function calculateLevelAndProgress(xp: number) {
  // Duolingo uses an increasing XP requirement per level
  // This is a more realistic approximation of their system
  let level = 1;
  let totalXpForLevel = 0;
  let xpForCurrentLevel = 60; // Starting XP requirement
  
  while (totalXpForLevel + xpForCurrentLevel <= xp) {
    totalXpForLevel += xpForCurrentLevel;
    level++;
    // XP requirement increases gradually (roughly 10-15% per level in early levels)
    xpForCurrentLevel = Math.floor(xpForCurrentLevel * 1.12);
  }
  
  // Calculate progress within current level
  const xpInCurrentLevel = xp - totalXpForLevel;
  const progress = Math.min(100, Math.round((xpInCurrentLevel / xpForCurrentLevel) * 100));
  
  return { level, progress };
}

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
      languages: user.courses.map((course: onlyRequiredCourseFields) => {
        const { level, progress } = calculateLevelAndProgress(course.xp);
        return {
          language: course.title,
          level,
          xp: course.xp,
          progress,
        };
      }),
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
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to fetch Duolingo data', details: err.message },
      { status: 500 }
    );
  }
} 