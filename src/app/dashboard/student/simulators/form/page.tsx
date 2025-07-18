"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface Question {
  id: number;
  text: string;
}

interface Option {
  id: number;
  content: string;
}

export default function FormSimulador() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("simulatorId");

  const [examName, setExamName] = useState("Cargando título...");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = questions[currentIndex];

  // Traer nombre + preguntas
  useEffect(() => {
    async function fetchExamData() {
      if (!examId) {
        setExamName("ID del examen no proporcionado");
        return;
      }

      try {
        const [examRes, questionRes] = await Promise.all([
          fetch(`/api/exam/${examId}`),
          fetch(`/api/exam/question?exam_id=${examId}`),
        ]);

        if (!examRes.ok) throw new Error("Error al obtener el examen.");
        const examData = await examRes.json();
        setExamName(examData.name_exam || "Examen sin nombre");

        if (!questionRes.ok) throw new Error("Error al obtener preguntas.");
        const questionData = await questionRes.json();

        const parsedQuestions: Question[] = (questionData.data ?? []).map(
          (q: any) => ({
            id: q.id,
            text: q.content,
          })
        );

        setQuestions(parsedQuestions);
        setCurrentIndex(0);
        setSelectedOptions({});
      } catch (error) {
        setExamName("Error al cargar el examen");
        setQuestions([]);
        console.error(error);
      }
    }

    fetchExamData();
  }, [examId]);

  // Traer opciones por pregunta
  useEffect(() => {
    async function fetchOptions() {
      const current = questions[currentIndex];
      if (!current) return;

      setLoadingOptions(true);
      try {
        const res = await fetch(
          `/api/exam/question/elections?question_id=${current.id}`
        );
        const data = await res.json();
        setOptions(data.data ?? []);
      } catch (err) {
        console.error("Error al obtener opciones:", err);
        setOptions([]);
      }
      setLoadingOptions(false);
    }

    fetchOptions();
  }, [questions, currentIndex]);

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const isLast = currentIndex === questions.length - 1;

  if (!questions.length)
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
        <h2 style={{ textAlign: "center" }}>{examName}</h2>
        <p style={{ textAlign: "center", marginTop: 30 }}>
          No hay preguntas para mostrar.
        </p>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 0 }}>{examName}</h2>
      <div style={{ display: "flex", gap: 20, height: 450 }}>
        {/* Navegación lateral */}
        <div
          style={{
            width: 220,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            backgroundColor: "#fff",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: 15,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedOptions.hasOwnProperty(q.id);
            const bgColor = isCurrent || isAnswered ? "#213763" : "#bbdefb";
            const color = isCurrent || isAnswered ? "#fff" : "#0d47a1";
            return (
              <div
                key={q.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  borderRadius: 8,
                  backgroundColor: bgColor,
                  color,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Pregunta {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Pregunta actual */}
        <div
          style={{
            flexGrow: 1,
            minWidth: 480,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: 350,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>{currentQuestion.text}</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15,
              flexGrow: 1,
            }}
          >
            {loadingOptions ? (
              <p>Cargando opciones...</p>
            ) : options.length === 0 ? (
              <p>No hay opciones para esta pregunta.</p>
            ) : (
              options.map((opt, i) => {
                const isSelected = selectedOptions[currentQuestion.id] === i;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(i)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: isSelected
                        ? "2px solid #213763"
                        : "1px solid #ccc",
                      backgroundColor: isSelected ? "#e1e8f7" : "#fff",
                      textAlign: "left",
                      fontSize: 16,
                      boxShadow: isSelected
                        ? "0 0 8px rgba(33, 55, 99, 0.5)"
                        : "none",
                      cursor: "pointer",
                    }}
                  >
                    {opt.content}
                  </button>
                );
              })
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                backgroundColor: currentIndex === 0 ? "#ccc" : "#213763",
                color: "#fff",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              Atrás
            </button>
            {isLast ? (
              <button
                onClick={() => alert("Examen enviado! Gracias.")}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Enviar examen
              </button>
            ) : (
              <button
                onClick={goNext}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#213763",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
