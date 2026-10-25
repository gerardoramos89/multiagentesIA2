import { log } from "./system-log";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface SprintTask {
  id: string;
  title: string;
  description: string;
  agent: "po" | "arch" | "dev" | "qa" | "doc";
  status: "pending" | "working" | "done" | "blocked";
  startedAt?: string;
  completedAt?: string;
  output?: string;
  commits?: string[];
  filesModified?: string[];
}

export interface SprintRetrospective {
  whatWasAchieved: string[];
  whatWentWell: string[];
  whatWentWrong: string[];
  whatNeedsDefinition: string[];
  actionItems: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: "multiple" | "open";
  options?: string[];
  answer?: string;
  trelloCardId?: string;
}

export interface SprintState {
  sprintNumber: number;
  startedAt: string;
  completedAt?: string;
  approvedBy: "human";
  tasks: SprintTask[];
  status: "planned" | "executing" | "review" | "retrospective" | "survey" | "completed";
  retrospective?: SprintRetrospective;
  vision?: any;
  projectContext?: string;
  surveys?: SurveyQuestion[];
  lessonsLearned?: string[];
  filesChanged?: string[];
}

export interface SprintHistoryEntry {
  sprintNumber: number;
  startedAt: string;
  completedAt: string;
  tasks: SprintTask[];
  retrospective?: SprintRetrospective;
  vision?: any;
  lessonsLearned?: string[];
  filesChanged?: string[];
}

export interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
}

export interface AgentWorkLog {
  agent: string;
  taskId: string;
  taskTitle: string;
  prompt: string;
  response: string;
  status: "working" | "done" | "error";
  startedAt: string;
  completedAt?: string;
  fileName?: string;
  duration?: number;
}

export interface ChangeMemory {
  totalCommits: number;
  lastCommitHash?: string;
  filesEverChanged: string[];
  sprintsCompleted: number;
}

const SPRINT_FILE = path.join(process.cwd(), "config", "sprint-active.json");
const SPRINT_HISTORY_FILE = path.join(process.cwd(), "config", "sprints-history.json");
const AGENT_LOGS_FILE = path.join(process.cwd(), "config", "agent-logs.json");
const AGENT_WORK_LOGS_FILE = path.join(process.cwd(), "config", "agent-work-logs.json");
const CHANGE_MEMORY_FILE = path.join(process.cwd(), "config", "change-memory.json");
const REPO_DIR = process.cwd();

export function loadChangeMemory(): ChangeMemory {
  try {
    if (!fs.existsSync(CHANGE_MEMORY_FILE)) return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 };
    return JSON.parse(fs.readFileSync(CHANGE_MEMORY_FILE, "utf-8"));
  } catch { return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 }; }
}

export function saveChangeMemory(memory: ChangeMemory) {
  try {
    const dir = path.dirname(CHANGE_MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHANGE_MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando memoria:", e); }
}

export function addAgentLog(agent: string, message: string, level: AgentLog["level"] = "info") {
  try {
    let logs: AgentLog[] = [];
    if (fs.existsSync(AGENT_LOGS_FILE)) logs = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    logs.push({ agent, message, timestamp: new Date().toISOString(), level });
    if (logs.length > 50) logs = logs.slice(-50);
    fs.writeFileSync(AGENT_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando log:", e); }
}

export function getAgentLogs(): Record<string, AgentLog[]> {
  try {
    if (!fs.existsSync(AGENT_LOGS_FILE)) return {};
    const logs: AgentLog[] = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    const grouped: Record<string, AgentLog[]> = {};
    for (const agent of ["po", "arch", "dev", "qa", "doc"]) {
      grouped[agent] = logs.filter(l => l.agent === agent).slice(-5);
    }
    return grouped;
  } catch { return {}; }
}

export function saveAgentWorkLog(workLog: AgentWorkLog) {
  try {
    let logs: AgentWorkLog[] = [];
    if (fs.existsSync(AGENT_WORK_LOGS_FILE)) logs = JSON.parse(fs.readFileSync(AGENT_WORK_LOGS_FILE, "utf-8"));
    const existingIndex = logs.findIndex(l => l.taskId === workLog.taskId);
    if (existingIndex >= 0) logs[existingIndex] = workLog;
    else logs.push(workLog);
    if (logs.length > 30) logs = logs.slice(-30);
    fs.writeFileSync(AGENT_WORK_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando work log:", e); }
}

export function getAgentWorkLogs(): AgentWorkLog[] {
  try {
    if (!fs.existsSync(AGENT_WORK_LOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(AGENT_WORK_LOGS_FILE, "utf-8"));
  } catch { return []; }
}

export function loadSprint(): SprintState | null {
  try {
    if (!fs.existsSync(SPRINT_FILE)) return null;
    return JSON.parse(fs.readFileSync(SPRINT_FILE, "utf-8"));
  } catch { return null; }
}

export function saveSprint(sprint: SprintState) {
  try {
    const dir = path.dirname(SPRINT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPRINT_FILE, JSON.stringify(sprint, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando sprint:", e); }
}

export function loadSprintHistory(): SprintHistoryEntry[] {
  try {
    if (!fs.existsSync(SPRINT_HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(SPRINT_HISTORY_FILE, "utf-8"));
  } catch { return []; }
}

export function saveSprintHistory(history: SprintHistoryEntry[]) {
  try {
    const dir = path.dirname(SPRINT_HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPRINT_HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando historial:", e); }
}

export function getCurrentAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };
  const result: Record<string, SprintTask | null> = { po: null, arch: null, dev: null, qa: null, doc: null };
  for (const task of sprint.tasks) {
    if (task.status === "working") result[task.agent] = task;
  }
  return result;
}

export function getNextAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };
  const result: Record<string, SprintTask | null> = { po: null, arch: null, dev: null, qa: null, doc: null };
  for (const task of sprint.tasks) {
    if (task.status === "pending" && !result[task.agent]) result[task.agent] = task;
  }
  return result;
}

export function getNextSprintNumber(): number {
  const history = loadSprintHistory();
  const currentSprint = loadSprint();
  if (currentSprint && currentSprint.status !== "completed") return currentSprint.sprintNumber;
  if (history.length === 0) return 1;
  return Math.max(...history.map(h => h.sprintNumber)) + 1;
}

export function getLessonsLearned(): string[] {
  const history = loadSprintHistory();
  if (history.length === 0) return [];
  return history[history.length - 1].lessonsLearned || [];
}

async function prepareRepository(): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync(`git config user.email "agent@fabricagents.ai"`, { cwd: REPO_DIR });
    await execAsync(`git config user.name "Fabric Agent"`, { cwd: REPO_DIR });
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (statusOutput.trim()) {
      await execAsync(`git add .`, { cwd: REPO_DIR });
      await execAsync(`git commit -m "🎯 Estado inicial antes del Sprint\n\nAuto-committed by FabricAgents"`, { cwd: REPO_DIR });
      const memory = loadChangeMemory();
      memory.totalCommits++;
      const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
      memory.lastCommitHash = hashOutput.trim();
      saveChangeMemory(memory);
    }
    return { success: true, message: "Repositorio preparado" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function gatherAgentContext(taskAgent: string): Promise<string> {
  let context = "";
  if (taskAgent === "dev" || taskAgent === "qa") {
    try {
      const archPath = path.join(REPO_DIR, "ARCHITECTURE.md");
      if (fs.existsSync(archPath)) {
        context += `\n🏗️ CONTEXTO DEL ARQUITECTO (OBLIGATORIO SEGUIR):\n${fs.readFileSync(archPath, "utf-8").substring(0, 2000)}\n`;
      }
    } catch {}
  }
  if (taskAgent === "dev") {
    try {
      const stratPath = path.join(REPO_DIR, "STRATEGY.md");
      if (fs.existsSync(stratPath)) {
        context += `\n📋 CONTEXTO DEL PRODUCT OWNER (ESTRATEGIA):\n${fs.readFileSync(stratPath, "utf-8").substring(0, 1500)}\n`;
      }
    } catch {}
  }
  if (taskAgent === "doc") {
    try {
      const archPath = path.join(REPO_DIR, "ARCHITECTURE.md");
      if (fs.existsSync(archPath)) {
        context += `\n🏗️ ARQUITECTURA PARA DOCUMENTAR:\n${fs.readFileSync(archPath, "utf-8").substring(0, 1000)}\n`;
      }
    } catch {}
  }
  return context || "No hay contexto previo de otros agentes. Usa las mejores prácticas estándar.";
}

async function executeAgentTask(task: SprintTask): Promise<{ success: boolean; output: string; filesModified?: string[] }> {
  try {
    addAgentLog(task.agent, `Iniciando: ${task.title}`, "info");
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    
    const rolePrompts: Record<string, string> = {
      po: `Eres un Product Owner y Estratega de Producto de élite. No generes código. Genera documentos estratégicos (STRATEGY.md). Enfócate en: objetivos de negocio medibles, criterios de aceptación claros (Given-When-Then), análisis de riesgos y roadmap.`,
      arch: `Eres un Arquitecto de Software Principal (Staff Engineer). Tu trabajo es DISEÑAR. Genera ARCHITECTURE.md. Enfócate en: patrones de diseño específicos, estructura de carpetas exacta, decisiones técnicas (ADR), escalabilidad, seguridad y cómo reducir la deuda técnica. Sé muy específico con las tecnologías.`,
      dev: `Eres un Developer Senior (10x Engineer) experto en Clean Code. Tu trabajo es IMPLEMENTAR. 
REGLAS OBLIGATORIAS:
1. Usa principios SOLID y patrones de diseño mencionados por el Arquitecto.
2. Maneja TODOS los errores posibles (try/catch, validaciones de input).
3. El código debe ser modular, testeable y estar profusamente comentado.
4. Si el contexto del Arquitecto menciona tecnologías específicas, ÚSALAS estrictamente.
5. Responde SOLO con el contenido del archivo. Primera línea: 'ARCHIVO: ruta/nombre.ext'`,
      qa: `Eres un QA Lead Engineer. Tu trabajo es VALIDAR y ROMPER. Genera QA_REPORT.md y archivos de test. Enfócate en: encontrar edge cases, validar que el código cumple con la arquitectura del Arquitecto, y crear tests unitarios funcionales que cubran los criterios del PO.`,
      doc: `Eres un Technical Writer Senior. Tu trabajo es DOCUMENTAR. Genera un README.md que sea la FUENTE DE VERDAD. Enfócate en: descripción clara, guía de instalación paso a paso, ejemplos de uso, y cómo la arquitectura diseñada resuelve el problema.`
    };

    const rolePrompt = rolePrompts[task.agent] || rolePrompts.dev;
    const crossAgentContext = await gatherAgentContext(task.agent);

    const prompt = `${rolePrompt}

📂 CONTEXTO GLOBAL DEL PROYECTO:
- Nombre: ${task.title.includes('MultiagentesIA') ? 'MultiagentesIA' : 'Proyecto de Fábrica de Agentes'}
- Objetivo General: Desarrollar un sistema autónomo de gestión de sprints con IA.
- Stack/Tecnologías: Next.js, React, Tailwind, Node.js, Ollama, Trello API, GitHub API.

📋 TU TAREA ESPECÍFICA:
- Título: ${task.title}
- Descripción Detallada: ${task.description}

🧠 CONTEXTO DE OTROS AGENTES (Úsalo como guía absoluta para tu trabajo):
${crossAgentContext}

INSTRUCCIÓN FINAL: Genera el código o documento completo, funcional y listo para producción. No pongas explicaciones conversacionales, solo el contenido del archivo. 
Primera línea OBLIGATORIA: 'ARCHIVO: nombre_del_archivo.ext'`;

    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    saveAgentWorkLog({ 
      agent: task.agent, taskId: task.id, taskTitle: task.title, 
      prompt: prompt.substring(0, 800) + "...", response: "", status: "working", startedAt 
    });

    addAgentLog(task.agent, `Generando con ${model} (con contexto cruzado)...`, "info");
    
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2, num_predict: 3000 } })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    const generatedText = data.response;
    
    const lines = generatedText.split('\n');
    let fileName = `agent_generated_${task.agent}_${Date.now()}.md`;
    let content = generatedText;
    
    const fileMatch = lines[0].match(/ARCHIVO:\s*(.+)/i) || lines[0].match(/FILE:\s*(.+)/i);
    if (fileMatch) {
      fileName = fileMatch[1].trim().replace(/[^a-zA-Z0-9._-]/g, '_');
      content = lines.slice(1).join('\n').trim();
    } else {
      const codeBlockMatch = generatedText.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) content = codeBlockMatch[1].trim();
    }
    
    const filePath = path.join(REPO_DIR, fileName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    
    const completedAt = new Date().toISOString();
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    saveAgentWorkLog({ 
      agent: task.agent, taskId: task.id, taskTitle: task.title, 
      prompt: prompt.substring(0, 800) + "...", 
      response: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""), 
      status: "done", startedAt, completedAt, fileName, duration 
    });
    
    addAgentLog(task.agent, `✅ Archivo creado: ${fileName} en ${duration}s`, "success");
    return { success: true, output: `Generado: ${fileName}`, filesModified: [fileName] };
  } catch (error: any) {
    const completedAt = new Date().toISOString();
    saveAgentWorkLog({ 
      agent: task.agent, taskId: task.id, taskTitle: task.title, prompt: "", 
      response: `Error: ${error.message}`, status: "error", 
      startedAt: new Date().toISOString(), completedAt 
    });
    addAgentLog(task.agent, `❌ Error: ${error.message}`, "error");
    return { success: false, output: error.message };
  }
}

async function commitAndPush(task: SprintTask): Promise<{ success: boolean; commitHash?: string }> {
  try {
    addAgentLog(task.agent, `Preparando commit...`, "info");
    const githubOwner = process.env.GITHUB_OWNER || "gerardoramos89";
    const githubRepo = process.env.GITHUB_REPO || "multiagentesIA";
    const { stdout: branchOutput } = await execAsync(`git branch --show-current`, { cwd: REPO_DIR });
    const currentBranch = branchOutput.trim() || "master";

    await execAsync(`git add .`, { cwd: REPO_DIR });
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (!statusOutput.trim()) {
      addAgentLog(task.agent, `⚠️ No hay cambios nuevos`, "warn");
      return { success: true };
    }

    const commitMessage = `✨ [Sprint ${task.id.split('-')[0]?.replace('task-', '') || '1'}] [${task.agent.toUpperCase()}] ${task.title.replace(/\[.*?\]\s*/, '')}\n\nTarea: ${task.id}`;
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: REPO_DIR });
    
    const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
    const commitHash = hashOutput.trim();
    
    const memory = loadChangeMemory();
    memory.totalCommits++;
    memory.lastCommitHash = commitHash;
    if (task.filesModified) {
      task.filesModified.forEach(f => { if (!memory.filesEverChanged.includes(f)) memory.filesEverChanged.push(f); });
    }
    saveChangeMemory(memory);
    
    const sshUrl = `git@github.com:${githubOwner}/${githubRepo}.git`;
    const sshKeyPath = `C:/Users/GERARD/.ssh/id_ed25519`;
    await execAsync(`git remote remove origin`, { cwd: REPO_DIR }).catch(() => {});
    await execAsync(`git remote add origin ${sshUrl}`, { cwd: REPO_DIR });
    const sshCommand = `ssh -i ${sshKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
    await execAsync(`git config core.sshCommand "${sshCommand}"`, { cwd: REPO_DIR });
    await execAsync(`git push origin ${currentBranch}`, { cwd: REPO_DIR });
    
    addAgentLog(task.agent, `✅ Push exitoso: ${commitHash.substring(0, 7)}`, "success");
    return { success: true, commitHash };
  } catch (error: any) {
    addAgentLog(task.agent, `❌ Error en push: ${error.message}`, "error");
    return { success: false };
  }
}

let isExecuting = false;
export async function startSprintExecution(vision?: any, projectContext?: string): Promise<{ success: boolean; message: string }> {
  if (isExecuting) return { success: false, message: "El sprint ya se está iniciando..." };
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint planificado" };
  if (sprint.status === "executing") return { success: false, message: "El sprint ya está en ejecución" };

  isExecuting = true;
  try {
    const prepResult = await prepareRepository();
    if (!prepResult.success) { isExecuting = false; return { success: false, message: prepResult.message }; }

    log("INFO", "executor", `Resetando ${sprint.tasks.length} tareas a "pending"...`);
    for (const task of sprint.tasks) {
      task.status = "pending"; task.startedAt = undefined; task.completedAt = undefined;
      task.output = undefined; task.commits = undefined; task.filesModified = undefined;
    }
    sprint.status = "executing"; sprint.vision = vision; sprint.projectContext = projectContext; sprint.filesChanged = [];
    saveSprint(sprint);

    log("SPRINT", "system", `🚀 Sprint #${sprint.sprintNumber} iniciado. ${sprint.tasks.length} tareas en cola.`);
    sprint.tasks.forEach((task, i) => {
      const agentIcon = task.agent === "po" ? "📋" : task.agent === "arch" ? "🏗️" : task.agent === "dev" ? "🛠️" : task.agent === "qa" ? "🧪" : "📝";
      log("SPRINT", "system", `  ${i + 1}. ${agentIcon} [${task.agent.toUpperCase()}] ${task.title}`);
    });
    executeTasksSequentially(sprint, vision, projectContext).catch((e) => log("ERROR", "executor", `Error: ${e?.message}`));
    return { success: true, message: "Sprint iniciado" };
  } finally {
    setTimeout(() => { isExecuting = false; }, 5000);
  }
}

async function executeTasksSequentially(sprint: SprintState, vision?: any, projectContext?: string) {
  const pendingTasks = sprint.tasks.filter((t) => t.status === "pending");
  log("INFO", "executor", `Tareas pendientes: ${pendingTasks.length}`);
  
  if (pendingTasks.length === 0) {
    await transitionToRetrospective(sprint);
    return;
  }

  for (const task of pendingTasks) {
    task.status = "working"; task.startedAt = new Date().toISOString(); saveSprint(sprint);
    const agentName = task.agent === "po" ? "Product Owner" : task.agent === "arch" ? "Arquitecto" : task.agent === "dev" ? "Developer" : task.agent === "qa" ? "QA Engineer" : "Technical Writer";
    log("AGENT", task.agent, `${agentName} empezó: ${task.title}`);
    addAgentLog(task.agent, `🎯 Trabajando en: ${task.title}`, "info");

    const startTime = Date.now();
    let enhancedTask = { ...task };
    if (task.agent === "doc" && vision && vision.isCompleted) {
      const memory = loadChangeMemory();
      enhancedTask.description = `CONTEXTO DEL PROYECTO:\n- Nombre: ${vision.name}\n- Objetivo: ${vision.generalObjective}\n- Skills: ${vision.targetSkills}\n- Commits totales: ${memory.totalCommits}\n\nTAREA: ${task.description}\n\nINSTRUCCIÓN: Actualiza el README.md para que sea la GUÍA VIVA del proyecto.`;
      addAgentLog("doc", "📝 Inyectando contexto para README vivo...", "info");
    }

    const result = await executeAgentTask(enhancedTask);
    if (!result.success) {
      task.status = "blocked"; task.output = `Error: ${result.output}`; saveSprint(sprint);
      addAgentLog(task.agent, `⚠️ Tarea bloqueada`, "error");
      continue;
    }

    const commitResult = await commitAndPush(task);
    if (commitResult.success && commitResult.commitHash) task.commits = [commitResult.commitHash];
    if (result.filesModified) {
      task.filesModified = result.filesModified;
      if (!sprint.filesChanged) sprint.filesChanged = [];
      result.filesModified.forEach(f => { if (!sprint.filesChanged!.includes(f)) sprint.filesChanged!.push(f); });
    }

    task.status = "done"; task.completedAt = new Date().toISOString(); task.output = result.output; saveSprint(sprint);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("AGENT", task.agent, `${agentName} completó: ${task.title} en ${duration}s`);
    addAgentLog(task.agent, `✅ Completado en ${duration}s`, "success");
    await new Promise((r) => setTimeout(r, 2000));
  }

  await transitionToRetrospective(sprint);
}

async function transitionToRetrospective(sprint: SprintState) {
  log("SPRINT", "system", `📋 Sprint #${sprint.sprintNumber} completado. Generando retrospectiva...`);
  addAgentLog("po", "📊 Todas las tareas completadas. Generando retrospectiva...", "info");
  sprint.status = "retrospective"; saveSprint(sprint);
  
  const retrospectiveResult = await generateRetrospective();
  if (retrospectiveResult.success && retrospectiveResult.retrospective) {
    sprint.retrospective = retrospectiveResult.retrospective;
    // ✅ CAMBIO CRÍTICO: Pasar a "review" (esperando humano) en vez de "survey" (Trello)
    sprint.status = "review";
    saveSprint(sprint);
    log("SPRINT", "system", `✅ Retrospectiva generada. Esperando revisión humana en dashboard.`);
    addAgentLog("po", `✅ Retrospectiva lista. Esperando feedback humano.`, "success");
    
    // ✅ NUEVO: Notificar por Telegram si está configurado
    try {
      const { notifySprintReadyForReview } = await import("./telegram-bot");
      await notifySprintReadyForReview(sprint.sprintNumber, retrospectiveResult.retrospective);
    } catch (e) {
      // Telegram opcional, no falla si no está configurado
    }
  } else {
    log("SPRINT", "system", `⚠️ Error generando retrospectiva.`);
    sprint.status = "review"; saveSprint(sprint);
  }
}

// ✅ RETROSPECTIVA DE NIVEL TECH LEAD (Sin frases genéricas)
export async function generateRetrospective(): Promise<{ success: boolean; retrospective?: SprintRetrospective }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false };
  try {
    addAgentLog("po", "📊 Generando retrospectiva técnica...", "info");
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const completedTasks = sprint.tasks.filter(t => t.status === "done");
    const blockedTasks = sprint.tasks.filter(t => t.status === "blocked");
    
    const prompt = `Eres un Tech Lead y Product Owner de élite. Acabas de completar el Sprint #${sprint.sprintNumber}.
Tareas completadas: ${completedTasks.map(t => `- ${t.title} (${t.agent})`).join('\n') || 'Ninguna'}
Tareas bloqueadas: ${blockedTasks.map(t => `- ${t.title}: ${t.output}`).join('\n') || 'Ninguna'}

Genera una retrospectiva técnica y REALISTA en formato JSON. 
REGLA CRÍTICA ABSOLUTA: PROHIBIDO usar frases genéricas de gestión como "mejorar comunicación", "estimaciones de tiempo", "claridad en roles". Debes ser EXTREMADAMENTE específico y técnico, basado en el código y la arquitectura. 
Ejemplos CORRECTOS: 
- "[DEV] Refactorizar el módulo de autenticación para aplicar patrón Repository"
- "[QA] Añadir tests de integración para el endpoint de usuarios"
- "[DOC] Actualizar el diagrama de arquitectura en README.md"

Estructura JSON EXACTA:
{
  "whatWasAchieved": ["logro técnico concreto 1", "logro técnico concreto 2"],
  "whatWentWell": ["punto técnico positivo 1", "punto técnico positivo 2"],
  "whatWentWrong": ["problema de código o arquitectura 1", "problema de código o arquitectura 2"],
  "whatNeedsDefinition": ["[ARCH/DEV] Especificación técnica concreta que falta", "[DEV/QA] Caso de uso no cubierto por tests"],
  "actionItems": ["[DEV] Tarea técnica accionable 1", "[QA] Tarea de calidad accionable 2", "[DOC] Tarea de documentación accionable 3"]
}
Responde SOLO con el JSON válido, sin texto adicional.`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.3, num_predict: 1500 } })
    });
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer JSON");
    const retrospective = JSON.parse(jsonMatch[0]);
    
    const result: SprintRetrospective = {
      whatWasAchieved: retrospective.whatWasAchieved || ["Tareas técnicas completadas según lo planificado"],
      whatWentWell: retrospective.whatWentWell || ["Ejecución fluida del pipeline"],
      whatWentWrong: retrospective.whatWentWrong || ["Se requiere mayor definición técnica en algunos módulos"],
      whatNeedsDefinition: retrospective.whatNeedsDefinition || ["Próximos pasos de la arquitectura"],
      actionItems: retrospective.actionItems || ["Revisar código generado y añadir tests"],
      generatedAt: new Date().toISOString(),
      generatedBy: "Tech Lead Agent"
    };
    addAgentLog("po", "✅ Retrospectiva técnica generada", "success");
    return { success: true, retrospective: result };
  } catch (error: any) {
    addAgentLog("po", `❌ Error: ${error.message}`, "error");
    return { success: false };
  }
}


export async function closeSprint(humanFeedback?: any): Promise<{ success: boolean; message: string }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint activo" };
  if (sprint.status === "completed") return { success: false, message: "El sprint ya está cerrado" };

  addAgentLog("po", "🔒 Cerrando sprint y actualizando memoria autónoma...", "info");
  
  // ✅ NUEVO: Usar feedback humano en lugar de surveys de Trello
  const lessonsLearned: string[] = [];
  if (humanFeedback) {
    if (humanFeedback.achievements) lessonsLearned.push(`Logros: ${humanFeedback.achievements}`);
    if (humanFeedback.improvements) lessonsLearned.push(`Mejoras: ${humanFeedback.improvements}`);
    if (humanFeedback.customAnswers) {
      Object.entries(humanFeedback.customAnswers).forEach(([key, value]) => {
        if (value) lessonsLearned.push(`${key}: ${value}`);
      });
    }
  }
  
  sprint.lessonsLearned = lessonsLearned;
  sprint.completedAt = new Date().toISOString();
  sprint.status = "completed";
  saveSprint(sprint);
  
  // ✅ Guardar feedback humano en memoria
  try {
    const { saveHumanFeedback } = await import("./memory-manager");
    if (humanFeedback) {
      saveHumanFeedback(sprint.sprintNumber, "end", humanFeedback);
    }
  } catch (e) {}
  
  // ✅ Guardar en memoria con auto-aprendizaje y logs
  try {
    const { saveSprintToMemory, commitMemoryToGit, getAgentLogs } = await import("./memory-manager");
    
    const allAgentLogs = getAgentLogs();
    const logsArray = Object.entries(allAgentLogs).flatMap(([agent, logs]) => 
      (logs as any[]).map(log => ({ ...log, agent }))
    );
    
    saveSprintToMemory({
      sprintNumber: sprint.sprintNumber,
      startedAt: sprint.startedAt,
      completedAt: sprint.completedAt,
      tasks: sprint.tasks,
      retrospective: sprint.retrospective,
      vision: sprint.vision,
      lessonsLearned,
      filesChanged: sprint.filesChanged,
      humanFeedback
    }, logsArray);
    
    await commitMemoryToGit(sprint.sprintNumber);
    
    addAgentLog("po", "✅ Memoria autónoma actualizada con logs y commiteada", "success");
  } catch (error: any) {
    addAgentLog("po", `⚠️ Error guardando en memoria: ${error.message}`, "warn");
  }
  
  const memory = loadChangeMemory();
  memory.sprintsCompleted++;
  if (sprint.filesChanged) {
    sprint.filesChanged.forEach(f => { if (!memory.filesEverChanged.includes(f)) memory.filesEverChanged.push(f); });
  }
  saveChangeMemory(memory);
  
  const history = loadSprintHistory();
  history.push({ 
    sprintNumber: sprint.sprintNumber, 
    startedAt: sprint.startedAt, 
    completedAt: sprint.completedAt, 
    tasks: sprint.tasks, 
    retrospective: sprint.retrospective, 
    vision: sprint.vision, 
    lessonsLearned, 
    filesChanged: sprint.filesChanged,
    humanFeedback
  });
  saveSprintHistory(history);
  
  try { if (fs.existsSync(SPRINT_FILE)) fs.unlinkSync(SPRINT_FILE); } catch (e) {}
  
  addAgentLog("po", "✅ Sprint archivado y equipo evolucionó", "success");
  log("SPRINT", "system", `✅ Sprint #${sprint.sprintNumber} cerrado. Memoria autónoma actualizada.`);
  
  // ✅ Notificar por Telegram
  try {
    const { notifySprintClosed } = await import("./telegram-bot");
    await notifySprintClosed(sprint.sprintNumber, lessonsLearned);
  } catch (e) {}
  
  return { success: true, message: "Sprint cerrado exitosamente" };
}