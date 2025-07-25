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

const UNIT_PRICE = 28;

export default function AssignVoucherForm() {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { getUser } = useUserStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const total = useMemo(() => quantity * UNIT_PRICE, [quantity]);
  const searchParams = useSearchParams();
  const hasRegistered = useRef(false); // ✅ Flag para evitar ejecución múltiple

  useEffect(() => {
    const registerVouchers = async () => {
      const success = searchParams.get("success");
      const alreadyRegistered = sessionStorage.getItem("vouchers_registered");

      // ✅ Evita doble ejecución por efecto múltiple o re-render
      if (
        success !== "true" ||
        alreadyRegistered === "true" ||
        hasRegistered.current
      )
        return;

      hasRegistered.current = true;

      const quantityFromStorage = Number(
        sessionStorage.getItem("last_quantity") || "1"
      );

      const user = await getUser();
      const partnerId = String(user?.id);

      if (!partnerId) {
        console.error("No se encontró el partner ID");
        return;
      }

      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partner_id: partnerId,
            admin_id: null,
            voucher_quantity: quantityFromStorage,
            unit_price: UNIT_PRICE,
            total_price: quantityFromStorage * UNIT_PRICE,
            files: "stripe_payment",
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error("Respuesta del backend:", error);
          throw new Error("Error al registrar los vouchers");
        }

        sessionStorage.setItem("vouchers_registered", "true");
        setShowSuccessModal(true);
        toast.success("Vouchers asignados exitosamente.");
      } catch (error) {
        console.error("❌ Error al registrar en /api/payments:", error);
        toast.error("Error al asignar los vouchers.");
      }
    };

    registerVouchers();
  }, [searchParams, getUser]);

  const handlePay = async () => {
    if (quantity < 1) {
      toast.error("La cantidad debe ser mayor a cero.");
      return;
    }

    try {
      sessionStorage.setItem("last_quantity", String(quantity));
      sessionStorage.removeItem("vouchers_registered");
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (data.url) {
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

  const quantityFromStorage = Number(
    sessionStorage.getItem("last_quantity") || "1"
  );

  return (
    <>
      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✅ Pago exitoso</DialogTitle>
          </DialogHeader>
          <div className="text-gray-800">
            <p>
              Tu compra de <strong>{quantityFromStorage}</strong> voucher(s) ha
              sido procesada con éxito.
            </p>
            <p className="mt-2">¡Gracias por tu pago! 🎉</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario */}
      <div className="flex justify-center px-4 pt-12 pb-24 bg-white h-auto">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-xl bg-white border shadow-md rounded-lg p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-blue-900 text-center">
            Comprar Vouchers
          </h2>

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
              <strong>Precio por unidad:</strong> USD ${UNIT_PRICE.toFixed(2)}
            </p>
            <p>
              <strong>Total a pagar:</strong>{" "}
              <span className="text-blue-700 font-semibold">
                USD ${total.toFixed(2)}
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
