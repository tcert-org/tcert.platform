"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Banknote,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "@/stores/user-store";

const membershipColor: Record<string, string> = {
  Bronce: "bg-yellow-700 text-white",
  Plata: "bg-gray-500 text-white",
  Oro: "bg-amber-500 text-white",
  Diamante: "bg-blue-500 text-white",
};

export default function AssignVoucherForm() {
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const { getUser } = useUserStore();

  const [membershipName, setMembershipName] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRegistered = useRef(false);

  // Función para obtener datos frescos del partner directamente de la API
  const fetchFreshPartnerData = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/partners?id=${partnerId}`, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error("Error al obtener datos frescos del partner:", err);
      return null;
    }
  };

  // Cargar membresía al inicio usando la API directamente (sin session storage)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await getUser();
        if (user?.id) {
          const freshData = await fetchFreshPartnerData(String(user.id));
          if (
            freshData?.membership_name &&
            freshData.membership_name !== "Sin asignar"
          ) {
            setMembershipName(freshData.membership_name);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    loadInitialData();
  }, [getUser]);

  useEffect(() => {
    const fetchPrice = async () => {
      const user = await getUser();
      const qty = Number(quantity);
      if (!user?.id || !qty || qty < 1) return;

      setPriceLoading(true);

      // Obtener membresía fresca de la API en lugar del user store
      const freshData = await fetchFreshPartnerData(String(user.id));

      // Buscar el membership_id basado en el nombre de la membresía fresca
      if (!freshData) {
        setPriceLoading(false);
        return;
      }

      try {
        // Obtener todas las membresías para encontrar el ID por nombre
        const membershipRes = await fetch("/api/membership");
        const membershipJson = await membershipRes.json();
        const membershipList = Array.isArray(membershipJson.data)
          ? membershipJson.data
          : [];
        const membership = membershipList.find(
          (m: any) => m.name === freshData.membership_name
        );

        if (!membership?.id) {
          setPriceLoading(false);
          return;
        }

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: Number(quantity),
            membership_id: membership.id,
            onlyPrice: true,
          }),
        });

        const data = await res.json();
        if (typeof data.unit_price === "number") {
          setUnitPrice(data.unit_price);
        }
      } catch (error) {
        console.error("Error al obtener precio:", error);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [quantity, getUser]);

  useEffect(() => {
    const registerVouchers = async () => {
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      const alreadyRegistered = sessionStorage.getItem("vouchers_registered");

      if (
        success === "true" &&
        alreadyRegistered !== "true" &&
        !hasRegistered.current
      ) {
        hasRegistered.current = true;

        const quantityFromStorage = Number(
          sessionStorage.getItem("last_quantity") || "1"
        );
        setQuantity(String(quantityFromStorage));

        // Removido el uso del session storage para unit_price
        // const storedUnitPrice = Number(sessionStorage.getItem("unit_price") || "0");

        const user = await getUser();
        const partnerId = String(user?.id);
        if (!partnerId || !user?.id) return;

        // Obtener precio actual basado en la membresía fresca de la API
        let currentUnitPrice = unitPrice; // Usar el precio que ya tenemos en estado
        if (!currentUnitPrice) {
          try {
            // Obtener membresía fresca
            const freshData = await fetchFreshPartnerData(String(user.id));
            if (freshData?.membership_name) {
              // Obtener ID de membresía
              const membershipRes = await fetch("/api/membership");
              const membershipJson = await membershipRes.json();
              const membershipList = Array.isArray(membershipJson.data)
                ? membershipJson.data
                : [];
              const membership = membershipList.find(
                (m: any) => m.name === freshData.membership_name
              );

              if (membership?.id) {
                const priceRes = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    quantity: quantityFromStorage,
                    membership_id: membership.id,
                    onlyPrice: true,
                  }),
                });
                const priceData = await priceRes.json();
                if (typeof priceData.unit_price === "number") {
                  currentUnitPrice = priceData.unit_price;
                  setUnitPrice(currentUnitPrice);
                }
              }
            }
          } catch (error) {
            console.error("Error al obtener precio actual:", error);
            currentUnitPrice = 0;
          }
        }

        try {
          const res = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partner_id: partnerId,
              admin_id: null,
              voucher_quantity: quantityFromStorage,
              unit_price: currentUnitPrice || 0,
              total_price: quantityFromStorage * (currentUnitPrice || 0),
              files: "stripe_payment",
              membership_id: null, // No usamos el viejo ID
            }),
          });

          if (!res.ok) throw new Error("Error al registrar los vouchers");

          const json = await res.json();
          const newMembershipId = json?.data?.new_membership_id;

          // Mostrar modal inmediatamente después del pago exitoso
          setShowSuccessModal(true);
          toast.success("Vouchers asignados exitosamente.");

          // Hacer actualizaciones en background (sin bloquear el modal)
          (async () => {
            try {
              // Espera reducida para que la DB se actualice
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Obtener datos frescos del partner directamente de la API
              const user = await getUser();
              const freshPartnerData = await fetchFreshPartnerData(
                String(user?.id)
              );

              if (freshPartnerData) {
                // Actualizar la membresía mostrada usando el nombre directo de la API
                if (
                  freshPartnerData.membership_name &&
                  freshPartnerData.membership_name !== "Sin asignar"
                ) {
                  setMembershipName(freshPartnerData.membership_name);
                }

                // Forzar actualización del precio con la nueva membresía del response del pago
                if (newMembershipId) {
                  try {
                    const priceRes = await fetch("/api/checkout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                      },
                      body: JSON.stringify({
                        quantity: quantityFromStorage,
                        membership_id: newMembershipId,
                        onlyPrice: true,
                      }),
                    });
                    const priceData = await priceRes.json();
                    if (typeof priceData.unit_price === "number") {
                      setUnitPrice(priceData.unit_price);
                    }
                  } catch (error) {
                    console.error(
                      "Error al actualizar precio con nueva membresía:",
                      error
                    );
                  }
                }
              } else {
                // No se pudieron obtener datos frescos del partner
              }
            } catch (error) {
              console.error("Error en actualización background:", error);
            }
          })();

          // Limpiar session storage
          sessionStorage.removeItem("last_quantity");
          sessionStorage.setItem("vouchers_registered", "true");
        } catch (error) {
          console.error("Error en /api/payments:", error);
          toast.error("Error al asignar los vouchers.");
        }
        return;
      }

      if (canceled === "true") {
        toast.error("El pago fue cancelado.");
        setShowErrorModal(true);
      }
    };

    registerVouchers();
  }, [searchParams, getUser, unitPrice]);

  const handlePay = async () => {
    if (Number(quantity) < 1) {
      toast.error("La cantidad debe ser mayor a cero.");
      return;
    }

    try {
      const user = await getUser();
      if (!user?.id) {
        toast.error("No se encontró el usuario.");
        return;
      }

      // Obtener membresía fresca de la API
      const freshData = await fetchFreshPartnerData(String(user.id));
      if (!freshData?.membership_name) {
        toast.error("No se encontró la membresía.");
        return;
      }

      // Obtener el ID de la membresía
      const membershipRes = await fetch("/api/membership");
      const membershipJson = await membershipRes.json();
      const membershipList = Array.isArray(membershipJson.data)
        ? membershipJson.data
        : [];
      const membership = membershipList.find(
        (m: any) => m.name === freshData.membership_name
      );

      if (!membership?.id) {
        toast.error("No se pudo obtener la información de la membresía.");
        return;
      }

      setLoading(true);
      sessionStorage.setItem("last_quantity", String(quantity));
      sessionStorage.removeItem("vouchers_registered");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, membership_id: membership.id }),
      });

      const data = await res.json();
      if (data.url) {
        if (typeof data.unit_price === "number") {
          setUnitPrice(data.unit_price);
        }
        window.location.href = data.url;
      } else {
        toast.error("No se pudo redirigir al pago.");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Error al conectar con Stripe");
      console.error(err);
      setLoading(false);
    }
  };

  const total = useMemo(() => {
    const qty = Number(quantity);
    if (unitPrice == null || !qty || qty < 1) return null;
    return qty * unitPrice;
  }, [quantity, unitPrice]);

  const badgeClass =
    membershipName && membershipColor[membershipName]
      ? membershipColor[membershipName]
      : "bg-gray-300 text-gray-800";

  return (
    <>
      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          // Solo permitir cerrar el modal a través de los botones (no hacer nada aquí)
          // Los botones manejan el cierre manualmente
        }}
      >
        <DialogContent className="max-w-lg bg-white border-0 shadow-2xl shadow-purple-500/25 rounded-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-6 -m-6 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-1">
                  ¡Pago Exitoso!
                </DialogTitle>
                <p className="text-purple-100 text-sm">
                  Tu transacción fue procesada correctamente
                </p>
              </div>
              <div className="ml-auto">
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-6 px-6 pb-6">
            {/* Información principal */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full border border-purple-200">
                <Banknote className="h-5 w-5 text-purple-700" />
                <span className="font-semibold text-purple-800">
                  {quantity} voucher{Number(quantity) > 1 ? "s" : ""} adquirido
                  {Number(quantity) > 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-gray-600 text-lg">
                ¡Gracias por tu compra! Tus vouchers están listos para usar.
              </p>
            </div>

            {/* Información de membresía */}
            {membershipName && membershipName !== "Sin asignar" && (
              <div className="bg-gradient-to-r from-slate-50 to-purple-50/50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Tu membresía actual
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {membershipName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}
                  >
                    Activa
                  </span>
                </div>
              </div>
            )}

            {/* Mensaje de confirmación */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">
                    Proceso completado
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Tu compra se ha procesado exitosamente. ¿Qué te gustaría
                    hacer ahora?
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setQuantity("1");
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Banknote className="h-5 w-5" />
                Comprar más vouchers
              </button>
              <button
                onClick={() => {
                  router.push("/dashboard/partner");
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-gray-500/25"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showErrorModal}
        onOpenChange={() => {
          // Solo permitir cerrar el modal a través del botón (no hacer nada aquí)
        }}
      >
        <DialogContent className="max-w-lg bg-white border-0 shadow-2xl shadow-red-500/25 rounded-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-br from-red-500 via-rose-500 to-red-600 p-6 -m-6 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-1">
                  Pago Cancelado
                </DialogTitle>
                <p className="text-red-100 text-sm">
                  La transacción no pudo completarse
                </p>
              </div>
              <div className="ml-auto">
                <AlertTriangle className="h-6 w-6 text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-6 px-6 pb-6">
            {/* Información principal */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-rose-100 rounded-full border border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">
                  Proceso interrumpido
                </span>
              </div>

              <p className="text-gray-600 text-lg">
                El proceso de pago fue cancelado antes de completarse.
              </p>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800">No te preocupes</p>
                  <p className="text-sm text-orange-700 mt-1">
                    No se realizó ningún cargo a tu tarjeta. Puedes intentar
                    nuevamente cuando desees.
                  </p>
                </div>
              </div>
            </div>

            {/* Sugerencias */}
            <div className="bg-gradient-to-r from-slate-50 to-purple-50/50 rounded-xl p-4 border border-slate-200">
              <div className="space-y-3">
                <p className="font-medium text-gray-800 text-sm">
                  Sugerencias para tu próximo intento:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    Verifica que tu tarjeta tenga fondos suficientes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    Asegúrate de tener una conexión estable
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    Intenta con un método de pago diferente
                  </li>
                </ul>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header mejorado */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
                  <Banknote className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                    Comprar Vouchers
                  </h1>
                </div>
              </div>
              {membershipName && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass} shadow-sm`}
                >
                  {membershipName}
                </span>
              )}
            </div>

            {/* Descripción detallada */}
            <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200/80 rounded-lg p-4 border border-orange-300/60 shadow-lg shadow-orange-200/40">
              <p className="text-sm text-gray-700 leading-relaxed">
                El precio por unidad se calcula según tu membresía actual
                {membershipName ? ` (${membershipName})` : ""}. Si tu membresía
                cambia durante la compra, el precio puede variar. Los vouchers
                se procesarán inmediatamente después del pago exitoso.
              </p>
            </div>
          </div>

          {/* Contenedor del formulario */}
          <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="quantity"
                    className="text-lg font-medium text-gray-800"
                  >
                    Cantidad de vouchers
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Permitir vacío, solo números positivos
                      if (val === "" || /^[0-9]+$/.test(val)) {
                        setQuantity(val);
                      }
                    }}
                    className="text-lg py-3 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

                {/* Información de precios con diseño mejorado */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-lg p-6 border border-gray-200/50 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Resumen de compra
                  </h3>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-gray-700 font-medium">
                      Precio por unidad:
                    </span>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50">
                        USD {unitPrice !== null ? unitPrice.toFixed(2) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">
                      Total a pagar:
                    </span>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50 shadow-sm">
                        USD{" "}
                        {unitPrice !== null && total !== null
                          ? total.toFixed(2)
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                    <span>Cantidad seleccionada:</span>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
                        {quantity && Number(quantity) > 0
                          ? `${quantity} voucher${
                              Number(quantity) > 1 ? "s" : ""
                            }`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={loading || priceLoading}
                  className="w-full text-lg py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Banknote className="text-[24px] mr-3 shrink-0" />
                  {loading
                    ? "Procesando..."
                    : priceLoading
                    ? "Cargando precios..."
                    : `Pagar ${
                        quantity && Number(quantity) > 0
                          ? `${quantity} voucher${
                              Number(quantity) > 1 ? "s" : ""
                            }`
                          : ""
                      }`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
