import { DashboardLayout } from "@/components/dashboard-layout"

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reportes" requiredRoles={["Partner", "Admin"]}>
      <p>Página de reportes para socios y administradores.</p>
    </DashboardLayout>
  )
}

