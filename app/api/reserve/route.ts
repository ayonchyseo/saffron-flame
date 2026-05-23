import { NextResponse } from "next/server";

export const runtime = "edge";

interface ReservePayload {
  name?: string;
  email?: string;
  phone?: string;
  guests?: string;
  date?: string;
  time?: string;
  occasion?: string;
  notes?: string;
}

export async function POST(req: Request) {
  let body: ReservePayload = {};
  try {
    body = (await req.json()) as ReservePayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { name, email, phone, guests, date, time } = body;

  // Required-field gate
  const missing = ["name", "email", "phone", "guests", "date", "time"].filter(
    (k) => !body[k as keyof ReservePayload],
  );
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }

  if (!/.+@.+\..+/.test(email!)) {
    return NextResponse.json(
      { error: "That email address didn't look right." },
      { status: 400 },
    );
  }

  // In production: persist to DB / send email / POST to CRM here.
  // For now we return a synthetic confirmation code so the UI can complete its flow.
  const code = `SF-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json({
    ok: true,
    code,
    summary: {
      name,
      guests,
      date,
      time,
      phone,
    },
  });
}
