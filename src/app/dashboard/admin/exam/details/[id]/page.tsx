"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Pencil } from "lucide-react";
import QuestionOptionsInline from "@/app/dashboard/admin/exam/details/[id]/QuestionOptionsInline";

type Question = {
  id: number;
  content: string;
  exam_id: number;
  active: boolean;
};

export default function ExamDetailsPage() {
  const params = useParams();
  const examId = params.id as string;
  const [examName, setExamName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Edición de nombre del examen
  const [editingName, setEditingName] = useState(false);
  const [newExamName, setNewExamName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showOptionsFor, setShowOptionsFor] = useState<number | null>(null);
  
  // Edición de preguntas
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Filtros locales
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchExamName() {
      try {
        const res = await fetch(`/api/exam/${examId}`);
        const exam = await res.json();
        setExamName(exam.name_exam || "Examen");
      } catch {
        setExamName("Examen");
      }
    }
    if (examId) fetchExamName();
  }, [examId]);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exam/question?exam_id=${examId}`);
        const result = await res.json();
        setQuestions(result.data || []);
      } catch (e) {
        setQuestions([]);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [examId]);

  async function handleToggleActive(id: number, currentActive: boolean) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/exam/question`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Error");
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, active: !currentActive } : q))
      );
    } catch (e) {
      alert("No se pudo actualizar el estado.");
    }
    setUpdatingId(null);
  }

  // Cambio de nombre del examen
  async function handleSaveName() {
    setSavingName(true);
    try {
      const res = await fetch(`/api/exam/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_exam: newExamName }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Error");
      setExamName(newExamName);
      setEditingName(false);
    } catch (e) {
      alert("No se pudo actualizar el nombre.");
    }
    setSavingName(false);
  }

  // Edición de preguntas
  async function handleSaveQuestion(questionId: number) {
    setSavingQuestion(true);
    try {
      const res = await fetch(`/api/exam/question`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, content: newQuestionContent }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Error");
      
      // Actualizar la pregunta en el estado local
      setQuestions((prev) =>
        prev.map((q) => 
          q.id === questionId ? { ...q, content: newQuestionContent } : q
        )
      );
      setEditingQuestion(null);
      setNewQuestionContent("");
    } catch (e) {
      alert("No se pudo actualizar la pregunta.");
    }
    setSavingQuestion(false);
  }

  function startEditingQuestion(questionId: number, currentContent: string) {
    setEditingQuestion(questionId);
    setNewQuestionContent(currentContent);
    setShowOptionsFor(null); // Cerrar opciones si están abiertas
  }

  function cancelEditingQuestion() {
    setEditingQuestion(null);
    setNewQuestionContent("");
  }

  // -- FILTRADO Y BUSQUEDA --
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) =>
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? q.active
          : !q.active
      )
      .filter((q) => q.content.toLowerCase().includes(search.toLowerCase()));
  }, [questions, filterActive, search]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-2">
        {editingName ? (
          <>
            <Input
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
              className="text-2xl font-bold"
              maxLength={80}
            />
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveName}
              disabled={savingName || newExamName.trim() === ""}
            >
              {savingName ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingName(false)}
              disabled={savingName}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{examName}</h1>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingName(true);
                setNewExamName(examName);
              }}
            >
              <Pencil className="w-4 h-4 bg" />
            </Button>
          </>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-gray-500 text-base">Preguntas del Examen</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            Activas: {questions.filter(q => q.active).length}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
            Total: {questions.length}
          </span>
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <Input
          placeholder="Buscar pregunta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/2"
        />
        <Select
          value={filterActive}
          onValueChange={(v) => setFilterActive(v as any)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
          </SelectContent>
        </Select>
        <Link href={`/dashboard/admin/exam/details/${examId}/form`}>
          <Button className="md:ml-4" size="sm">
            Crear pregunta
          </Button>
        </Link>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8">Cargando preguntas...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded text-sm">
          No hay preguntas para mostrar con los filtros aplicados.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col gap-2 bg-gray-100 border border-gray-300 px-6 py-4 rounded-lg shadow-sm mb-3"
            >
              <div className="flex items-center gap-3">
                {editingQuestion === q.id ? (
                  <>
                    <Input
                      value={newQuestionContent}
                      onChange={(e) => setNewQuestionContent(e.target.value)}
                      className="flex-1"
                      placeholder="Contenido de la pregunta"
                    />
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleSaveQuestion(q.id)}
                      disabled={savingQuestion || newQuestionContent.trim() === ""}
                    >
                      {savingQuestion ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingQuestion}
                      disabled={savingQuestion}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-base font-medium flex-1">
                      {q.content}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        q.active
                          ? "bg-green-200 text-green-800 border border-green-400"
                          : "bg-red-200 text-red-600 border border-red-300"
                      }`}
                    >
                      {q.active ? "Activo" : "Inactivo"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditingQuestion(q.id, q.content)}
                      disabled={editingQuestion !== null || showOptionsFor === q.id}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className={
                        q.active
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }
                      disabled={updatingId === q.id || editingQuestion !== null}
                      onClick={() => handleToggleActive(q.id, q.active)}
                    >
                      {updatingId === q.id
                        ? "Actualizando..."
                        : q.active
                        ? "Desactivar"
                        : "Activar"}
                    </Button>
                    {/* Cambia el botón Editar por Opciones */}
                    <Button
                      size="sm"
                      variant={showOptionsFor === q.id ? "default" : "outline"}
                      onClick={() =>
                        setShowOptionsFor((prev) => (prev === q.id ? null : q.id))
                      }
                      disabled={editingQuestion !== null}
                    >
                      {showOptionsFor === q.id ? "Cerrar opciones" : "Opciones"}
                    </Button>
                  </>
                )}
              </div>
              {/* Panel de opciones embebido */}
              {showOptionsFor === q.id && editingQuestion === null && (
                <QuestionOptionsInline
                  questionId={q.id}
                  onClose={() => setShowOptionsFor(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
