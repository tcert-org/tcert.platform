import { useCallback, useEffect, useRef } from "react";

interface UseOptimizedAutosaveProps {
  selectedAnswers: Record<number, number>;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook personalizado para manejar autosave optimizado con debouncing
 * Guarda solo la respuesta que cambió, no todas las respuestas
 */
export function useOptimizedAutosave({
  selectedAnswers,
  debounceMs = 1000,
  enabled = true,
}: UseOptimizedAutosaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Record<number, number>>({});
  const pendingChangesRef = useRef<Record<number, number>>({});

  const saveChangesToServer = useCallback(async () => {
    try {
      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });
      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;
      if (!attemptId) return;

      // Solo enviar las respuestas que han cambiado
      const changesToSave = Object.entries(pendingChangesRef.current);
      if (changesToSave.length === 0) return;

      const payload = changesToSave.map(([questionId, selectedOptionId]) => ({
        exam_attempt_id: Number(attemptId),
        question_id: Number(questionId),
        selected_option_id: selectedOptionId,
      }));

      await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      // Actualizar referencias después del guardado exitoso
      changesToSave.forEach(([questionId, selectedOptionId]) => {
        lastSavedRef.current[Number(questionId)] = selectedOptionId;
      });
      pendingChangesRef.current = {};
    } catch {
      // Error silencioso en autosave
    }
  }, []);

  const debouncedSave = useCallback(() => {
    if (!enabled) return;

    // Detectar cambios específicos
    const currentAnswers = selectedAnswers;
    const lastSaved = lastSavedRef.current;

    let hasChanges = false;
    Object.entries(currentAnswers).forEach(([questionId, selectedOptionId]) => {
      const qId = Number(questionId);
      if (lastSaved[qId] !== selectedOptionId) {
        pendingChangesRef.current[qId] = selectedOptionId;
        hasChanges = true;
      }
    });

    if (!hasChanges) return;

    // Cancelar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      saveChangesToServer();
    }, debounceMs);
  }, [enabled, selectedAnswers, saveChangesToServer, debounceMs]);

  const forceSave = useCallback(async () => {
    // Cancelar cualquier save pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Guardar inmediatamente los cambios pendientes
    await saveChangesToServer();
  }, [saveChangesToServer]);

  // Trigger autosave cuando cambien las respuestas
  useEffect(() => {
    debouncedSave();
  }, [debouncedSave]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    forceSave,
    isEnabled: enabled,
  };
}
