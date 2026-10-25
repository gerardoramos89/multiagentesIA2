import { NextRequest, NextResponse } from "next/server";
import { processTelegramCommand, isTelegramConfigured } from "@/lib/telegram-bot";

export async function POST(req: NextRequest) {
  try {
    if (!isTelegramConfigured()) {
      return NextResponse.json({ success: false, message: "Telegram no configurado" }, { status: 400 });
    }
    
    const body = await req.json();
    const message = body.message;
    
    if (!message || !message.text) {
      return NextResponse.json({ success: true });
    }
    
    const chatId = message.chat.id;
    const text = message.text.trim();
    
    // Solo responder a comandos
    if (!text.startsWith("/")) {
      return NextResponse.json({ success: true });
    }
    
    const [command, ...args] = text.split(" ");
    const response = await processTelegramCommand(command, args);
    
    // Enviar respuesta
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: response,
        parse_mode: "HTML"
      })
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en webhook de Telegram:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}