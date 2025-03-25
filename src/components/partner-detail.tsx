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

interface PartnerDetailProps {
  partner: PartnerForDetail;
}

export default function PartnerDetail({ partner }: PartnerDetailProps) {
  const usagePercentage =
    partner.total_vouchers > 0
      ? Math.round((partner.used_vouchers / partner.total_vouchers) * 100)
      : 0;

  const formattedDate = new Date(partner.created_at).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <section className="w-[70%] mx-auto">
      <div>
        <Card>
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
                    {partner.used_vouchers} de {partner.total_vouchers} usados
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Partner desde el {formattedDate}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total de vouchers comprados
                  </div>
                  <div className="text-2xl font-bold">
                    {partner.total_vouchers}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Vouchers usados
                  </div>
                  <div className="text-2xl font-bold">
                    {partner.used_vouchers}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
