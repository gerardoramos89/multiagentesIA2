"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Play } from "lucide-react";

interface SprintStartFormProps {
  isOpen: boolean;
  onClose: () => void;
  sprintNumber: number;
  tasksCount: number;
  onConfirm: (feedback: any) => void;
}

export default function SprintStartForm({ isOpen, onClose, sprintNumber, tasksCount, onConfirm }: SprintStartFormProps) {
  const [objectives, setObjectives] = useState("");
  const [constraints, setConstraints] = useState("");
  const [priority, setPriority] = useState("normal");

  const handleSubmit = () => {
    onConfirm({
      objectives: objectives.trim(),
      constraints: constraints.trim(),
      priority,
      confirmedAt: new Date().toISOString()
    });
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
            className="relative w-full max-w-lg bg-gray-950 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-cyan-950/50 to-blue-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Confirmar Inicio del Sprint #{sprintNumber}</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                <p className="text-[10px] text-cyan-300">
                  📋 Se planificaron <b>{tasksCount} tareas</b> para este sprint. 
                  Antes de iniciar, confirma los objetivos y restricciones.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                  🎯 Objetivos específicos de este sprint (opcional)
                </label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Ej: Priorizar la refactorización del módulo X, evitar cambios en la base de datos..."
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none resize-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                  ⚠️ Restricciones o advertencias (opcional)
                </label>
                <textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="Ej: No tocar el módulo de autenticación, el cliente está usando esa funcionalidad..."
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none resize-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-300 font-bold mb-1 block">
                  ⚡ Prioridad del sprint
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none"
                >
                  <option value="low">🟢 Baja - Exploratorio</option>
                  <option value="normal">🟡 Normal - Flujo estándar</option>
                  <option value="high">🔴 Alta - Crítico para el proyecto</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-gray-800 text-gray-300 text-[10px] font-bold rounded hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={12} /> Confirmar e Iniciar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}