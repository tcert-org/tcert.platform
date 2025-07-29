"use client";

import { useParams } from "next/navigation";
import VoucherDetailsPage from "@/components/vouchers-administration/[id]/page";

export default function AdminVoucherDetailView() {
  const params = useParams();
  const voucherId = params?.vouchers_id as string;

  if (!voucherId) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Error: ID del voucher no encontrado en la URL.
      </div>
    );
  }

  return <VoucherDetailsPage voucherId={voucherId} />;
}
