import { NextRequest, NextResponse } from 'next/server';

// ─── Razorpay payment order creation ──────────────────────────────────────
// This API route is called by the billing page when the customer clicks "Pay Now".
// It creates a Razorpay order server-side (keeping the secret key off the browser).
//
// To activate real payments:
//   1. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local
//   2. Uncomment the Razorpay block below
//
// Without env vars → returns a simulated success response for development.

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // ── Real Razorpay (activate by adding keys to .env.local) ──────────────
    if (keyId && keySecret) {
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Razorpay uses paise
          currency,
          receipt: receipt ?? `rcpt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        return NextResponse.json({ error: err }, { status: 400 });
      }

      const order = await response.json();
      return NextResponse.json(order);
    }

    // ── Simulated payment (no Razorpay keys configured) ────────────────────
    return NextResponse.json({
      id: `sim_order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'created',
      simulated: true,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Payment order creation failed' }, { status: 500 });
  }
}
