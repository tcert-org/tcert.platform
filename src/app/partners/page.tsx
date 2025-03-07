import { DashboardLayout } from "@/components/dashboard-layout"

export default function PartnersPage() {
  return (
    <DashboardLayout title="Socios" requiredRoles={["Admin"]}>
      <p>Página de administración de socios para administradores.</p>
    </DashboardLayout>
  )
}

