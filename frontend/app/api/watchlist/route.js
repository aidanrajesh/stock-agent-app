import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const response = await fetch(`${backendUrl}/watchlist`, {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Could not load watchlist." },
      { status: 500 }
    );
  }
}