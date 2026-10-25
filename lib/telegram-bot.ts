import { log } from "./system-log";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: any;
}

// ✅ VERIFICAR SI TELEGRAM ESTÁ CONFIGURADO
export function isTelegramConfigured(): boolean {
  return !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

// ✅ ENVIAR MENSAJE A TELEGRAM
async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!isTelegramConfigured()) {
    log("INFO", "telegram", "Telegram no configurado, omitiendo notificación");
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      log("ERROR", "telegram", `Error enviando mensaje: ${response.status}`);
      return false;
    }
    
    log("INFO", "telegram", "✅ Mensaje enviado a Telegram");
    return true;
  } catch (error: any) {
    log("ERROR", "telegram", `Error: ${error.message}`);
    return false;
  }
}

// ✅ NOTIFICAR SPRINT LISTO PARA REVISIÓN HUMANA
export async function notifySprintReadyForReview(sprintNumber: number, retrospective: any): Promise<boolean> {
  const text = `
🚀 <b>Sprint #${sprintNumber} Completado</b>

📊 <b>Retrospectiva Generada:</b>

✅ <b>Logros:</b>
${retrospective.whatWasAchieved?.map((l: string) => `• ${l}`).join("\n") || "N/A"}

⚠️ <b>Problemas:</b>
${retrospective.whatWentWrong?.map((l: string) => `• ${l}`).join("\n") || "N/A"}

🎯 <b>Mejoras pendientes:</b>
${retrospective.actionItems?.map((l: string) => `• ${l}`).join("\n") || "N/A"}

💬 <b>Acción requerida:</b>
Ingresa al dashboard para revisar y cerrar el sprint.
O responde con /cerrar_sprint para cerrar desde aquí.
  `.trim();
  
  return await sendTelegramMessage({
    chat_id: TELEGRAM_CHAT_ID!,
    text,
    parse_mode: "HTML"
  });
}

// ✅ NOTIFICAR SPRINT CERRADO
export async function notifySprintClosed(sprintNumber: number, lessonsLearned: string[]): Promise<boolean> {
  const text = `
✅ <b>Sprint #${sprintNumber} Cerrado</b>

🎓 <b>Lecciones Aprendidas:</b>
${lessonsLearned.slice(0, 5).map((l: string) => `• ${l}`).join("\n") || "N/A"}

🧠 Memoria actualizada y commiteada a Git.

💡 Usa /nuevo_sprint para planificar el siguiente.
  `.trim();
  
  return await sendTelegramMessage({
    chat_id: TELEGRAM_CHAT_ID!,
    text,
    parse_mode: "HTML"
  });
}

// ✅ NOTIFICAR INICIO DE SPRINT
export async function notifySprintStarted(sprintNumber: number, tasksCount: number): Promise<boolean> {
  const text = `
🎬 <b>Sprint #${sprintNumber} Iniciado</b>

📋 Tareas planificadas: ${tasksCount}
🤖 Agentes trabajando...

💡 Usa /estado para ver el progreso en tiempo real.
  `.trim();
  
  return await sendTelegramMessage({
    chat_id: TELEGRAM_CHAT_ID!,
    text,
    parse_mode: "HTML"
  });
}

// ✅ PROCESAR COMANDOS DE TELEGRAM
export async function processTelegramCommand(command: string, args: string[]): Promise<string> {
  const { loadSprint, getNextSprintNumber } = await import("./agent-executor");
  const { readMemoryIndex, listHistoricalSprints } = await import("./memory-manager");
  
  switch (command) {
    case "/estado":
    case "/status": {
      const sprint = loadSprint();
      if (!sprint) return "🔵 No hay sprint activo. Usa /nuevo_sprint para comenzar.";
      
      const done = sprint.tasks.filter(t => t.status === "done").length;
      const working = sprint.tasks.filter(t => t.status === "working").length;
      const pending = sprint.tasks.filter(t => t.status === "pending").length;
      
      return `
📊 <b>Estado del Sprint #${sprint.sprintNumber}</b>
Estado: ${sprint.status}
✅ Completadas: ${done}
⚙️ En progreso: ${working}
⏳ Pendientes: ${pending}
      `.trim();
    }
    
    case "/memoria":
    case "/memory": {
      const index = readMemoryIndex();
      if (!index) return "❌ No hay memoria inicializada.";
      
      return `
🧠 <b>Memoria del Proyecto</b>
📦 Proyecto: ${index.projectName}
🔢 Sprints completados: ${index.totalSprints}
📅 Último sprint: ${index.lastSprintAt || "Nunca"}
🎓 Lecciones aprendidas: ${index.lessonsLearned?.length || 0}
      `.trim();
    }
    
    case "/historial":
    case "/history": {
      const sprints = listHistoricalSprints();
      if (sprints.length === 0) return "📭 No hay sprints en el historial.";
      
      const last5 = sprints.slice(-5).reverse();
      return `
📜 <b>Últimos 5 Sprints:</b>
${last5.map(s => `• Sprint #${s.sprintNumber}: ${s.tasksCount} tareas, ${s.lessonsLearned} lecciones`).join("\n")}
      `.trim();
    }
    
    case "/logs": {
      const sprint = loadSprint();
      if (!sprint) return "🔵 No hay sprint activo.";
      
      const { getAgentLogs } = await import("./agent-executor");
      const logs = getAgentLogs();
      const recentLogs = Object.entries(logs)
        .flatMap(([agent, agentLogs]) => (agentLogs as any[]).slice(-2).map(l => `[${agent}] ${l.message}`))
        .slice(-10);
      
      return `
📋 <b>Últimos Logs:</b>
${recentLogs.join("\n") || "Sin actividad reciente."}
      `.trim();
    }
    
    default:
      return `
❓ Comando no reconocido.

<b>Comandos disponibles:</b>
• /estado - Ver estado del sprint actual
• /memoria - Ver resumen de la memoria
• /historial - Ver últimos 5 sprints
• /logs - Ver últimos logs de agentes
• /nuevo_sprint - Planificar nuevo sprint
• /cerrar_sprint - Cerrar sprint actual
      `.trim();
  }
}