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
        setOptions((prev) => prev.filter((o) => o.id !== id));
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
  }

  // Guardar edición
  async function handleSaveEdit(id: number) {
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
        setOptions((prev) =>
          prev.map((o) =>
            o.id === id
              ? { ...o, content: editContent, is_correct: editCorrect }
              : o
          )
        );
        setEditId(null);
      }
    } finally {
      setUpdating(false);
    }
  }

  // Guardar nueva opción
  async function handleSaveNewOption() {
    if (!newContent.trim()) return;
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
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mt-3">
      <div className="font-semibold mb-2 text-sm text-gray-700 flex justify-between">
        Opciones de la pregunta
        <Button size="sm" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
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
            onClick={() => setAdding(false)}
            disabled={updating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mb-3"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Agregar opción
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
                  onClick={() => setEditId(null)}
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
