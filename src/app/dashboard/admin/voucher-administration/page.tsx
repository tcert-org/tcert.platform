"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useUserStore } from "@/stores/user-store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

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
        throw new Error(jsonMembership.message || "Error al actualizar membresía");

      toast.success("Vouchers asignados y membresía actualizada correctamente", {
        position: "top-center",
        theme: "colored",
      });

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
    <div className="w-full mt-4 p-6 bg-white shadow-md rounded-lg">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partner
          </label>
          <Select
            options={partners.map((p) => ({
              value: String(p.id),
              label: p.company_name,
            }))}
            onChange={handlePartnerSelect}
            value={partners
              .map((p) => ({ value: String(p.id), label: p.company_name }))
              .find((option) => option.value === formData.partner_id)}
            placeholder="Seleccione un partner"
            className="text-sm"
            required
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad Vouchers
          </label>
          <input
            type="number"
            name="voucher_quantity"
            min={1}
            value={formData.voucher_quantity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Unitario
          </label>
          <input
            type="number"
            name="unit_price"
            min={0}
            value={formData.unit_price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Total
          </label>
          <input
            type="number"
            name="total_price"
            value={formData.total_price}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprobante de pago
          </label>
          <input
            type="file"
            name="file_url"
            accept=".png, .jpg, .jpeg, .pdf"
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="col-span-1">
          <input type="hidden" name="admin_id" value={formData.admin_id} />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={loading}
            className="mx-auto px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition block"
          >
            {loading ? "Enviando..." : "Generar"}
          </button>

          {error && (
            <p className="mt-2 text-red-600 text-sm text-center">{error}</p>
          )}
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
