import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { log } from "./system-log";

const execAsync = promisify(exec);
const MEMORY_DIR = path.join(process.cwd(), "grtec-memory");
const INDEX_FILE = path.join(MEMORY_DIR, "index.json");
const SPRINTS_DIR = path.join(MEMORY_DIR, "sprints");
const AGENTS_DIR = path.join(MEMORY_DIR, "agents");
const PROJECT_DIR = path.join(MEMORY_DIR, "project");
const PROMPTS_DIR = path.join(PROJECT_DIR, "prompts");
const ASSETS_DIR = path.join(MEMORY_DIR, "assets");
const ARCH_DIR = path.join(MEMORY_DIR, "architecture");
const LEARNINGS_DIR = path.join(MEMORY_DIR, "learnings");
const LOGS_DIR = path.join(MEMORY_DIR, "logs");

export function initMemoryStructure() {
  try {
    [MEMORY_DIR, SPRINTS_DIR, AGENTS_DIR, PROJECT_DIR, PROMPTS_DIR, 
     ASSETS_DIR, ARCH_DIR, LEARNINGS_DIR, LOGS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    
    if (!fs.existsSync(INDEX_FILE)) {
      const initialIndex = {
        projectName: "Proyecto Sin Nombre",
        createdAt: new Date().toISOString(),
        totalSprints: 0,
        lastSprintAt: null,
        architecture: { stack: [], patterns: [], decisions: [] },
        assets: [],
        lessonsLearned: [],
        agentSkills: {},
        projectSkills: []
      };
      fs.writeFileSync(INDEX_FILE, JSON.stringify(initialIndex, null, 2), "utf-8");
    }
    
    const agents = ["po", "arch", "dev", "qa", "doc"];
    agents.forEach(agent => {
      const agentFile = path.join(AGENTS_DIR, `${agent}.json`);
      if (!fs.existsSync(agentFile)) {
        const agentProfile = {
          id: agent,
          name: getAgentName(agent),
          baseSkills: getDefaultSkills(agent),
          acquiredSkills: [],
          promptVersion: "v1",
          performanceHistory: [],
          specializations: []
        };
        fs.writeFileSync(agentFile, JSON.stringify(agentProfile, null, 2), "utf-8");
      }
    });
    
    const skillsFile = path.join(PROJECT_DIR, "skills.json");
    if (!fs.existsSync(skillsFile)) {
      fs.writeFileSync(skillsFile, JSON.stringify({
        detectedSkills: [],
        requiredSkills: [],
        emergingSkills: []
      }, null, 2), "utf-8");
    }
    
    const patternsFile = path.join(LEARNINGS_DIR, "patterns.md");
    if (!fs.existsSync(patternsFile)) {
      fs.writeFileSync(patternsFile, "# Patrones Exitosos Detectados\n\n_Aquí se registran automáticamente las soluciones que funcionaron bien._\n\n", "utf-8");
    }
    
    const antiPatternsFile = path.join(LEARNINGS_DIR, "anti-patterns.md");
    if (!fs.existsSync(antiPatternsFile)) {
      fs.writeFileSync(antiPatternsFile, "# Anti-Patrones (Errores a Evitar)\n\n_Aquí se registran automáticamente los errores cometidos para no repetirlos._\n\n", "utf-8");
    }
    
    log("INFO", "memory", "✅ Estructura de memoria autónoma inicializada");
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `❌ Error inicializando memoria: ${error.message}`);
    return false;
  }
}

function getAgentName(id: string): string {
  const names: Record<string, string> = {
    po: "Product Owner",
    arch: "Arquitecto",
    dev: "Developer",
    qa: "QA Engineer",
    doc: "Technical Writer"
  };
  return names[id] || id;
}

function getDefaultSkills(agent: string): string[] {
  const skills: Record<string, string[]> = {
    po: ["User Stories", "Priorización", "Criterios de Aceptación"],
    arch: ["Diseño de Sistemas", "Patrones de Diseño", "Escalabilidad"],
    dev: ["Clean Code", "TDD", "Git Flow", "Refactorización"],
    qa: ["Automatización de Tests", "Pruebas de Seguridad", "Revisión de Código"],
    doc: ["Documentación Técnica", "README", "API Docs"]
  };
  return skills[agent] || [];
}

export function readAgentProfile(agentId: string): any {
  try {
    const file = path.join(AGENTS_DIR, `${agentId}.json`);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

export function updateAgentProfile(agentId: string, updates: any) {
  try {
    const profile = readAgentProfile(agentId) || {};
    const updated = { ...profile, ...updates };
    fs.writeFileSync(path.join(AGENTS_DIR, `${agentId}.json`), JSON.stringify(updated, null, 2), "utf-8");
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error actualizando perfil de ${agentId}: ${error.message}`);
    return false;
  }
}

export function extractLearnedSkills(sprintData: any): Record<string, string[]> {
  const learnedSkills: Record<string, string[]> = {
    po: [], arch: [], dev: [], qa: [], doc: []
  };
  
  sprintData.tasks?.forEach((task: any) => {
    if (task.status !== "done") return;
    const text = `${task.title} ${task.description}`.toLowerCase();
    
    if (task.agent === "dev") {
      if (text.includes("api")) learnedSkills.dev.push("Desarrollo de APIs REST");
      if (text.includes("test")) learnedSkills.dev.push("Testing automatizado");
      if (text.includes("refactor")) learnedSkills.dev.push("Refactorización de código");
      if (text.includes("database") || text.includes("db")) learnedSkills.dev.push("Diseño de bases de datos");
      if (text.includes("auth")) learnedSkills.dev.push("Sistemas de autenticación");
      if (text.includes("frontend") || text.includes("ui")) learnedSkills.dev.push("Desarrollo de interfaces");
      if (text.includes("backend")) learnedSkills.dev.push("Desarrollo backend");
    }
    
    if (task.agent === "arch") {
      if (text.includes("microservicio")) learnedSkills.arch.push("Arquitectura de microservicios");
      if (text.includes("patrón")) learnedSkills.arch.push("Patrones de diseño avanzados");
      if (text.includes("escalab")) learnedSkills.arch.push("Diseño escalable");
      if (text.includes("seguridad")) learnedSkills.arch.push("Arquitectura segura");
    }
    
    if (task.agent === "qa") {
      if (text.includes("e2e") || text.includes("end-to-end")) learnedSkills.qa.push("Tests E2E");
      if (text.includes("performance")) learnedSkills.qa.push("Tests de performance");
      if (text.includes("unit")) learnedSkills.qa.push("Tests unitarios");
    }
    
    if (task.agent === "doc") {
      if (text.includes("openapi") || text.includes("swagger")) learnedSkills.doc.push("Documentación OpenAPI");
      if (text.includes("tutorial")) learnedSkills.doc.push("Creación de tutoriales");
      if (text.includes("readme")) learnedSkills.doc.push("Documentación de proyectos");
    }
    
    if (task.agent === "po") {
      if (text.includes("estrategia")) learnedSkills.po.push("Planificación estratégica");
      if (text.includes("retrospectiva")) learnedSkills.po.push("Análisis de retrospectivas");
    }
  });
  
  Object.keys(learnedSkills).forEach(agent => {
    learnedSkills[agent] = [...new Set(learnedSkills[agent])];
  });
  
  return learnedSkills;
}

export function registerLearning(type: "pattern" | "anti-pattern", content: string, sprintNumber: number) {
  try {
    const file = type === "pattern" 
      ? path.join(LEARNINGS_DIR, "patterns.md")
      : path.join(LEARNINGS_DIR, "anti-patterns.md");
    
    const entry = `\n## Sprint #${sprintNumber} - ${new Date().toLocaleDateString()}\n${content}\n`;
    fs.appendFileSync(file, entry, "utf-8");
    
    log("INFO", "memory", `✅ ${type} registrado: ${content.substring(0, 50)}...`);
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error registrando aprendizaje: ${error.message}`);
    return false;
  }
}

export function saveSprintLogsToMemory(sprintNumber: number, logs: any[]) {
  try {
    const logFile = path.join(LOGS_DIR, `sprint-${sprintNumber}-logs.json`);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), "utf-8");
    log("INFO", "memory", `✅ Logs del Sprint #${sprintNumber} guardados`);
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error guardando logs: ${error.message}`);
    return false;
  }
}

export function getAgentContext(agentId: string): string {
  try {
    const profile = readAgentProfile(agentId);
    const index = readMemoryIndex();
    
    let context = `🧠 CONTEXTO DEL AGENTE ${agentId.toUpperCase()}:\n`;
    context += `- Rol: ${profile?.name || agentId}\n`;
    context += `- Skills base: ${profile?.baseSkills?.join(", ") || "N/A"}\n`;
    
    if (profile?.acquiredSkills?.length > 0) {
      context += `- Skills adquiridos: ${profile.acquiredSkills.join(", ")}\n`;
    }
    
    if (profile?.specializations?.length > 0) {
      context += `- Especializaciones: ${profile.specializations.join(", ")}\n`;
    }
    
    context += `\n📚 CONTEXTO DEL PROYECTO:\n`;
    context += `- Nombre: ${index?.projectName || "N/A"}\n`;
    context += `- Total de sprints: ${index?.totalSprints || 0}\n`;
    
    if (index?.lessonsLearned?.length > 0) {
      context += `\n🎓 ÚLTIMAS LECCIONES APRENDIDAS:\n`;
      index.lessonsLearned.slice(-5).forEach((lesson: string, i: number) => {
        context += `${i + 1}. ${lesson}\n`;
      });
    }
    
    const antiPatternsFile = path.join(LEARNINGS_DIR, "anti-patterns.md");
    if (fs.existsSync(antiPatternsFile)) {
      const antiPatterns = fs.readFileSync(antiPatternsFile, "utf-8");
      if (antiPatterns.length > 100) {
        context += `\n⚠️ ERRORES A EVITAR (Anti-Patrones):\n`;
        context += antiPatterns.split("\n##").slice(-3).join("\n##").substring(0, 500) + "\n";
      }
    }
    
    return context;
  } catch {
    return `Agente ${agentId} sin contexto histórico disponible.`;
  }
}

export function saveSprintToMemory(sprintData: any, agentLogs?: any[]) {
  try {
    const sprintFile = path.join(SPRINTS_DIR, `sprint-${sprintData.sprintNumber}.json`);
    fs.writeFileSync(sprintFile, JSON.stringify(sprintData, null, 2), "utf-8");
    
    if (agentLogs && agentLogs.length > 0) {
      saveSprintLogsToMemory(sprintData.sprintNumber, agentLogs);
    }
    
    const learnedSkills = extractLearnedSkills(sprintData);
    Object.entries(learnedSkills).forEach(([agent, skills]) => {
      if (skills.length > 0) {
        const profile = readAgentProfile(agent);
        if (profile) {
          profile.acquiredSkills = [...new Set([...(profile.acquiredSkills || []), ...skills])];
          profile.performanceHistory = profile.performanceHistory || [];
          profile.performanceHistory.push({
            sprint: sprintData.sprintNumber,
            completedAt: sprintData.completedAt,
            tasksCompleted: sprintData.tasks?.filter((t: any) => t.status === "done").length || 0
          });
          updateAgentProfile(agent, profile);
        }
      }
    });
    
    if (sprintData.retrospective) {
      if (sprintData.retrospective.whatWentWell?.length > 0) {
        registerLearning("pattern", 
          `**Éxitos:**\n${sprintData.retrospective.whatWentWell.map((w: string) => `- ${w}`).join("\n")}`,
          sprintData.sprintNumber
        );
      }
      if (sprintData.retrospective.whatWentWrong?.length > 0) {
        registerLearning("anti-pattern",
          `**Errores:**\n${sprintData.retrospective.whatWentWrong.map((w: string) => `- ${w}`).join("\n")}`,
          sprintData.sprintNumber
        );
      }
    }
    
    const index = readMemoryIndex();
    if (index) {
      index.totalSprints = (index.totalSprints || 0) + 1;
      index.lastSprintAt = new Date().toISOString();
      if (sprintData.lessonsLearned) {
        index.lessonsLearned = [...(index.lessonsLearned || []), ...sprintData.lessonsLearned];
      }
      index.agentSkills = {};
      ["po", "arch", "dev", "qa", "doc"].forEach(agent => {
        const profile = readAgentProfile(agent);
        if (profile) {
          index.agentSkills[agent] = [...new Set([...(profile.baseSkills || []), ...(profile.acquiredSkills || [])])];
        }
      });
      updateMemoryIndex(index);
    }
    
    log("INFO", "memory", `✅ Sprint #${sprintData.sprintNumber} guardado con auto-aprendizaje y logs`);
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error guardando sprint: ${error.message}`);
    return false;
  }
}

export async function commitMemoryToGit(sprintNumber: number): Promise<boolean> {
  try {
    const REPO_DIR = process.cwd();
    
    const { stdout: status } = await execAsync(`git status --porcelain grtec-memory/`, { cwd: REPO_DIR });
    if (!status.trim()) {
      log("INFO", "memory", "No hay cambios en la memoria para commitear");
      return true;
    }
    
    await execAsync(`git add grtec-memory/`, { cwd: REPO_DIR });
    await execAsync(
      `git commit -m "🧠 Memoria autónoma actualizada: Sprint #${sprintNumber}\n\n- Historial de sprints actualizado\n- Skills de agentes evolucionados\n- Patrones y anti-patrones registrados\n- Lecciones aprendidas acumuladas\n- Logs del sprint guardados"`,
      { cwd: REPO_DIR }
    );
    
    const sshKeyPath = `C:/Users/GERARD/.ssh/id_ed25519`;
    const sshCommand = `ssh -i ${sshKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
    await execAsync(`git config core.sshCommand "${sshCommand}"`, { cwd: REPO_DIR });
    await execAsync(`git push`, { cwd: REPO_DIR });
    
    log("INFO", "memory", `✅ Memoria del Sprint #${sprintNumber} commiteada y pusheada`);
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error commiteando memoria: ${error.message}`);
    return false;
  }
}

export function readMemoryIndex(): any {
  try {
    if (!fs.existsSync(INDEX_FILE)) return null;
    return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function updateMemoryIndex(updates: any) {
  try {
    const index = readMemoryIndex() || {};
    const updated = { ...index, ...updates };
    fs.writeFileSync(INDEX_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error actualizando índice: ${error.message}`);
    return false;
  }
}

export function listHistoricalSprints(): any[] {
  try {
    if (!fs.existsSync(SPRINTS_DIR)) return [];
    const files = fs.readdirSync(SPRINTS_DIR).filter(f => f.endsWith(".json"));
    return files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(SPRINTS_DIR, f), "utf-8"));
      return {
        sprintNumber: data.sprintNumber,
        completedAt: data.completedAt,
        tasksCount: data.tasks?.length || 0,
        lessonsLearned: data.lessonsLearned?.length || 0
      };
    }).sort((a, b) => a.sprintNumber - b.sprintNumber);
  } catch {
    return [];
  }
}

export function getSprintLogs(sprintNumber: number): any[] {
  try {
    const logFile = path.join(LOGS_DIR, `sprint-${sprintNumber}-logs.json`);
    if (!fs.existsSync(logFile)) return [];
    return JSON.parse(fs.readFileSync(logFile, "utf-8"));
  } catch {
    return [];
  }
}

// ✅ NUEVO: Guardar formulario humano de inicio/fin
export function saveHumanFeedback(sprintNumber: number, phase: "start" | "end", feedback: any) {
  try {
    const feedbackFile = path.join(SPRINTS_DIR, `sprint-${sprintNumber}-${phase}-feedback.json`);
    fs.writeFileSync(feedbackFile, JSON.stringify({
      sprintNumber,
      phase,
      feedback,
      timestamp: new Date().toISOString()
    }, null, 2), "utf-8");
    log("INFO", "memory", `✅ Feedback humano (${phase}) del Sprint #${sprintNumber} guardado`);
    return true;
  } catch (error: any) {
    log("ERROR", "memory", `Error guardando feedback: ${error.message}`);
    return false;
  }
}

export function getHumanFeedback(sprintNumber: number, phase: "start" | "end"): any {
  try {
    const feedbackFile = path.join(SPRINTS_DIR, `sprint-${sprintNumber}-${phase}-feedback.json`);
    if (!fs.existsSync(feedbackFile)) return null;
    return JSON.parse(fs.readFileSync(feedbackFile, "utf-8"));
  } catch {
    return null;
  }
}