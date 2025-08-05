"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "@/stores/user-store";

type MembershipRow = {
  id: number;
  name: "Bronce" | "Plata" | "Oro" | "Diamante" | string;
  price: number;
  count_from: number;
  count_up: number;
};

const membershipColor: Record<string, string> = {
  Bronce: "bg-yellow-700 text-white",
  Plata: "bg-gray-500 text-white",
  Oro: "bg-amber-500 text-white",
  Diamante: "bg-blue-500 text-white",
};

export default function AssignVoucherForm() {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { getUser, refreshUser } = useUserStore();

  const [membershipName, setMembershipName] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const searchParams = useSearchParams();
  const hasRegistered = useRef(false);

  const fetchMembershipName = async (membership_id: number | null) => {
    if (!membership_id) {
      setMembershipName(null);
      return;
    }

    try {
      const res = await fetch("/api/membership");
      const json = await res.json();
      const list: MembershipRow[] = Array.isArray(json.data) ? json.data : [];
      const found = list.find((m) => m.id === Number(membership_id));
      setMembershipName(found?.name ?? null);
    } catch (err) {
      console.error("❌ Error al obtener la membresía:", err);
      setMembershipName(null);
    }
  };

  // Mostrar membresía al cargar
  useEffect(() => {
    getUser().then((user) => {
      fetchMembershipName(user?.membership_id ?? null);
    });
  }, [getUser]);

  useEffect(() => {
    const fetchPrice = async () => {
      const user = await getUser();
      const membership_id = user?.membership_id;
      if (!membership_id || quantity < 1) return;

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity, membership_id, onlyPrice: true }),
        });

        const data = await res.json();
        if (typeof data.unit_price === "number") {
          setUnitPrice(data.unit_price);
          sessionStorage.setItem("unit_price", String(data.unit_price));
        }
      } catch (error) {
        console.error("Error al obtener precio:", error);
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
        setQuantity(quantityFromStorage);

        const storedUnitPrice = Number(
          sessionStorage.getItem("unit_price") || "0"
        );

        const user = await getUser();
        const partnerId = String(user?.id);
        if (!partnerId) return;

        try {
          const res = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partner_id: partnerId,
              admin_id: null,
              voucher_quantity: quantityFromStorage,
              unit_price: storedUnitPrice,
              total_price: quantityFromStorage * storedUnitPrice,
              files: "stripe_payment",
              membership_id: null, // ❌ no usamos el viejo ID
            }),
          });

          if (!res.ok) throw new Error("Error al registrar los vouchers");

          const json = await res.json();
          const newMembershipId = json?.data?.new_membership_id;

          await refreshUser(); // 🔁 actualiza el usuario cacheado
          await fetchMembershipName(Number(newMembershipId) || null);

          sessionStorage.setItem("vouchers_registered", "true");
          sessionStorage.removeItem("last_quantity");
          sessionStorage.removeItem("unit_price");
          setShowSuccessModal(true);
          toast.success("Vouchers asignados exitosamente.");

          setTimeout(() => {
            window.location.href = "/dashboard/partner/buy-vouchers";
          }, 2000);
        } catch (error) {
          console.error("❌ Error en /api/payments:", error);
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
  }, [searchParams, getUser, refreshUser]);

  const handlePay = async () => {
    if (quantity < 1) {
      toast.error("La cantidad debe ser mayor a cero.");
      return;
    }

    try {
      const user = await getUser();
      const membership_id = user?.membership_id;
      if (!membership_id) {
        toast.error("No se encontró la membresía.");
        return;
      }

      setLoading(true);
      sessionStorage.setItem("last_quantity", String(quantity));
      sessionStorage.removeItem("vouchers_registered");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, membership_id }),
      });

      const data = await res.json();
      if (data.url) {
        if (typeof data.unit_price === "number") {
          sessionStorage.setItem("unit_price", String(data.unit_price));
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
    if (unitPrice == null) return 0;
    return quantity * unitPrice;
  }, [quantity, unitPrice]);

  const badgeClass =
    membershipName && membershipColor[membershipName]
      ? membershipColor[membershipName]
      : "bg-gray-300 text-gray-800";

  return (
    <>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 border-green-200/50 shadow-lg shadow-green-100/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent">
              ✅ Pago exitoso
            </DialogTitle>
          </DialogHeader>
          <div className="text-gray-800 space-y-3">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-300/50">
              <p className="text-green-800">
                Tu compra de{" "}
                <strong className="text-green-900">{quantity}</strong>{" "}
                voucher(s) fue procesada exitosamente.
              </p>
              <p className="mt-2 text-green-700">¡Gracias por tu pago! 🎉</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-red-50/30 to-rose-50/30 border-red-200/50 shadow-lg shadow-red-100/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-700 via-rose-600 to-red-800 bg-clip-text text-transparent">
              ❌ Pago cancelado
            </DialogTitle>
          </DialogHeader>
          <div className="text-gray-800">
            <div className="bg-gradient-to-r from-red-100 to-rose-100 rounded-lg p-4 border border-red-300/50">
              <p className="text-red-800">El proceso de pago fue cancelado.</p>
              <p className="mt-2 text-red-700 text-sm">
                Puedes intentar nuevamente cuando desees.
              </p>
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
                  <p className="text-lg text-gray-600 mt-1">
                    Adquiere vouchers según tu membresía actual
                  </p>
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
                    onChange={(e) => setQuantity(Number(e.target.value))}
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50 shadow-sm">
                        USD {unitPrice !== null ? total.toFixed(2) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                    <span>Cantidad seleccionada:</span>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
                        {quantity} voucher{quantity > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full text-lg py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/20 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Banknote className="text-[24px] mr-3 shrink-0" />
                  {loading
                    ? "Procesando..."
                    : `Pagar ${quantity} voucher${quantity > 1 ? "s" : ""}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
