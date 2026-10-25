import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function POST() {
  try {
    const configDir = path.join(process.cwd(), "config");
    const filesToDelete = [
      "change-memory.json",
      "project-brief.json",
      "sprints-history.json",
      "agent-logs.json",
      "agent-work-logs.json",
      "sprint-active.json",
      "project-analysis-error.json"
    ];
    
    const deleted: string[] = [];
    const skipped: string[] = [];
    
    for (const file of filesToDelete) {
      const filePath = path.join(configDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted.push(file);
      } else {
        skipped.push(file);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Caché limpiada. ${deleted.length} archivos eliminados.`,
      deleted,
      skipped
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}