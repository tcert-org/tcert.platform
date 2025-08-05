"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useUserStore } from "@/stores/user-store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, DollarSign, Package, Users } from "lucide-react";

export default function VoucherAdministrationPage() {
  const router = useRouter();
  const { getUser } = useUserStore();
  const [formData, setFormData] = useState({
    partner_id: "",
    admin_id: "",
    voucher_quantity: 1,
    unit_price: 0,
    total_price: 0,
    file_url: "",
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [partnerRes, user] = await Promise.all([
          fetch("/api/payments/partners").then((res) => res.json()),
          getUser(),
        ]);

        setPartners(partnerRes.data || []);
        if (user?.id) {
          setFormData((prev) => ({ ...prev, admin_id: String(user.id) }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchInitialData();
  }, [getUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "file_url" && files?.length ? files[0].name : value,
      };

      if (name === "voucher_quantity" || name === "unit_price") {
        const quantity = Number(
          name === "voucher_quantity" ? value : prev.voucher_quantity
        );
        const price = Number(name === "unit_price" ? value : prev.unit_price);
        updated.total_price = quantity * price;
      }

      return updated;
    });
  };

  const handlePartnerSelect = (selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      partner_id: String(selectedOption?.value || ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Enviar asignación de vouchers
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partner_id: formData.partner_id,
          admin_id: formData.admin_id || null,
          voucher_quantity: Number(formData.voucher_quantity),
          unit_price: Number(formData.unit_price),
          total_price: Number(formData.total_price),
          files: formData.file_url,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al generar");

      // 2. Actualizar membresía automáticamente
      const resMembership = await fetch("/api/membership", { method: "POST" });
      const jsonMembership = await resMembership.json();
      if (!resMembership.ok)
        throw new Error(
          jsonMembership.message || "Error al actualizar membresía"
        );

      toast.success(
        "Vouchers asignados y membresía actualizada correctamente",
        {
          position: "top-center",
          theme: "colored",
        }
      );

      // 3. Reset y redirección
      setFormData({
        partner_id: "",
        admin_id: formData.admin_id,
        voucher_quantity: 1,
        unit_price: 0,
        total_price: 0,
        file_url: "",
      });

      setTimeout(() => {
        router.push("/dashboard/admin/partners");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
      <ToastContainer />

      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Package className="h-6 w-6" />
            Administración de Vouchers
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Asigna vouchers a partners y gestiona los pagos de manera eficiente
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Partner Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Partner
                </Label>
                <Select
                  options={partners.map((p) => ({
                    value: String(p.id),
                    label: p.company_name,
                  }))}
                  onChange={handlePartnerSelect}
                  value={partners
                    .map((p) => ({
                      value: String(p.id),
                      label: p.company_name,
                    }))
                    .find((option) => option.value === formData.partner_id)}
                  placeholder="Seleccione un partner"
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#d1d5db",
                      "&:hover": { borderColor: "#9ca3af" },
                      boxShadow: "none",
                    }),
                  }}
                  required
                />
              </div>

              {/* Voucher Quantity */}
              <div className="space-y-2">
                <Label
                  htmlFor="voucher_quantity"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Cantidad de Vouchers
                </Label>
                <Input
                  id="voucher_quantity"
                  type="number"
                  name="voucher_quantity"
                  min={1}
                  value={formData.voucher_quantity}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-2">
                <Label
                  htmlFor="unit_price"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Precio Unitario
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  name="unit_price"
                  min={0}
                  step="0.01"
                  value={formData.unit_price}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              {/* Total Price */}
              <div className="space-y-2">
                <Label
                  htmlFor="total_price"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Precio Total
                </Label>
                <Input
                  id="total_price"
                  type="number"
                  name="total_price"
                  value={formData.total_price.toFixed(2)}
                  readOnly
                  className="w-full bg-gray-50 text-gray-600"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label
                  htmlFor="file_url"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Comprobante de Pago
                </Label>
                <Input
                  id="file_url"
                  type="file"
                  name="file_url"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceptados: PNG, JPG, JPEG, PDF
                </p>
              </div>
            </div>

            {/* Hidden Admin ID */}
            <input type="hidden" name="admin_id" value={formData.admin_id} />

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  "Generar Vouchers"
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <strong className="font-medium">Error:</strong>
                    <span className="ml-1">{error}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
