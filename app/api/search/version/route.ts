import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SearchIndex from '@/models/SearchIndex';

export const dynamic = 'force-dynamic';

/**
 * Lightweight endpoint that returns the current search index version (lastUpdated, count).
 * Clients can compare with their cached version to invalidate IndexedDB when the server index is newer.
 */
export async function GET() {
  try {
    await dbConnect();

    const index = await SearchIndex.findOne({ version: '1.0' })
      .select('lastUpdated count')
      .lean();

    if (!index || !index.lastUpdated) {
      return NextResponse.json(
        { lastUpdated: null, count: 0 },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
          }
        }
      );
    }

    return NextResponse.json(
      {
        lastUpdated: index.lastUpdated,
        count: index.count ?? 0
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching search index version:', error);
    return NextResponse.json(
      { lastUpdated: null, count: 0 },
      { status: 500 }
    );
  }
}
