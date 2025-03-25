import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to favicon file
    const faviconPath = path.join(process.cwd(), 'public', 'favicon-samarthanam.ico');
    
    // Read the favicon file
    const favicon = await fs.promises.readFile(faviconPath);
    
    // Return the favicon with appropriate headers
    return new NextResponse(favicon, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    return new NextResponse(null, { status: 404 });
  }
} 