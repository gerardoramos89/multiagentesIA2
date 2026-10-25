import { NextRequest, NextResponse } from "next/server";
import { closeSprint } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { humanFeedback } = body;
    
    const result = await closeSprint(humanFeedback);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}