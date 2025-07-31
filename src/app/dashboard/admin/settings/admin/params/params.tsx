"use client";
import React, { useEffect, useState } from "react";

type ParamRecord = {
  id: number;
  name: string;
  value: number;
};

function ParamsPage() {
  const [params, setParams] = useState<ParamRecord[]>([]);
  const [formData, setFormData] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const res = await fetch("/api/params");
        const json = await res.json();
        const values = json.data;

        const data: Record<number, number> = {};
        values.forEach((item: ParamRecord) => {
          data[item.id] = item.value;
        });

        setParams(values);
        setFormData(data);
      } catch (error) {
        console.error("Error al cargar parámetros:", error);
      }
    };

    fetchParams();
  }, []);

  const handleChange = (id: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      for (const id in formData) {
        await fetch("/api/params", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: Number(id),
            value: formData[Number(id)],
          }),
        });
      }

      alert("Parámetros guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar parámetros:", error);
      alert("Error al guardar parámetros.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Parámetros del sistema
      </h2>

      <div className="space-y-4">
        {params.map((param) => (
          <div key={param.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.name}
            </label>
            <input
              type="number"
              min={param.name.toLowerCase().includes("precio") ? 0 : 1}
              step={param.name.toLowerCase().includes("precio") ? 0.01 : 1}
              value={formData[param.id] ?? ""}
              onChange={(e) => handleChange(param.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

export default ParamsPage;
