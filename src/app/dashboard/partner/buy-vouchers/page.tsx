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

// Colores para el badge (mismos que estás usando en el proyecto)
const membershipColor: Record<string, string> = {
  Bronce: "bg-yellow-700 text-white",
  Plata: "bg-gray-500 text-white",
  Oro: "bg-amber-500 text-white",
  Diamante: "bg-blue-500 text-white",
};

export default function AssignVoucherForm() {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { getUser } = useUserStore();

  // ✨ Nuevo: estado para mostrar nombre de la membresía
  const [membershipName, setMembershipName] = useState<string | null>(null);

  // Precio unitario dinámico (sin valor por defecto)
  const [unitPrice, setUnitPrice] = useState<number | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const searchParams = useSearchParams();
  const hasRegistered = useRef(false);

  // 1) Traer nombre de la membresía del partner (usando membership_id del usuario)
  useEffect(() => {
    const fetchMembershipName = async () => {
      const user = await getUser();
      const membership_id = user?.membership_id;
      if (!membership_id) {
        setMembershipName(null);
        return;
      }

      try {
        // Obtiene todas y encuentra la del usuario (4 filas, poco costo)
        const res = await fetch("/api/membership", { method: "GET" });
        const json = await res.json();
        const list: MembershipRow[] = Array.isArray(json.data) ? json.data : [];
        const found = list.find((m) => m.id === Number(membership_id));
        setMembershipName(found?.name ?? null);
      } catch (err) {
        console.error("No se pudo obtener la membresía:", err);
        setMembershipName(null);
      }
    };

    fetchMembershipName();
  }, [getUser]);

  // 2) Obtener precio desde el backend apenas entra o cambia cantidad
  useEffect(() => {
    const fetchPrice = async () => {
      const user = await getUser();
      const membership_id = user?.membership_id;

      if (!membership_id || quantity < 1) return;

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity,
            membership_id,
            onlyPrice: true, // backend responde { unit_price }
          }),
        });

        const data = await res.json();
        if (typeof data.unit_price === "number") {
          setUnitPrice(data.unit_price);
          sessionStorage.setItem("unit_price", String(data.unit_price));
        } else {
          // Si no vino unit_price, mantiene el valor actual (o null)
          console.warn("No llegó unit_price desde /api/checkout");
        }
      } catch (error) {
        console.error("Error al obtener precio:", error);
      }
    };

    fetchPrice();
  }, [quantity, getUser]);

  // 3) Al volver de Stripe, registrar los vouchers
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
        const membershipIdFromStorage = sessionStorage.getItem("membership_id");
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
              membership_id: membershipIdFromStorage,
            }),
          });

          if (!res.ok) throw new Error("Error al registrar los vouchers");

          sessionStorage.setItem("vouchers_registered", "true");
          setShowSuccessModal(true);
          toast.success("Vouchers asignados exitosamente.");
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
  }, [searchParams, getUser]);

  // 4) Ir a Stripe
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
      sessionStorage.setItem("membership_id", String(membership_id));
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
          setUnitPrice(data.unit_price); // refleja inmediatamente
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

  // 5) Totales
  const total = useMemo(() => {
    if (unitPrice == null) return 0;
    return quantity * unitPrice;
  }, [quantity, unitPrice]);

  // Badge de membresía (color por nombre o color neutro si no coincide)
  const badgeClass =
    membershipName && membershipColor[membershipName]
      ? membershipColor[membershipName]
      : "bg-gray-300 text-gray-800";

  return (
    <>
      {/* Éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✅ Pago exitoso</DialogTitle>
          </DialogHeader>
          <div className="text-gray-800">
            <p>
              Tu compra de <strong>{quantity}</strong> voucher(s) fue procesada.
            </p>
            <p className="mt-2">¡Gracias por tu pago! 🎉</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancelación */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>❌ Pago cancelado</DialogTitle>
          </DialogHeader>
          <div className="text-gray-800">
            <p>El proceso de pago fue cancelado.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario */}
      <div className="flex justify-center px-4 pt-12 pb-24 bg-white h-auto">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-xl bg-white border shadow-md rounded-lg p-8 space-y-6"
        >
          {/* Encabezado + badge de membresía */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-blue-900">
              Comprar Vouchers
            </h2>

            {membershipName && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
                {membershipName}
              </span>
            )}
          </div>

          {/* Mensaje explicativo corto */}
          <p className="text-sm text-gray-600">
            El precio por unidad se calcula según tu membresía actual
            {membershipName ? ` (${membershipName})` : ""}. Si tu membresía cambia,
            el precio puede variar.
          </p>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-lg">
              Cantidad de vouchers
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="text-lg"
            />
          </div>

          <div className="text-base text-gray-700 space-y-1">
            <p>
              <strong>Precio por unidad:</strong>{" "}
              USD {unitPrice !== null ? unitPrice.toFixed(2) : "—"}
            </p>
            <p>
              <strong>Total a pagar:</strong>{" "}
              <span className="text-blue-700 font-semibold">
                USD {unitPrice !== null ? total.toFixed(2) : "—"}
              </span>
            </p>
          </div>

          <Button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center"
          >
            <Banknote className="text-[28px] mr-2 shrink-0" />
            {loading
              ? "Procesando..."
              : `Pagar ${quantity} voucher${quantity > 1 ? "s" : ""}`}
          </Button>
        </form>
      </div>
    </>
  );
}
