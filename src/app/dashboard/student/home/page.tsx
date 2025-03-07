import { DashboardLayout } from "@/components/dashboard-layout"

export default function HomePage() {
  return (
    <DashboardLayout title="Inicio" requiredRoles={["Student"]}>
      <p>Bienvenido a la página de inicio para estudiantes.</p>
    </DashboardLayout>
  )
}

