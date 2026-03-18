import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const ticker = params.ticker;

    const response = await fetch(`${backendUrl}/analyze/${ticker}`, {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Could not connect to backend." },
      { status: 500 }
    );
  }
}