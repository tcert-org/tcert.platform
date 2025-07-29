import { useEffect, useState } from "react";
import { CalendarIcon, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PartnerForDetail } from "@/modules/partners/table";

interface VoucherCounts {
  voucher_purchased: number;
  voucher_asigned: number;
  voucher_available: number;
}

interface PartnerDetailProps {
  partner: PartnerForDetail;
}

export default function PartnerDetail({ partner }: PartnerDetailProps) {
  const [counts, setCounts] = useState<VoucherCounts | null>(null);

  useEffect(() => {
    async function fetchVoucherCounts() {
      try {
        const res = await fetch(
          `/api/vouchers/quantity?partner_id=${partner.id}`
        );
        const json = await res.json();

        if (res.ok) {
          setCounts(json.data);
        } else {
          console.error("Error fetching counts:", json.error);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    }

    if (partner?.id) {
      fetchVoucherCounts();
    }
  }, [partner?.id]);

  const used = counts?.voucher_asigned || 0;
  const total = counts?.voucher_purchased || 0;
  const available = counts?.voucher_available || 0;

  const usagePercentage = total > 0 ? Math.round((used / total) * 100) : 0;

  const formattedDate = new Date(partner.created_at).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // 🎨 Colores definidos por membresía
  const colorBar: Record<string, string> = {
    Bronce: "bg-yellow-700",
    Plata: "bg-gray-500",
    Oro: "bg-amber-500",
    Diamante: "bg-blue-500",
  };

  const badgeColor =
    partner.membership_name && colorBar[partner.membership_name]
      ? colorBar[partner.membership_name]
      : "bg-muted text-muted-foreground";

  return (
    <section className="w-[70%] mx-auto">
      <div>
        <Card className="relative">
          {/* Badge de membresía en la parte superior derecha */}
          {partner.membership_name && (
            <div
              className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full shadow-sm text-white ${badgeColor}`}
            >
              {partner.membership_name}
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {partner.company_name}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{partner.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Uso de vouchers</span>
                  <span className="text-sm text-muted-foreground">
                    {used} de {total} usados
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Partner desde el {formattedDate}</span>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
