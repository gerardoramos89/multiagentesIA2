import { NextRequest, NextResponse } from "next/server";
import { saveHumanFeedback } from "@/lib/memory-manager";
import { loadSprint } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    const { phase, feedback } = await req.json();
    const sprint = loadSprint();
    
    if (!sprint) {
      return NextResponse.json({ success: false, message: "No hay sprint activo" }, { status: 400 });
    }
    
    const result = saveHumanFeedback(sprint.sprintNumber, phase, feedback);
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: `Feedback ${phase} guardado para Sprint #${sprint.sprintNumber}` 
      });
    } else {
      return NextResponse.json({ success: false, message: "Error guardando feedback" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sprintNumber = searchParams.get("sprint");
    const phase = searchParams.get("phase") as "start" | "end";
    
    if (!sprintNumber || !phase) {
      return NextResponse.json({ success: false, message: "Faltan parámetros" }, { status: 400 });
    }
    
    const { getHumanFeedback } = await import("@/lib/memory-manager");
    const feedback = getHumanFeedback(parseInt(sprintNumber), phase);
    
    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}