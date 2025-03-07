import { DashboardLayout } from "@/components/dashboard-layout"

export default function ExamPage() {
  return (
    <DashboardLayout title="Examen" requiredRoles={["Student"]}>
      <p>Página de examen para estudiantes.</p>
    </DashboardLayout>
  )
}

