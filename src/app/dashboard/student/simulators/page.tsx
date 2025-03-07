import { DashboardLayout } from "@/components/dashboard-layout"

export default function SimulatorsPage() {
  return (
    <DashboardLayout title="Simuladores" requiredRoles={["Student"]}>
      <p>Página de simuladores para estudiantes.</p>
    </DashboardLayout>
  )
}

