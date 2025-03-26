import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const iconsDirectory = path.join(process.cwd(), 'public/images/NewIcons');
  
  try {
    // Read directory and get file names
    const files = fs.readdirSync(iconsDirectory);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error reading icons directory:', error);
    return NextResponse.json({ error: 'Failed to fetch skill icons' }, { status: 500 });
  }
} 