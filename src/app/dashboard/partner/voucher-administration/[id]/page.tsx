"use client";

import { useParams } from "next/navigation";
import VoucherDetailsPage from "@/components/vouchers-administration/[id]/page";

export default function PageStudent() {
  const params = useParams();
  const voucherId = params.id as string;

  if (!voucherId) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Error: No se encontró el ID del voucher en la URL.
      </div>
    );
  }

  return <VoucherDetailsPage voucherId={voucherId} />;
}
