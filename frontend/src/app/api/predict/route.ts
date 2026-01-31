import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const upstreamResponse = await fetch('https://reimagined-space-sniffle-pjvp5g7rpqjjhr9ww-8000.app.github.dev/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
      },
      body,
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream request failed' },
      { status: 502 }
    );
  }
}

