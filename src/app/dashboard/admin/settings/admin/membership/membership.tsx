"use client";

import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign, Hash, Infinity } from "lucide-react";

const colorBar: Record<string, string> = {
  Bronce: "bg-gradient-to-r from-orange-400 to-orange-600",
  Plata: "bg-gradient-to-r from-gray-400 to-gray-600",
  Oro: "bg-gradient-to-r from-yellow-400 to-yellow-600",
  Diamante: "bg-gradient-to-r from-blue-400 to-blue-600",
};

const colorBadge: Record<string, string> = {
  Bronce: "bg-orange-500 text-white",
  Plata: "bg-gray-500 text-white",
  Oro: "bg-yellow-500 text-white",
  Diamante: "bg-blue-500 text-white",
};

const membershipIcons: Record<string, React.ReactNode> = {
  Bronce: <Crown className="h-4 w-4" />,
  Plata: <Crown className="h-4 w-4" />,
  Oro: <Crown className="h-4 w-4" />,
  Diamante: <Crown className="h-4 w-4" />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (
        m.name !== "Diamante" &&
        typeof m.count_up === "number" &&
        typeof m.count_from === "number" &&
        m.count_up <= m.count_from
      ) {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-center" theme="colored" />

      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b border-gray-200">
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Configuración de Membresías
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Configura los rangos y precios de cada nivel de membresía
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSaveAndAssign} className="space-y-6">
              <div className="grid gap-6">
                {memberships.map((membership, index) => (
                  <Card
                    key={membership.id}
                    className="overflow-hidden border-l-4 hover:shadow-md transition-shadow duration-200"
                    style={{
                      borderLeftColor:
                        membership.name === "Bronce"
                          ? "#f97316"
                          : membership.name === "Plata"
                          ? "#6b7280"
                          : membership.name === "Oro"
                          ? "#eab308"
                          : "#3b82f6",
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {membershipIcons[membership.name]}
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              colorBadge[membership.name]
                            }`}
                          >
                            {membership.name}
                          </span>
                        </div>
                        <div
                          className={`w-12 h-2 rounded-full ${
                            colorBar[membership.name]
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Campo Desde */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Desde
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={
                              membership.count_from === ""
                                ? ""
                                : membership.count_from
                            }
                            onChange={(e) =>
                              handleChange(index, "count_from", e.target.value)
                            }
                            disabled={index !== 0}
                            className={
                              index !== 0 ? "bg-gray-50 cursor-not-allowed" : ""
                            }
                            required
                          />
                          {index !== 0 && (
                            <p className="text-xs text-gray-500">
                              Se calcula automáticamente
                            </p>
                          )}
                        </div>

                        {/* Campo Hasta */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Hasta
                          </Label>
                          {membership.name === "Diamante" ? (
                            <div className="flex items-center justify-center h-10 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md">
                              <Infinity className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-blue-700 font-medium">
                                Ilimitado
                              </span>
                            </div>
                          ) : (
                            <Input
                              type="number"
                              min={1}
                              value={
                                membership.count_up === ""
                                  ? ""
                                  : membership.count_up
                              }
                              onChange={(e) =>
                                handleChange(index, "count_up", e.target.value)
                              }
                              required
                            />
                          )}
                        </div>

                        {/* Campo Precio */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Precio
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            step="0.01"
                            value={
                              membership.price === "" ? "" : membership.price
                            }
                            onChange={(e) =>
                              handleChange(index, "price", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Información del rango */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <strong>Rango:</strong>{" "}
                          {membership.count_from === ""
                            ? "..."
                            : membership.count_from}{" "}
                          -{" "}
                          {membership.name === "Diamante"
                            ? "∞"
                            : membership.count_up === ""
                            ? "..."
                            : membership.count_up}{" "}
                          vouchers
                          {membership.price !== "" && (
                            <span className="ml-3">
                              <strong>Precio:</strong> ${membership.price}
                            </span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Guardar y Asignar Membresías
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MembershipForm;
