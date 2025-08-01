"use client";

import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        toast.error("Error al cargar membresías.");
      }
    }
    fetchMemberships();
  }, []);

  useEffect(() => {
    if (memberships.length === 0) return;

    const updated: Membership[] = memberships.map((m, i) => {
      if (i === 0) return m;
      const prev = memberships[i - 1];
      const prevCountUp =
        typeof prev.count_up === "number" ? prev.count_up : null;

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
        m.price === "" ||
        m.count_from <= 0 ||
        m.price <= 0 ||
        (m.name !== "Diamante" && (m.count_up === "" || m.count_up <= 0))
      ) {
        toast.warning(`Completa correctamente los valores en ${m.name}.`);
        setLoading(false);
        return;
      }

      if (m.name !== "Diamante" && m.count_up <= (m.count_from as number)) {
        toast.warning(`'Hasta' debe ser mayor que 'Desde' en ${m.name}.`);
        setLoading(false);
        return;
      }

      if (
        prev &&
        typeof prev.count_up === "number" &&
        typeof m.count_from === "number" &&
        m.count_from <= prev.count_up
      ) {
        toast.warning(
          `La membresía ${m.name} debe empezar justo después de ${prev.name}.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      for (const membership of memberships) {
        const payload: any = {
          id: membership.id,
          count_from: membership.count_from,
          price: membership.price,
          count_up:
            membership.name === "Diamante" ? 99999999 : membership.count_up,
        };

        await fetch("/api/membership", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const res = await fetch("/api/membership", { method: "POST" });
      const json = await res.json();
      toast.success(json.message || "Membresías actualizadas correctamente.");
    } catch (error) {
      console.error("Error al guardar o asignar:", error);
      toast.error("Ocurrió un error al guardar las membresías.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" theme="colored" />
      <form
        onSubmit={handleSaveAndAssign}
        className="space-y-4 w-full max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Configuración de Membresías
        </h2>

        {memberships.map((membership, index) => (
          <div
            key={membership.id}
            className="relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full h-auto min-h-[100px]"
          >
            <div className={`${colorBar[membership.name]} w-2 h-full`} />

            <div className="relative flex-1 px-6 py-3 flex flex-wrap items-center gap-6">
              <div className="w-[100px] text-right absolute top-3 right-4">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium text-white ${
                    colorBar[membership.name]
                  }`}
                >
                  {membership.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 w-full sm:flex-nowrap sm:gap-6 mt-2 sm:mt-0">
                <div className="w-full min-w-[160px] max-w-[220px] flex-1">
                  <label className="text-xs font-medium text-gray-600 block mb-1 h-[18px] leading-none">
                    Desde
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={
                      membership.count_from === "" ? "" : membership.count_from
                    }
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

                <div className="w-full min-w-[160px] max-w-[220px] flex-1">
                  <label className="text-xs font-medium text-gray-600 block mb-1 h-[18px] leading-none">
                    Hasta
                  </label>
                  {membership.name === "Diamante" ? (
                    <div className="w-full bg-gray-100 text-center text-gray-700 border border-gray-300 rounded px-3 py-[7px] h-[36px] text-sm flex items-center justify-center">
                      ∞
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      value={
                        membership.count_up === "" ? "" : membership.count_up
                      }
                      onChange={(e) =>
                        handleChange(index, "count_up", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-1 h-[36px] text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                  )}
                </div>

                <div className="w-full min-w-[160px] max-w-[220px] flex-1">
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
    </>
  );
}

export default MembershipForm;
