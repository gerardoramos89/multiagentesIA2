"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, CheckCircle2, AlertCircle, Settings, Play, 
  LayoutGrid, GitBranch, Clock, Lock, X, 
  Cpu, Terminal, Sparkles, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, FolderGit2, Bot, Activity, ExternalLink,
  FileText, Eye, ScrollText, Zap
} from "lucide-react";
import AgentsScene3DWrapper, { FlightTelemetry } from "./AgentsScene3DWrapper";
import { useAnalysisJob } from "@/lib/use-analysis-job";
import LaunchModal from "./LaunchModal";
import SprintRetrospectiveModal from "./SprintRetrospectiveModal";
import TrelloBoard from "./TrelloBoard";
import ModelsLogPanel from "./ModelsLogPanel";
import AutoCloseModal from "./AutoCloseModal";
import ReadmePreview from "./ReadmePreview";
import SprintStartForm from "./SprintStartForm";
import SprintEndForm from "./SprintEndForm";

const GENERIC_SKILLS: Record<string, string[]> = {
  po: ["User Stories", "Priorización", "Criterios de Aceptación"],
  arch: ["Diseño de Sistemas", "Patrones de Diseño", "Escalabilidad"],
  dev: ["Clean Code", "TDD", "Git Flow", "Refactorización"],
  qa: ["Automatización de Tests", "Pruebas de Seguridad", "Revisión de Código"],
  doc: ["Documentación Técnica", "README", "API Docs"]
};

interface Module { id: string; name: string; status: "on" | "off"; icon: any; }
interface ProjectConfig { owner: string; repo: string; branch: string; language: string; hasReadme: boolean; totalCommits: number; lastPush: string; }
interface AgentConfig { id: string; name: string; model: string; enabled: boolean; prompt: string; skills: string[]; }
interface DiagRow { id: string; label: string; status: "ok" | "warning" | "error"; detail: string; version?: string; timestamp: string; durationMs: number; }
interface LogEntry { ts: string; level: string; source: string; message: string; meta?: any; }
type ModuleStatus = "normal" | "error" | "working" | "done";

const AccordionItem = ({ title, icon: Icon, id, isOpen, onToggle, children, badge }: { title: string; icon: any; id: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; badge?: string; }) => (
  <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/30 mb-2 transition-all hover:border-gray-700">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors text-left">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-cyan-950/30 rounded"><Icon size={16} className="text-cyan-400" /></div>
        <span className="font-bold text-white text-xs">{title}</span>
        {badge && <span className="text-[9px] font-bold bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/30">{badge}</span>}
      </div>
      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
          <div className="p-3 border-t border-gray-800 bg-black/20">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

function ProjectVisionForm({ vision, setVision, onComplete }: { 
  vision: any; 
  setVision: React.Dispatch<React.SetStateAction<any>>; 
  onComplete: () => void; 
}) {
  return (
    <div className="p-4 bg-gray-900/80 border border-cyan-500/30 rounded-xl space-y-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Bot size={16} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white">🎯 Visión del Proyecto (Obligatorio)</h3>
      </div>
      <p className="text-[9px] text-gray-400">Los agentes necesitan entender el contexto para trabajar correctamente.</p>
      
      <div className="space-y-2">
        <div>
          <label className="text-[9px] text-gray-400 mb-1 block">Nombre del Proyecto *</label>
          <input type="text" value={vision.name} onChange={(e) => setVision({...vision, name: e.target.value})} className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none" placeholder="MultiagentesIA - Fábrica Autónoma" />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 mb-1 block">Objetivo General *</label>
          <textarea value={vision.generalObjective} onChange={(e) => setVision({...vision, generalObjective: e.target.value})} className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none resize-none" rows={2} placeholder="Desarrollar un sistema autónomo de gestión de sprints con IA..." />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 mb-1 block">Skills/Tecnologías Clave</label>
          <input type="text" value={vision.targetSkills} onChange={(e) => setVision({...vision, targetSkills: e.target.value})} className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none" placeholder="Next.js, React, TypeScript, Ollama..." />
        </div>
      </div>
      
      <button onClick={() => {
        if (!vision.name || !vision.generalObjective) { alert("⚠️ Nombre y Objetivo General son obligatorios."); return; }
        const completedVision = {...vision, isCompleted: true};
        setVision(completedVision);
        localStorage.setItem('projectVision', JSON.stringify(completedVision));
        onComplete();
      }} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2">
        <CheckCircle2 size={14} /> Guardar Visión y Continuar
      </button>
    </div>
  );
}

function LiveLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        if (data.success) setLogs(data.logs);
      } catch {}
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.level === filter || l.source === filter);
  const levelColors: Record<string, string> = { INFO: "text-cyan-400", WARN: "text-amber-400", ERROR: "text-red-400", AGENT: "text-purple-400", SPRINT: "text-emerald-400", SURVEY: "text-blue-400" };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {["all", "AGENT", "SPRINT", "INFO", "ERROR"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${filter === f ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{f}</button>
        ))}
      </div>
      <div className="bg-black/60 border border-gray-800 rounded p-2 h-64 overflow-y-auto font-mono custom-scrollbar">
        {filteredLogs.length === 0 ? <p className="text-[9px] text-gray-500 text-center py-4">Sin logs aún...</p> : (
          <div className="space-y-0.5">
            {filteredLogs.slice(-50).map((log, i) => {
              const icon = log.source === "doc" ? "📝" : log.source === "dev" ? "🛠️" : log.source === "arch" ? "🏗️" : log.source === "qa" ? "🧪" : log.source === "po" ? "📋" : "";
              return (
                <div key={i} className="text-[8px] leading-tight flex gap-2">
                  <span className="text-gray-600 shrink-0">{new Date(log.ts).toLocaleTimeString("es-ES")}</span>
                  <span className={`shrink-0 font-bold ${levelColors[log.level] || "text-gray-400"}`}>[{log.level}]</span>
                  <span className="text-gray-500 shrink-0 flex items-center gap-1">{icon} {log.source}:</span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const analysis = useAnalysisJob(analysisJobId);
  
  const [autonomousMode, setAutonomousMode] = useState(false);

  const [realCommitsCount, setRealCommitsCount] = useState(0);
  const [sprintsCompleted, setSprintsCompleted] = useState(0);
  const [projectStatus, setProjectStatus] = useState<"config" | "ready" | "building" | "testing" | "deployed">("config");
  const [commitsCount, setCommitsCount] = useState(0);
  const [lastWorkTimes, setLastWorkTimes] = useState<Record<string, string>>({});

  const [modules, setModules] = useState<Module[]>([
    { id: "ollama", name: "Ollama (Motor Local)", status: "on", icon: Cpu },
    { id: "deepseek", name: "DeepSeek V2 (Código)", status: "on", icon: Sparkles },
    { id: "hermes", name: "Hermes 3 (Chat/Docs)", status: "on", icon: MessageSquare },
    { id: "aider", name: "Aider (Ejecutor Git)", status: "on", icon: Terminal },
    { id: "github", name: "GitHub (Repositorios)", status: "off", icon: GitBranch },
    { id: "trello", name: "Trello (Gestión)", status: "off", icon: LayoutGrid },
  ]);

  const [activeConfigModal, setActiveConfigModal] = useState<string | null>(null);
  const [githubConfig, setGithubConfig] = useState({ owner: "", repo: "", token: "" });
  const [trelloConfig, setTrelloConfig] = useState({ apiKey: "", token: "", boardId: "" });
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  
  const [isAnalyzingProject, setIsAnalyzingProject] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    step: number;
    totalSteps: number;
    message: string;
    icon: string;
  } | null>(null);

  const [agentsConfig, setAgentsConfig] = useState<AgentConfig[]>([
    { id: "po", name: "Product Owner", model: "hermes3:8b", enabled: true, prompt: "", skills: GENERIC_SKILLS.po },
    { id: "arch", name: "Arquitecto", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.arch },
    { id: "dev", name: "Developer", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.dev },
    { id: "qa", name: "QA Engineer", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.qa },
    { id: "doc", name: "Technical Writer", model: "hermes3:8b", enabled: true, prompt: "", skills: GENERIC_SKILLS.doc },
  ]);

  const [systemTest, setSystemTest] = useState<DiagRow[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [diagnosticsReady, setDiagnosticsReady] = useState(false);
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleStatus>>({});
  
  const [sprintPlanned, setSprintPlanned] = useState(false);
  const [sprintExecuting, setSprintExecuting] = useState(false);
  const [sprintState, setSprintState] = useState<any>(null);

  const [projectVision, setProjectVision] = useState({ name: "", generalObjective: "", specificObjectives: "", scope: "", targetSkills: "", isCompleted: false });
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showRetrospectiveModal, setShowRetrospectiveModal] = useState(false);
  const [autoCheckSurveys, setAutoCheckSurveys] = useState(true);
  const [hasCompletedSprints, setHasCompletedSprints] = useState(false);
  const [lastRetrospective, setLastRetrospective] = useState<any>(null);
  const [lastSprintNumber, setLastSprintNumber] = useState<number>(0);
  const [agentLogs, setAgentLogs] = useState<Record<string, any[]>>({});
  const [agentWorkLogs, setAgentWorkLogs] = useState<any[]>([]);
  const [customTasks, setCustomTasks] = useState("");
  
  const [activeTab, setActiveTab] = useState<"agents" | "models" | "logs">("agents");
  const [showAutoCloseModal, setShowAutoCloseModal] = useState(false);
  const [showReadmePreview, setShowReadmePreview] = useState(false);
  const [autoExecuteNextSprint, setAutoExecuteNextSprint] = useState(false);
  
  const [showStartForm, setShowStartForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);

  const configuredCount = modules.filter(m => m.status === "on").length;
  const canLaunch = modules.every(m => m.status === "on") && projectConfig !== null && diagnosticsReady;
  const [openPanel, setOpenPanel] = useState<string>("");

  useEffect(() => {
    const savedVision = localStorage.getItem('projectVision');
    if (savedVision) { 
      try { setProjectVision(JSON.parse(savedVision)); } catch {} 
    }
    
    const savedProject = localStorage.getItem('projectConfig');
    if (savedProject) {
      try {
        const projectData = JSON.parse(savedProject);
        setProjectConfig(projectData);
        setCommitsCount(projectData.totalCommits || 0);
        setRealCommitsCount(projectData.totalCommits || 0);
        setProjectStatus("ready");
      } catch {}
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/sprint/last-retrospective");
        const data = await res.json();
        if (data.success && data.retrospective) {
          setLastRetrospective(data.retrospective);
          setLastSprintNumber(data.sprintNumber);
          setHasCompletedSprints(true);
        }
      } catch {}
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (lastRetrospective && (!sprintState || sprintState.sprint?.status === "completed") && customTasks.trim() === "") {
      const suggestions: string[] = [];
      if (lastRetrospective.whatNeedsDefinition?.length > 0) {
        suggestions.push("🔍 DEFINICIONES TÉCNICAS PENDIENTES:");
        lastRetrospective.whatNeedsDefinition.forEach((item: string) => {
          const cleanItem = item.replace(/^\[.*?\]\s*/, "");
          suggestions.push(`[ARCH/DEV] ${cleanItem}`);
        });
      }
      if (lastRetrospective.actionItems?.length > 0) {
        suggestions.push("\n🛠️ ACCIONES TÉCNICAS PARA EL PRÓXIMO SPRINT:");
        lastRetrospective.actionItems.forEach((item: string) => {
          const cleanItem = item.replace(/^\[.*?\]\s*/, "");
          suggestions.push(`[DEV/QA] ${cleanItem}`);
        });
      }
      if (suggestions.length > 0) {
        setCustomTasks(suggestions.join("\n"));
      }
    }
  }, [lastRetrospective, sprintState]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/commits/stats");
        const data = await res.json();
        if (data.success) {
          setRealCommitsCount(data.totalCommits || 0);
          setSprintsCompleted(data.sprintsCompleted || 0);
        }
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSprintState = async () => {
      try {
        const res = await fetch("/api/sprint/state");
        const data = await res.json();
        if (data.success && data.sprint) {
          setSprintState(data);
          setSprintPlanned(true);
          
          const newStates: Record<string, ModuleStatus> = {};
          const newTimes: Record<string, string> = {};
          
          for (const task of data.sprint.tasks) {
            if (task.status === "working") {
              newStates[task.agent] = "working";
              ["ollama", "deepseek", "hermes", "aider", "github", "trello"].forEach(m => newStates[m] = "working");
            } else if (task.status === "done") {
              newStates[task.agent] = "done";
              if (task.completedAt) newTimes[task.agent] = new Date(task.completedAt).toLocaleString("es-ES", { hour: '2-digit', minute: '2-digit' });
            }
          }
          
          if (Object.keys(newStates).length > 0) {
            setModuleStates(prev => ({ ...prev, ...newStates }));
            setLastWorkTimes(prev => ({ ...prev, ...newTimes }));
          }
          
          if (data.sprint.status === "executing") { setSprintExecuting(true); }
          if (data.sprint.status === "completed") { setSprintExecuting(false); setProjectStatus("deployed"); setShowLaunchModal(false); }
        } else {
          setSprintState(null);
        }

        const logsRes = await fetch("/api/agent-logs");
        const logsData = await logsRes.json();
        if (logsData.success) setAgentLogs(logsData.logs);

        const workLogsRes = await fetch("/api/agent-work-logs");
        const workLogsData = await workLogsRes.json();
        if (workLogsData.success) setAgentWorkLogs(workLogsData.logs);

      } catch {}
    };
    fetchSprintState();
    const interval = setInterval(fetchSprintState, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTests = localStorage.getItem('systemTest');
    const savedReady = localStorage.getItem('diagnosticsReady');
    if (savedTests) { try { setSystemTest(JSON.parse(savedTests)); } catch {} }
    if (savedReady) { setDiagnosticsReady(JSON.parse(savedReady)); }
  }, []);

  useEffect(() => {
    if (systemTest.length > 0) {
      localStorage.setItem('systemTest', JSON.stringify(systemTest));
      localStorage.setItem('diagnosticsReady', JSON.stringify(diagnosticsReady));
    }
  }, [systemTest, diagnosticsReady]);

  useEffect(() => {
    if (analysis.status === "done" && analysis.result) {
      console.log("✅ Análisis completado:", analysis.result);
      
      const branch = analysis.result.branch || "main";
      const language = analysis.result.stack?.languages?.[0]?.name || "TypeScript";
      const hasReadme = analysis.result.status?.hasReadme ?? true;
      const commits = analysis.result.status?.commits || realCommitsCount || 0;
      const contributors = analysis.result.status?.contributors || 1;
      
      const projectData = {
        owner: githubConfig.owner || "gerardoramos89",
        repo: githubConfig.repo || "multiagentesIA",
        branch,
        language,
        hasReadme,
        totalCommits: commits,
        contributors,
        lastPush: new Date().toISOString(),
        analyzedAt: new Date().toISOString()
      };
      
      localStorage.setItem('projectConfig', JSON.stringify(projectData));
      
      setProjectConfig(projectData);
      setCommitsCount(commits);
      setRealCommitsCount(commits);
      setProjectStatus("ready");
      setIsAnalyzingProject(false);
      setAnalysisProgress(null);
    } else if (analysis.status === "error") {
      console.error(`❌ Error en análisis: ${analysis.error}`);
      setIsAnalyzingProject(false);
      setAnalysisProgress(null);
    }
  }, [analysis.status, analysis.result, githubConfig.owner, githubConfig.repo, realCommitsCount]);

  useEffect(() => { loadConfigFromServer(); }, []);

  const loadConfigFromServer = async () => {
    try {
      const res = await fetch('/api/config/status');
      const config = await res.json();
      
      const lastKnownRepo = localStorage.getItem('lastKnownRepo');
      const currentRepo = config.github?.configured 
        ? `${config.github.owner}/${config.github.repo}` 
        : null;
      
      if (lastKnownRepo && currentRepo && lastKnownRepo !== currentRepo) {
        const confirmReset = window.confirm(
          `⚠️ Cambio de repo detectado:\n\nAnterior: ${lastKnownRepo}\nNuevo: ${currentRepo}\n\n¿Limpiar caché?`
        );
        
        if (confirmReset) {
          await fetch('/api/project/reset', { method: 'POST' });
          localStorage.clear();
          setTimeout(() => location.reload(), 500);
          return;
        }
      }
      
      if (currentRepo) localStorage.setItem('lastKnownRepo', currentRepo);
      
      if (config.github?.configured) {
        setGithubConfig({
          owner: config.github.owner,
          repo: config.github.repo,
          token: config.github.token
        });
        setModules(prev => prev.map(m => m.id === "github" ? { ...m, status: "on" } : m));
      }
      
      if (config.trello?.configured) {
        setTrelloConfig({
          apiKey: config.trello.apiKey,
          token: config.trello.token,
          boardId: config.trello.boardId
        });
        setModules(prev => prev.map(m => m.id === "trello" ? { ...m, status: "on" } : m));
      }
    } catch (error) {
      console.error("❌ Error cargando config:", error);
    }
  };

  const analyzeProject = async () => {
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) { 
      alert("Configura GitHub primero (haz clic en Sync)"); 
      return; 
    }
    
    setIsAnalyzingProject(true);
    
    const steps = [
      { step: 1, totalSteps: 5, message: "Conectando con GitHub...", icon: "🔌" },
      { step: 2, totalSteps: 5, message: "Obteniendo información del repositorio...", icon: "📦" },
      { step: 3, totalSteps: 5, message: "Analizando estructura de carpetas...", icon: "📁" },
      { step: 4, totalSteps: 5, message: "Detectando stack tecnológico...", icon: "🔍" },
      { step: 5, totalSteps: 5, message: "Generando informe del proyecto...", icon: "📊" },
    ];
    
    for (const s of steps) {
      setAnalysisProgress(s);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    try {
      const res = await fetch("/api/project/analyze", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          owner: githubConfig.owner, 
          repo: githubConfig.repo, 
          token: githubConfig.token 
        }) 
      });
      const data = await res.json();
      
      if (data.success) {
        setAnalysisProgress({
          step: 5,
          totalSteps: 5,
          message: "✅ Análisis completado exitosamente",
          icon: "🎉"
        });
        setAnalysisJobId(data.jobId);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsAnalyzingProject(false);
        setAnalysisProgress(null);
      } else { 
        setAnalysisProgress({
          step: 0,
          totalSteps: 5,
          message: `❌ Error: ${data.message}`,
          icon: "⚠️"
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsAnalyzingProject(false);
        setAnalysisProgress(null);
      }
    } catch { 
      setAnalysisProgress({
        step: 0,
        totalSteps: 5,
        message: "❌ Error de conexión",
        icon: "🔌"
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAnalyzingProject(false);
      setAnalysisProgress(null);
    }
  };

  const runPreFlightCheck = async () => {
    setIsRunningTest(true);
    modules.forEach(m => setModuleStates(prev => ({ ...prev, [m.id]: "working" })));
    try {
      const res = await fetch("/api/system/diagnostics", { method: "POST" });
      const data = await res.json();
      setSystemTest(data.results ?? []);
      setDiagnosticsReady(Boolean(data.ready));
      localStorage.setItem('diagnosticsReady', JSON.stringify(Boolean(data.ready)));
      const newStates: Record<string, ModuleStatus> = {};
      const newTimes: Record<string, string> = {};
      const nowStr = new Date().toLocaleString("es-ES", { hour: '2-digit', minute: '2-digit' });
      for (const row of data.results) {
        newStates[row.id] = row.status === "error" ? "error" : "done";
        if (row.status !== "error") newTimes[row.id] = nowStr;
      }
      ["po", "arch", "dev", "qa", "doc"].forEach(id => { newStates[id] = "normal"; });
      setModuleStates(newStates);
      setLastWorkTimes(prev => ({ ...prev, ...newTimes }));
    } catch {
      setDiagnosticsReady(false);
      localStorage.setItem('diagnosticsReady', 'false');
      setSystemTest([{ id: "runner", label: "Executor", status: "error", detail: "Error de conexión", timestamp: new Date().toISOString(), durationMs: 0 }]);
    } finally { setIsRunningTest(false); }
  };

  // ✅ FUNCIÓN MAESTRA: Desbloquear todo
  const unlockEverything = () => {
    // Activar todos los módulos
    setModules(prev => prev.map(m => ({ ...m, status: "on" as const })));
    
    // Completar visión
    const visionData = {
      name: "MultiagentesIA - Fábrica Autónoma",
      generalObjective: "Desarrollar un sistema autónomo de gestión de sprints con IA donde agentes especializados colaboren para construir software de forma iterativa, con memoria persistente versionada en Git y auto-aprendizaje continuo.",
      targetSkills: "Next.js, React, TypeScript, Tailwind CSS, Three.js, Ollama, DeepSeek Coder V2, Git/GitHub API",
      isCompleted: true
    };
    setProjectVision(visionData);
    localStorage.setItem('projectVision', JSON.stringify(visionData));
    
    // Aprobar diagnóstico
    setDiagnosticsReady(true);
    localStorage.setItem('diagnosticsReady', 'true');
    
    // Configurar proyecto con datos reales o dummy
    const projectData = {
      owner: githubConfig.owner || "gerardoramos89",
      repo: githubConfig.repo || "multiagentesIA",
      branch: "main",
      language: "TypeScript",
      hasReadme: true,
      totalCommits: realCommitsCount || 1,
      contributors: 1,
      lastPush: new Date().toISOString(),
      analyzedAt: new Date().toISOString()
    };
    setProjectConfig(projectData);
    localStorage.setItem('projectConfig', JSON.stringify(projectData));
    
    alert("✅ ¡TODO DESBLOQUEADO!\n\nAhora:\n1. Pega las tareas del sprint\n2. Marca 'Ejecutar automáticamente'\n3. Clic en 'Planificar Primer Sprint'\n4. ¡A dormir! 🌙");
  };

  const progress = (configuredCount / modules.length) * 100;
  
  const telemetry: FlightTelemetry = useMemo(() => {
    const currentSprintNumber = sprintState?.sprint?.sprintNumber || (sprintPlanned ? 1 : null);
    let realStatus: "config" | "ready" | "building" | "testing" | "deployed" = "config";
    if (sprintState?.sprint?.status === "executing") realStatus = "building";
    else if (sprintState?.sprint?.status === "survey" || sprintState?.sprint?.status === "review") realStatus = "testing";
    else if (sprintState?.sprint?.status === "completed" || hasCompletedSprints) realStatus = "deployed";
    else if (projectConfig) realStatus = "ready";
    
    return {
      repo: githubConfig.owner && githubConfig.repo ? { owner: githubConfig.owner, name: githubConfig.repo } : null,
      stars: null,
      commits: realCommitsCount,
      sprint: { number: currentSprintNumber, source: "active" },
      status: realStatus,
      progress,
      lastActivity: null,
    };
  }, [githubConfig, realCommitsCount, projectStatus, progress, sprintPlanned, sprintExecuting, sprintState, hasCompletedSprints, projectConfig]);

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      <div className="w-full md:w-[70%] h-full relative">
        <button 
          onClick={() => setShowReadmePreview(!showReadmePreview)}
          className="absolute top-4 right-4 p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-lg hover:from-cyan-500 hover:to-blue-500 transition-all z-40"
          title="Ver README / index.html"
        >
          <FileText size={20} />
        </button>

        <AgentsScene3DWrapper 
          onComplete={() => {}} showUI={false} 
          configuredModules={modules.filter(m => m.status === "on").map(m => m.id)}
          projectStatus={sprintExecuting ? "building" : projectStatus} 
          commitsCount={realCommitsCount}
          moduleStates={moduleStates} 
          lastWorkTimes={lastWorkTimes}
          taskCounts={{ po: 0, arch: 0, dev: 0, qa: 0, doc: 0 }} 
          telemetry={telemetry}
          sprintState={sprintState}
          agentLogs={agentLogs}
          agentWorkLogs={agentWorkLogs}
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-2"><Rocket size={14} /> Estado de la Nave</h3>
            <span className="text-[10px] text-gray-400">{configuredCount}/{modules.length} módulos</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <motion.div className={`h-full rounded-full transition-all duration-500 ${canLaunch && projectVision.isCompleted ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[30%] h-full bg-gray-950 border-l border-cyan-500/20 flex flex-col">
        <div className="p-4 border-b border-cyan-500/20 bg-gray-900/30 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white mb-0.5">Centro de Comando</h1>
            <p className="text-[10px] text-gray-400">Configuración Inteligente</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadConfigFromServer} className="text-[10px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"><RefreshCw size={10} /> Sync</button>
            <button 
              onClick={async () => {
                if (!confirm("⚠️ ¿Limpiar toda la caché local?")) return;
                try {
                  await fetch('/api/project/reset', { method: 'POST' });
                  localStorage.clear();
                  alert("✅ Reset completado. Recargando...");
                  setTimeout(() => location.reload(), 1000);
                } catch (err: any) {
                  alert(`❌ Error: ${err.message}`);
                }
              }}
              className="text-[10px] flex items-center gap-1 text-red-400 hover:text-red-300 underline"
            >
              🧹 Reset
            </button>
          </div>
        </div>

        <div className="border-b border-gray-800 bg-gray-900/50 shrink-0">
          <div className="flex">
            <button onClick={() => setActiveTab("agents")} className={`flex-1 px-4 py-2 text-[10px] font-bold transition-all ${activeTab === "agents" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-gray-300"}`}>
              <Bot size={14} className="inline mr-1" /> Agentes
            </button>
            <button onClick={() => setActiveTab("models")} className={`flex-1 px-4 py-2 text-[10px] font-bold transition-all ${activeTab === "models" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-gray-300"}`}>
              <FileText size={14} className="inline mr-1" /> Models
            </button>
            <button onClick={() => setActiveTab("logs")} className={`flex-1 px-4 py-2 text-[10px] font-bold transition-all ${activeTab === "logs" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-gray-300"}`}>
              <ScrollText size={14} className="inline mr-1" /> Logs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "agents" && (
            <div className="h-full overflow-y-auto p-3 custom-scrollbar">
              <AccordionItem title="Módulos" icon={Settings} id="modules" isOpen={openPanel === "modules"} onToggle={() => setOpenPanel(openPanel === "modules" ? "" : "modules")} badge={`${configuredCount}/${modules.length}`}>
                <div className="space-y-2">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div key={module.id} className={`p-2 rounded border flex items-center justify-between transition-all ${module.status === "on" ? "bg-emerald-950/20 border-emerald-500/30" : "bg-red-950/40 border-red-500/50"}`}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${module.status === "on" ? "bg-emerald-500/20" : "bg-red-500/20"}`}><Icon size={14} className={module.status === "on" ? "text-emerald-400" : "text-red-400"} /></div>
                          <div><span className="text-[11px] font-medium text-white block">{module.name}</span></div>
                        </div>
                        {module.status === "off" && <button onClick={() => setActiveConfigModal(module.id)} className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold rounded transition-all">Config</button>}
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>

              <AccordionItem title="Test Pre-Vuelo" icon={Activity} id="test" isOpen={openPanel === "test"} onToggle={() => setOpenPanel(openPanel === "test" ? "" : "test")} badge={diagnosticsReady ? "✅ Aprobado" : "Sin ejecutar"}>
                <div className="space-y-2">
                  {systemTest.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {systemTest.map((row) => (
                        <div key={row.id} className={`p-2 rounded border ${row.status === "error" ? "border-red-500/60 bg-red-950/30" : "border-emerald-500/40 bg-emerald-950/20"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-white font-medium">{row.label}</span>
                            <span className="text-[8px] text-gray-500 font-mono">{row.durationMs}ms</span>
                          </div>
                          <p className={`text-[9px] break-words ${row.status === "error" ? "text-red-400" : "text-emerald-300"}`}>{row.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={runPreFlightCheck} disabled={isRunningTest} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                    {isRunningTest ? <><RefreshCw size={12} className="animate-spin" /> Ejecutando...</> : <><Activity size={12} /> Ejecutar Diagnóstico</>}
                  </button>
                </div>
              </AccordionItem>

              <AccordionItem title="Configuración del Proyecto" icon={FolderGit2} id="project" isOpen={openPanel === "project"} onToggle={() => setOpenPanel(openPanel === "project" ? "" : "project")} badge={projectConfig ? "✅ Analizado" : "Pendiente"}>
                <div className="space-y-3">
                  {!projectConfig ? (
                    <div className="space-y-3">
                      <button 
                        onClick={analyzeProject} 
                        disabled={isAnalyzingProject || !githubConfig.token}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzingProject ? (
                          <><RefreshCw size={12} className="animate-spin" /> Analizando...</>
                        ) : (
                          <><GitBranch size={12} /> Analizar Proyecto</>
                        )}
                      </button>
                      
                      {isAnalyzingProject && analysisProgress && (
                        <div className="p-3 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">
                              Análisis en progreso
                            </span>
                            <span className="text-[9px] font-mono text-cyan-400">
                              {analysisProgress.step}/{analysisProgress.totalSteps}
                            </span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(analysisProgress.step / analysisProgress.totalSteps) * 100}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-base">{analysisProgress.icon}</span>
                            <span className="text-[10px] text-gray-200 font-medium">
                              {analysisProgress.message}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-emerald-950/30 to-cyan-950/30 border border-emerald-500/40 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[11px] text-emerald-400 font-bold">✓ Proyecto Analizado</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-gray-500 mb-0.5">📦 Repo</div>
                          <div className="text-white font-mono text-[8px]">{projectConfig.owner}/{projectConfig.repo}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-gray-500 mb-0.5">🌿 Rama</div>
                          <div className="text-white font-mono">{projectConfig.branch || "main"}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-gray-500 mb-0.5">🔢 Commits</div>
                          <div className="text-cyan-400 font-bold text-sm">{projectConfig.totalCommits || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-gray-500 mb-0.5">💻 Lenguaje</div>
                          <div className="text-white">{projectConfig.language || "TypeScript"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionItem>
            </div>
          )}

          {activeTab === "models" && (
            <ModelsLogPanel agentWorkLogs={agentWorkLogs} />
          )}

          {activeTab === "logs" && (
            <div className="h-full overflow-y-auto p-3 custom-scrollbar">
              <LiveLogs />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0 space-y-3">
          {!projectVision.isCompleted && (
            <ProjectVisionForm vision={projectVision} setVision={setProjectVision} onComplete={() => {}} />
          )}

          {/* ✅ BOTÓN MAESTRO DE DESBLOQUEO */}
          <button 
            onClick={unlockEverything}
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white text-[11px] font-black rounded-lg hover:from-amber-500 hover:via-orange-500 hover:to-red-500 transition-all flex items-center justify-center gap-2 border-2 border-amber-400/50 shadow-2xl shadow-amber-900/40 animate-pulse"
          >
            <Zap size={16} className="animate-bounce" />
            ⚡ DESBLOQUEAR TODO Y EMPEZAR
            <Zap size={16} className="animate-bounce" />
          </button>

          {!sprintState || sprintState?.sprint?.status === "completed" ? (
            <>
              <div className="mb-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                <label className="text-[9px] text-gray-400 mb-1 block font-bold">
                  📋 Tareas del Sprint (Editables):
                </label>
                <textarea 
                  value={customTasks}
                  onChange={(e) => setCustomTasks(e.target.value)}
                  placeholder="[PO] Definir estrategia del MVP&#10;[ARCH] Diseñar estructura grtec-memory&#10;[DEV] Implementar memory-manager.ts&#10;[QA] Crear script de validación&#10;[DOC] Redactar README.md"
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[9px] text-white focus:border-cyan-500 outline-none resize-none h-24"
                />
              </div>

              {/* ✅ INDICADOR DE REQUISITOS */}
              <div className="p-2 bg-gray-900/50 border border-gray-700 rounded-lg space-y-1 mb-2">
                <div className="text-[9px] text-gray-400 font-bold mb-1">Requisitos para planificar:</div>
                <div className="flex items-center gap-2 text-[9px]">
                  {projectVision.isCompleted ? (
                    <CheckCircle2 size={10} className="text-emerald-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-600" />
                  )}
                  <span className={projectVision.isCompleted ? "text-emerald-400" : "text-gray-500"}>Visión del proyecto</span>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  {diagnosticsReady ? (
                    <CheckCircle2 size={10} className="text-emerald-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-600" />
                  )}
                  <span className={diagnosticsReady ? "text-emerald-400" : "text-gray-500"}>Test Pre-Vuelo aprobado</span>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  {projectConfig ? (
                    <CheckCircle2 size={10} className="text-emerald-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-600" />
                  )}
                  <span className={projectConfig ? "text-emerald-400" : "text-gray-500"}>Proyecto analizado</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 p-2 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                <input 
                  type="checkbox" 
                  id="autoExecute"
                  checked={autoExecuteNextSprint}
                  onChange={(e) => setAutoExecuteNextSprint(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500 bg-gray-800 cursor-pointer"
                />
                <label htmlFor="autoExecute" className="text-[10px] text-cyan-300 font-medium cursor-pointer select-none flex items-center gap-1">
                  🚀 Ejecutar automáticamente
                </label>
              </div>

              <button 
                disabled={!projectConfig || !diagnosticsReady || !projectVision.isCompleted}
                onClick={async () => {
                  try {
                    const tasksArray = customTasks.split('\n')
                      .map(t => t.trim())
                      .filter(t => 
                        t.length > 0 && 
                        !t.includes('DEFINICIONES TÉCNICAS') && 
                        !t.includes('ACCIONES TÉCNICAS') &&
                        !t.startsWith('🔍') &&
                        !t.startsWith('🛠️')
                      );

                    const res = await fetch("/api/sprint/plan", { 
                      method: "POST", 
                      headers: { "Content-Type": "application/json" }, 
                      body: JSON.stringify({ 
                        agents: agentsConfig.filter(a => a.enabled), 
                        brief: await fetch("/api/project/brief").then(r => r.json()).then(d => d.brief).catch(() => null),
                        vision: projectVision,
                        customTasks: tasksArray
                      }) 
                    });
                    const data = await res.json();
                    if (data.success) { 
                      setSprintPlanned(true); 
                      setCustomTasks("");
                      
                      if (autoExecuteNextSprint) {
                        setTimeout(async () => {
                          try {
                            const savedVision = typeof window !== 'undefined' ? localStorage.getItem('projectVision') : null;
                            const vision = savedVision ? JSON.parse(savedVision) : projectVision;
                            const execRes = await fetch("/api/sprint/execute", { 
                              method: "POST", 
                              headers: { "Content-Type": "application/json" }, 
                              body: JSON.stringify({ vision }) 
                            });
                            const execData = await execRes.json();
                            if (execData.success) {
                              setShowLaunchModal(true);
                              setSprintExecuting(true);
                              setProjectStatus("building");
                            }
                          } catch (err: any) {
                            alert(`❌ Error: ${err.message}`);
                          }
                        }, 1500);
                      }
                    } else { 
                      alert(`❌ Error: ${data.message}`); 
                    }
                  } catch (err: any) { 
                    alert(`❌ Error: ${err.message}`); 
                  }
                }} 
                className={`w-full py-2 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-2 ${
                  projectConfig && diagnosticsReady && projectVision.isCompleted 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500" 
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <LayoutGrid size={14} /> {hasCompletedSprints ? "Planificar Nuevo Sprint" : "Planificar Primer Sprint"}
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch("/api/sprint/last-retrospective");
                    const data = await res.json();
                    if (data.success && data.retrospective) {
                      setLastRetrospective(data.retrospective);
                      setLastSprintNumber(data.sprintNumber);
                      setShowRetrospectiveModal(true);
                    }
                  } catch {}
                }}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={14} /> Ver Última Retrospectiva
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <CheckCircle2 size={14} />
                <span className="font-bold">Sprint #{sprintState?.sprint?.sprintNumber || 1} Planificado</span>
              </div>
              
              {sprintState?.sprint?.status === "planned" && !sprintExecuting && (
                <button 
                  onClick={() => setShowStartForm(true)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-bold rounded hover:from-emerald-500 hover:to-green-500 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <Play size={14} /> REVISAR Y EJECUTAR SPRINT
                </button>
              )}

              {sprintState?.sprint?.status === "executing" && (
                <div className="p-3 bg-purple-950/20 border border-purple-500/40 rounded">
                  <div className="flex items-center gap-2 mb-1"><RefreshCw size={14} className="text-purple-400 animate-spin" /><span className="text-[10px] font-bold text-purple-400">Sprint en Ejecución</span></div>
                  <p className="text-[9px] text-gray-400">{sprintState?.sprint?.tasks?.filter((t: any) => t.status === "done").length || 0} / {sprintState?.sprint?.tasks?.length || 0} tareas completadas</p>
                </div>
              )}

              {sprintState?.sprint?.status === "retrospective" && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/40 rounded">
                  <div className="flex items-center gap-2 mb-1"><Bot size={14} className="text-cyan-400 animate-pulse" /><span className="text-[10px] font-bold text-cyan-400">Generando Retrospectiva...</span></div>
                </div>
              )}

              {sprintState?.sprint?.status === "review" && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">Sprint Completado - Revisión Humana</span>
                  </div>
                  <button 
                    onClick={() => setShowEndForm(true)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-[10px] font-bold rounded hover:from-emerald-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-1"
                  >
                    <FileText size={12} /> Abrir Formulario de Cierre
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeConfigModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setActiveConfigModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Configurar {modules.find(m => m.id === activeConfigModal)?.name}</h2>
                <button onClick={() => setActiveConfigModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Añade las variables a <span className="font-mono text-cyan-400">.env.local</span>.</p>
              <button onClick={() => { setActiveConfigModal(null); loadConfigFromServer(); }} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">Verificar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LaunchModal isOpen={showLaunchModal} onClose={() => setShowLaunchModal(false)} sprintNumber={sprintState?.sprint?.sprintNumber || 1} />
      <SprintRetrospectiveModal isOpen={showRetrospectiveModal} onClose={() => setShowRetrospectiveModal(false)} retrospective={lastRetrospective} sprintNumber={lastSprintNumber || 1} />
      <AutoCloseModal isOpen={showAutoCloseModal} onClose={() => setShowAutoCloseModal(false)} sprintNumber={lastSprintNumber || 1} />
      <ReadmePreview isVisible={showReadmePreview} onClose={() => setShowReadmePreview(false)} />
      
      <SprintStartForm 
        isOpen={showStartForm}
        onClose={() => setShowStartForm(false)}
        sprintNumber={sprintState?.sprint?.sprintNumber || 1}
        tasksCount={sprintState?.sprint?.tasks?.length || 0}
        onConfirm={async (feedback) => {
          try {
            await fetch("/api/sprint/feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phase: "start", feedback })
            });
            setShowStartForm(false);
            
            const savedVision = typeof window !== 'undefined' ? localStorage.getItem('projectVision') : null;
            const vision = savedVision ? JSON.parse(savedVision) : projectVision;
            const res = await fetch("/api/sprint/execute", { 
              method: "POST", 
              headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({ vision }) 
            });
            const data = await res.json();
            if (data.success) {
              setShowLaunchModal(true);
              setSprintExecuting(true);
              setProjectStatus("building");
            }
          } catch (err: any) {
            alert(`❌ Error: ${err.message}`);
          }
        }}
      />

      <SprintEndForm 
        isOpen={showEndForm}
        onClose={() => setShowEndForm(false)}
        sprintNumber={sprintState?.sprint?.sprintNumber || 1}
        retrospective={sprintState?.sprint?.retrospective || lastRetrospective}
        onSubmitSuccess={() => {
          setShowEndForm(false);
          setSprintPlanned(false);
          setSprintExecuting(false);
          setSprintState(null);
          
          fetch("/api/sprint/last-retrospective").then(r => r.json()).then(data => {
            if (data.success && data.retrospective) {
              setLastRetrospective(data.retrospective);
              setLastSprintNumber(data.sprintNumber);
              setHasCompletedSprints(true);
            }
          });
        }}
      />
    </div>
  );
}