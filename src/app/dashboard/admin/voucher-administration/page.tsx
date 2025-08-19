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
      let comprobanteUrl = "";
      // Subir archivo si existe
      const fileInput = document.querySelector(
        'input[type="file"][name="file_url"]'
      ) as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const data = new FormData();
        data.append("comprobante", file);
        const uploadRes = await fetch("/api/upload-payment", {
          method: "POST",
          body: data,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadResult.error || "Error al subir comprobante");
        comprobanteUrl = uploadResult.url;
      }

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
          files: comprobanteUrl, // ✅ Corregido: era file_url, ahora es files
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
                <Package className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                  Administración de Vouchers
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Asigna vouchers a partners y gestiona los pagos de manera
                  eficiente
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white rounded-t-lg shadow-lg shadow-purple-500/30 border border-purple-400/20">
            <CardTitle className="flex items-center justify-center gap-3 text-lg font-bold">
              <div className="p-2 bg-gradient-to-br from-white/20 to-white/10 rounded-lg shadow-lg border border-white/30 backdrop-blur-sm">
                <Package className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              Generar y Asignar Vouchers
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Partner Selection */}
                <div className="space-y-3">
                  <Label className="text-purple-700 font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
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
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "#fb923c" : "#c084fc",
                        "&:hover": { borderColor: "#fb923c" },
                        boxShadow: state.isFocused
                          ? "0 0 0 3px rgba(251, 146, 60, 0.1)"
                          : "none",
                        background:
                          "linear-gradient(to right, white, rgba(196, 181, 253, 0.1))",
                        transition: "all 0.3s",
                      }),
                      menu: (base) => ({
                        ...base,
                        border: "1px solid #c084fc",
                        boxShadow: "0 10px 25px -3px rgba(168, 85, 247, 0.1)",
                      }),
                    }}
                    required
                  />
                </div>

                {/* Voucher Quantity */}
                <div className="space-y-3">
                  <Label
                    htmlFor="voucher_quantity"
                    className="text-purple-700 font-semibold text-sm flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-purple-500" />
                    Cantidad de Vouchers
                  </Label>
                  <Input
                    id="voucher_quantity"
                    type="number"
                    name="voucher_quantity"
                    min={1}
                    value={formData.voucher_quantity}
                    onChange={handleChange}
                    className="border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-3">
                  <Label
                    htmlFor="unit_price"
                    className="text-purple-700 font-semibold text-sm flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    Precio Unitario (USD)
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    name="unit_price"
                    min={0}
                    step="0.01"
                    value={formData.unit_price}
                    onChange={handleChange}
                    className="border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                    required
                  />
                </div>

                {/* Total Price */}
                <div className="space-y-3">
                  <Label
                    htmlFor="total_price"
                    className="text-purple-700 font-semibold text-sm flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    Precio Total (USD)
                  </Label>
                  <div className="relative">
                    <Input
                      id="total_price"
                      type="number"
                      name="total_price"
                      value={formData.total_price.toFixed(2)}
                      readOnly
                      className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 font-semibold"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                  <Label
                    htmlFor="file_url"
                    className="text-purple-700 font-semibold text-sm flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-purple-500" />
                    Comprobante de Pago
                  </Label>
                  <div className="relative">
                    <Input
                      id="file_url"
                      type="file"
                      name="file_url"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleChange}
                      className="border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 py-2 h-auto file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-100 file:to-violet-100 file:text-purple-700 hover:file:from-purple-200 hover:file:to-violet-200 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
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
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40 border border-orange-400/20 transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                <div className="p-4 bg-gradient-to-r from-red-50 via-red-50 to-red-100 border border-red-300/50 rounded-lg shadow-md backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
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
                      <strong className="font-medium text-red-700">
                        Error:
                      </strong>
                      <span className="ml-1 text-red-700">{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
