import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[TEST_ROUTE] GET /api/test - Route is working!');
  return NextResponse.json({
    success: true,
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
}
