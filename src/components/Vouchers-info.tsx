"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon } from "lucide-react";

interface VoucherCounts {
  voucher_purchased: number;
  voucher_asigned: number;
  voucher_available: number;
}

interface Props {
  partnerId: number;
}

export default function VoucherStats({ partnerId }: Props) {
  const [counts, setCounts] = useState<VoucherCounts | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVoucherCounts() {
      try {
        const res = await fetch(
          `/api/vouchers/quantity?partner_id=${partnerId}`
        );
        const json = await res.json();
        if (res.ok) {
          setCounts(json.data);
          if (json.created_at) {
            setCreatedAt(json.created_at);
          }
        } else {
          console.error("Error fetching counts:", json.error);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    }

    fetchVoucherCounts();
  }, [partnerId]);

  const used = counts?.voucher_asigned || 0;
  const total = counts?.voucher_purchased || 0;
  const available = counts?.voucher_available || 0;
  const usagePercentage = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="space-y-6 border rounded-lg p-4 shadow-sm bg-white">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Uso de vouchers</span>
          <span className="text-sm text-muted-foreground">
            {used} de {total} usados
          </span>
        </div>
        <Progress value={usagePercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Vouchers comprados
          </div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Vouchers asignados
          </div>
          <div className="text-2xl font-bold">{used}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Vouchers disponibles
          </div>
          <div className="text-2xl font-bold">{available}</div>
        </div>
      </div>

      {createdAt && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Partner desde{" "}
            {new Date(createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
