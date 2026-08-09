import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const phone = (phonesData as Phone[]).find((p) => p.id === id);

  if (!phone || !phone.affiliateLinks.amazon) {
    return new NextResponse('Affiliate Link Not Found', { status: 404 });
  }

  // Log the click
  try {
    const logPath = path.join(process.cwd(), 'src/data/clicks.json');
    let clicks = [];
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      try {
        clicks = JSON.parse(data);
      } catch (e) {
        clicks = [];
      }
    }
    clicks.push({
      phoneId: id,
      brand: phone.brand,
      model: phone.model,
      destination: 'amazon',
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(logPath, JSON.stringify(clicks, null, 2), 'utf8');
  } catch (err) {
    console.error('Error logging Amazon affiliate click', err);
  }

  // Redirect
  return NextResponse.redirect(phone.affiliateLinks.amazon);
}
