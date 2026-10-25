"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface Survey {
  id: string;
  question: string;
  type: "multiple" | "open";
  options?: string[];
}

interface SprintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveys: Survey[];
  sprintNumber: number;
  onSubmitSuccess: () => void;
}

export default function SprintReviewModal({ isOpen, onClose, surveys, sprintNumber, onSubmitSuccess }: SprintReviewModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar que todas estén respondidas
    const allAnswered = surveys.every(s => answers[s.id]?.trim() !== "");
    if (!allAnswered) {
      setError("⚠️ Por favor responde todas las preguntas antes de cerrar el sprint.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-gray-950 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Cierre del Sprint #{sprintNumber}</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
                <X size={18} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <p className="text-[10px] text-gray-400 mb-2">
                Tus respuestas se guardarán como "Lecciones Aprendidas" para mejorar el próximo sprint.
              </p>

              {surveys.map((survey) => (
                <div key={survey.id} className="space-y-2">
                  <label className="text-[10px] text-gray-300 font-bold flex items-start gap-1.5">
                    {survey.type === "multiple" ? "🎯" : "❓"} {survey.question}
                  </label>
                  
                  {survey.type === "multiple" ? (
                    <select
                      value={answers[survey.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [survey.id]: e.target.value }))}
                      className="w-full p-2 bg-black/40 border border-gray-700 rounded-lg text-[10px] text-white focus:border-cyan-500 outline-none transition-colors"
                    >
                      <option value="">Selecciona una opción...</option>
                      {survey.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <textarea
                      value={answers[survey.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [survey.id]: e.target.value }))}
                      placeholder="Escribe tu decisión, ajuste o comentario..."
                      className="w-full p-2 bg-black/40 border border-gray-700 rounded-lg text-[10px] text-white focus:border-cyan-500 outline-none transition-colors resize-none h-20"
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="p-2 bg-red-950/30 border border-red-500/50 rounded-lg text-[10px] text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-[11px] font-bold rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Aprobar Respuestas y Cerrar Sprint
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