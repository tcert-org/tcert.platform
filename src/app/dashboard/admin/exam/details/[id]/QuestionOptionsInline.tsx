"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";

type Option = {
  id: number;
  content: string;
  question_id: number;
  is_correct: boolean;
};

export default function QuestionOptionsInline({
  questionId,
  onClose,
}: {
  questionId: number;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [editCorrect, setEditCorrect] = useState<boolean>(false);
  const [updating, setUpdating] = useState(false);

  // Estados para crear nueva opción
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCorrect, setNewCorrect] = useState(false);

  // Validación de opción correcta
  const [validationError, setValidationError] = useState<string | null>(null);

  // Traer opciones
  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/exam/question/elections?question_id=${questionId}`
        );
        const result = await res.json();
        setOptions(result.data || []);
      } catch {
        setOptions([]);
      }
      setLoading(false);
    }
    fetchOptions();
  }, [questionId]);

  function hasAtLeastOneCorrect(opts: Option[]) {
    return opts.some((o) => o.is_correct);
  }

  // Eliminar opción
  async function handleDeleteOption(id: number) {
    if (!window.confirm("¿Seguro que quieres eliminar esta opción?")) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/exam/question/elections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const updated = options.filter((o) => o.id !== id);
        setOptions(updated);
        // Si eliminando se quedan todas incorrectas, marca error
        if (updated.length > 0 && !hasAtLeastOneCorrect(updated)) {
          setValidationError("Debe haber al menos una opción correcta.");
        } else {
          setValidationError(null);
        }
      }
    } finally {
      setUpdating(false);
    }
  }

  // Activar edición
  function handleEditOption(option: Option) {
    setEditId(option.id);
    setEditContent(option.content);
    setEditCorrect(option.is_correct);
    setValidationError(null);
  }

  // Guardar edición
  async function handleSaveEdit(id: number) {
    // Si desmarcando la correcta dejaría todas incorrectas, bloquea
    if (
      !editCorrect &&
      options.filter((o) => o.id !== id && o.is_correct).length === 0
    ) {
      setValidationError("Debe haber al menos una opción correcta.");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/exam/question/elections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          content: editContent,
          is_correct: editCorrect,
        }),
      });
      if (res.ok) {
        const updated = options.map((o) =>
          o.id === id
            ? { ...o, content: editContent, is_correct: editCorrect }
            : o
        );
        setOptions(updated);
        setEditId(null);
        setValidationError(null);
      }
    } finally {
      setUpdating(false);
    }
  }

  // Guardar nueva opción
  async function handleSaveNewOption() {
    if (!newContent.trim()) return;
    // Si NO hay opción correcta tras agregar, bloquea
    const simuladas = [
      ...options,
      {
        id: -1,
        content: newContent,
        question_id: questionId,
        is_correct: newCorrect,
      },
    ];
    if (!hasAtLeastOneCorrect(simuladas)) {
      setValidationError("Debe haber al menos una opción correcta.");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/exam/question/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          content: newContent,
          is_correct: newCorrect,
        }),
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setOptions((prev) => [...prev, result.data]);
        setAdding(false);
        setNewContent("");
        setNewCorrect(false);
        setValidationError(null);
      }
    } finally {
      setUpdating(false);
    }
  }

  // No permite cerrar si no hay una correcta
  function handleTryClose() {
    if (options.length > 0 && !hasAtLeastOneCorrect(options)) {
      setValidationError(
        "Debe haber al menos una opción correcta antes de cerrar."
      );
    } else {
      setValidationError(null);
      onClose();
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mt-3">
      <div className="font-semibold mb-2 text-sm text-gray-700 flex justify-between">
        Opciones de la pregunta ({options.length})
        <Button size="sm" variant="outline" onClick={handleTryClose}>
          Cerrar
        </Button>
      </div>

      {validationError && (
        <div className="mb-2 text-xs text-red-600 bg-red-100 border border-red-300 px-2 py-1 rounded">
          {validationError}
        </div>
      )}

      {/* Agregar nueva opción */}
      {adding ? (
        <div className="flex gap-2 items-center bg-blue-50 p-2 rounded mb-3">
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Texto de la opción"
            className="flex-1"
            maxLength={100}
          />
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={newCorrect}
              onChange={() => setNewCorrect((v) => !v)}
            />
            Correcta
          </label>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveNewOption}
            disabled={updating || !newContent.trim()}
          >
            <Save className="w-4 h-4 mr-1" /> Guardar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAdding(false);
              setValidationError(null);
            }}
            disabled={updating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mb-3 flex items-center gap-2 hover:bg-blue-50 border-blue-300"
          onClick={() => {
            setAdding(true);
            setValidationError(null);
          }}
        >
          <Plus className="w-4 h-4" /> Agregar opción
        </Button>
      )}

      {/* Lista de opciones */}
      {loading ? (
        <div className="text-center py-3">Cargando opciones...</div>
      ) : options.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded text-xs">
          No hay opciones para esta pregunta.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((o) =>
            editId === o.id ? (
              <div
                key={o.id}
                className="flex gap-2 items-center bg-gray-100 p-2 rounded shadow"
              >
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1"
                  maxLength={100}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={editCorrect}
                    onChange={() => setEditCorrect((v) => !v)}
                  />
                  Correcta
                </label>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleSaveEdit(o.id)}
                  disabled={updating || !editContent.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setValidationError(null);
                  }}
                  disabled={updating}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                key={o.id}
                className="flex gap-2 items-center bg-gray-100 p-2 rounded shadow"
              >
                <span className="flex-1 text-sm">{o.content}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full border ${
                    o.is_correct
                      ? "bg-green-200 text-green-800 border-green-400"
                      : "bg-red-100 text-red-600 border-red-300"
                  }`}
                >
                  {o.is_correct ? "Correcta" : "Incorrecta"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditOption(o)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleDeleteOption(o.id)}
                  disabled={updating}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
