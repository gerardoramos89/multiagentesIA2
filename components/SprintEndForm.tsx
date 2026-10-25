"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface SprintEndFormProps {
  isOpen: boolean;
  onClose: () => void;
  sprintNumber: number;
  retrospective: any;
  onSubmitSuccess: () => void;
}

export default function SprintEndForm({ isOpen, onClose, sprintNumber, retrospective, onSubmitSuccess }: SprintEndFormProps) {
  const [achievements, setAchievements] = useState("");
  const [improvements, setImprovements] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!achievements.trim() && !improvements.trim() && Object.values(customAnswers).every(v => !v?.trim())) {
      setError("⚠️ Por favor completa al menos un campo antes de cerrar.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/sprint/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humanFeedback: {
            achievements,
            improvements,
            customAnswers
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        onSubmitSuccess();
      } else {
        setError(`❌ Error: ${data.message}`);
      }
    } catch (err: any) {
      setError(`❌ Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-gray-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-emerald-950/50 to-cyan-950/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Cierre del Sprint #{sprintNumber}</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Retrospectiva de la IA */}
              {retrospective && (
                <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg space-y-2">
                  <h3 className="text-[11px] font-bold text-cyan-400">📊 Retrospectiva generada por el equipo:</h3>
                  
                  {retrospective.whatWasAchieved?.length > 0 && (
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold">✅ Logros:</p>
                      <ul className="text-[9px] text-gray-300 list-disc list-inside">
                        {retrospective.whatWasAchieved.map((l: string, i: number) => <li key={i}>{l}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {retrospective.whatWentWrong?.length > 0 && (
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold">⚠️ Problemas:</p>
                      <ul className="text-[9px] text-gray-300 list-disc list-inside">
                        {retrospective.whatWentWrong.map((l: string, i: number) => <li key={i}>{l}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {retrospective.actionItems?.length > 0 && (
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold">🎯 Acciones sugeridas:</p>
                      <ul className="text-[9px] text-gray-300 list-disc list-inside">
                        {retrospective.actionItems.map((l: string, i: number) => <li key={i}>{l}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback humano */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <p className="text-[10px] text-emerald-300 mb-2">
                  💬 <b>Tu feedback es crucial</b> para que el equipo mejore en el próximo sprint.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                  🏆 ¿Qué se logró realmente en este sprint?
                </label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Describe los logros reales, validados por ti como humano..."
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-emerald-500 outline-none resize-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                  🔧 ¿Qué mejorarías para el próximo sprint?
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Sugerencias, ajustes, cambios de dirección..."
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-emerald-500 outline-none resize-none h-20"
                />
              </div>

              {retrospective?.whatNeedsDefinition?.length > 0 && (
                <div>
                  <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                    ❓ Decisiones pendientes (responde cada una):
                  </label>
                  <div className="space-y-2">
                    {retrospective.whatNeedsDefinition.map((item: string, i: number) => (
                      <div key={i}>
                        <p className="text-[9px] text-gray-400 mb-1">{item}</p>
                        <input
                          type="text"
                          value={customAnswers[item] || ""}
                          onChange={(e) => setCustomAnswers(prev => ({ ...prev, [item]: e.target.value }))}
                          placeholder="Tu decisión..."
                          className="w-full p-1.5 bg-black/40 border border-gray-700 rounded text-[9px] text-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2 bg-red-950/30 border border-red-500/50 rounded-lg text-[10px] text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-[11px] font-bold rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cerrando sprint y guardando en memoria...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Aprobar y Cerrar Sprint
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}