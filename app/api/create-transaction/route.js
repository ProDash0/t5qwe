import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const ENKI_API_URL = 'https://api.enki-bank.com/v1';
    const ENKI_PUBLIC_KEY = process.env.ENKI_PUBLIC_KEY;
    const ENKI_SECRET_KEY = process.env.ENKI_SECRET_KEY;

    const authHeader = 'Basic ' + Buffer.from(`${ENKI_PUBLIC_KEY}:${ENKI_SECRET_KEY}`).toString('base64');

    const response = await fetch(`${ENKI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        payment_method: 'PIX'
      }),
    });

    const data = await response.json();
    console.log('[ENKI] Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('[ENKI] Error:', data);
      return NextResponse.json({ error: data.message || 'Error creating transaction' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
