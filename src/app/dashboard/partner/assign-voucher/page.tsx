// src/app/dashboard/partner/asignar-voucher/page.tsx
"use client";

import FormVoucher from "@/components/form-voucher";

export default function AssignVoucherPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Asignar nuevo voucher</h1>
      <FormVoucher />
    </div>
  );
}
