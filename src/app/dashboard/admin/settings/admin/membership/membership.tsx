"use client";
import React, { useEffect, useState } from "react";

const colorBar: Record<string, string> = {
  Bronce: "bg-yellow-700",
  Plata: "bg-gray-500",
  Oro: "bg-amber-500",
  Diamante: "bg-blue-500",
};

type Membership = {
  id: number;
  name: string;
  count_from: number | "";
  count_up: number | "";
  price: number | "";
};

function MembershipForm() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMemberships() {
      try {
        const res = await fetch("/api/membership");
        const json = await res.json();
        setMemberships(json.data);
      } catch (error) {
        console.error("Error al cargar membresías:", error);
      }
    }
    fetchMemberships();
  }, []);

  // Ajuste automático de "count_from"
  useEffect(() => {
    if (memberships.length === 0) return;

    const updated: Membership[] = memberships.map((m, i) => {
      if (i === 0) return m;
      const prev = memberships[i - 1];
      const prevCountUp = typeof prev.count_up === "number" ? prev.count_up : null;

      return {
        ...m,
        count_from: prevCountUp !== null ? prevCountUp + 1 : "",
      };
    });

    setMemberships(updated);
  }, [memberships.map((m) => m.count_up).join(",")]);

  const handleChange = (
    index: number,
    field: "count_up" | "price" | "count_from",
    value: string
  ) => {
    const numericValue = value === "" ? "" : Number(value);
    const updated = [...memberships];
    updated[index] = {
      ...updated[index],
      [field]: numericValue,
    };
    setMemberships(updated);
  };

  const handleSaveAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    for (let i = 0; i < memberships.length; i++) {
      const m = memberships[i];
      const prev = memberships[i - 1];

      if (
        m.count_from === "" ||
        m.count_up === "" ||
        m.price === "" ||
        m.count_from <= 0 ||
        m.count_up <= 0 ||
        m.price <= 0
      ) {
        alert(`Todos los valores deben ser mayores a 0 (revisa ${m.name}).`);
        setLoading(false);
        return;
      }

      if (m.count_up <= m.count_from) {
        alert(`'Hasta' debe ser mayor que 'Desde' en la membresía ${m.name}.`);
        setLoading(false);
        return;
      }

      if (
        prev &&
        typeof prev.count_up === "number" &&
        typeof m.count_from === "number" &&
        m.count_from <= prev.count_up
      ) {
        alert(`La membresía ${m.name} debe comenzar justo después de ${prev.name}.`);
        setLoading(false);
        return;
      }
    }

    try {
      // 1. Guardar membresías
      for (const membership of memberships) {
        await fetch("/api/membership", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: membership.id,
            count_from: membership.count_from,
            count_up: membership.count_up,
            price: membership.price,
          }),
        });
      }

      // 2. Asignar membresías automáticamente
      const res = await fetch("/api/membership", { method: "POST" });
      const json = await res.json();
      alert(json.message || "Membresías actualizadas y asignadas correctamente.");
    } catch (error) {
      console.error("Error al guardar o asignar:", error);
      alert("Ocurrió un error al guardar o asignar membresías.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveAndAssign} className="space-y-4 w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Configuración de Membresías
      </h2>

      {memberships.map((membership, index) => (
        <div
          key={membership.id}
          className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full h-[100px]"
        >
          <div className={`${colorBar[membership.name]} w-2 h-full`} />
          <div className="flex-1 px-6 py-3 flex items-center justify-between gap-6">
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium text-white ${colorBar[membership.name]}`}
            >
              {membership.name}
            </span>
            <div className="flex gap-4 flex-1 justify-end">
              {/* Desde */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1 h-[18px] leading-none">
                  Desde
                </label>
                <input
                  type="number"
                  min={1}
                  value={membership.count_from === "" ? "" : membership.count_from}
                  onChange={(e) =>
                    handleChange(index, "count_from", e.target.value)
                  }
                  disabled={index !== 0}
                  className={`w-full border border-gray-300 rounded px-3 py-1 h-[36px] text-sm focus:outline-none focus:ring focus:ring-blue-200 ${
                    index !== 0 ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                />
              </div>

              {/* Hasta */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1 h-[18px] leading-none">
                  Hasta
                </label>
                <input
                  type="number"
                  min={1}
                  value={membership.count_up === "" ? "" : membership.count_up}
                  onChange={(e) =>
                    handleChange(index, "count_up", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1 h-[36px] text-sm focus:outline-none focus:ring focus:ring-blue-200"
                  required
                />
              </div>

              {/* Precio */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1 h-[18px] leading-none">
                  Precio
                </label>
                <input
                  type="number"
                  min={1}
                  value={membership.price === "" ? "" : membership.price}
                  onChange={(e) =>
                    handleChange(index, "price", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1 h-[36px] text-sm focus:outline-none focus:ring focus:ring-blue-200"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Botón combinado */}
      <div className="text-center mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Procesando..." : "Guardar y Asignar Membresías"}
        </button>
      </div>
    </form>
  );
}

export default MembershipForm;
