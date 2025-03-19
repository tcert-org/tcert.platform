"use client";

import { DataTable } from "@/components/data-table/data-table";
import {
  createActionsColumn,
  type ActionItem,
} from "@/components/data-table/action-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Copy,
  CheckCircle,
  XCircle,
  Mail,
  MailOpen,
} from "lucide-react";
// import { useToast } from "@/hooks/use-toast"

// Example data type
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  isSubscribed: boolean;
  projectCount: number;
  created_at: string;
  role: string;
}

// Enhanced mock data function with more realistic data
async function fetchUsers(
  params: any
): Promise<{ data: User[]; totalCount: number }> {
  console.log("Fetching with params:", params);

  // In a real app, this would be an API call
  // return await fetch(`/api/users?${new URLSearchParams(params)}`).then(res => res.json())

  // Mock implementation with more data for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Juan Pérez",
          email: "juan@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: true,
          projectCount: 12,
          created_at: "2023-01-15T00:00:00Z",
          role: "Administrador",
        },
        {
          id: "2",
          name: "María García",
          email: "maria@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: false,
          projectCount: 8,
          created_at: "2023-02-20T00:00:00Z",
          role: "Editor",
        },
        {
          id: "3",
          name: "Roberto Jiménez",
          email: "roberto@ejemplo.com",
          isActive: false,
          isVerified: false,
          isSubscribed: false,
          projectCount: 8,
          created_at: "2023-03-10T00:00:00Z",
          role: "Visualizador",
        },
        {
          id: "4",
          name: "Elena Martínez",
          email: "elena@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: true,
          projectCount: 8,
          created_at: "2023-04-05T00:00:00Z",
          role: "Editor",
        },
        {
          id: "5",
          name: "Miguel Rodríguez",
          email: "miguel@ejemplo.com",
          isActive: true,
          isVerified: false,
          isSubscribed: true,
          projectCount: 12,
          created_at: "2023-05-12T00:00:00Z",
          role: "Administrador",
        },
        {
          id: "6",
          name: "Sara López",
          email: "sara@ejemplo.com",
          isActive: false,
          isVerified: false,
          isSubscribed: false,
          projectCount: 12,
          created_at: "2023-06-18T00:00:00Z",
          role: "Visualizador",
        },
        {
          id: "7",
          name: "David Sánchez",
          email: "david@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: false,
          projectCount: 8,
          created_at: "2023-07-22T00:00:00Z",
          role: "Editor",
        },
        {
          id: "8",
          name: "Lucía Fernández",
          email: "lucia@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: true,
          projectCount: 12,
          created_at: "2023-08-30T00:00:00Z",
          role: "Visualizador",
        },
        {
          id: "9",
          name: "Javier Torres",
          email: "javier@ejemplo.com",
          isActive: false,
          isVerified: false,
          isSubscribed: false,
          projectCount: 8,
          created_at: "2023-09-14T00:00:00Z",
          role: "Editor",
        },
        {
          id: "10",
          name: "Patricia Navarro",
          email: "patricia@ejemplo.com",
          isActive: true,
          isVerified: true,
          isSubscribed: true,
          projectCount: 12,
          created_at: "2023-10-05T00:00:00Z",
          role: "Administrador",
        },
      ];

      resolve({
        data: mockUsers,
        totalCount: 100, // Total count from the backend
      });
    }, 1500); // Longer delay to show the skeleton loading state
  });
}

export default function UsersPage() {
  // const { toast } = useToast()

  // Define actions for the users table
  const userActions: ActionItem<User>[] = [
    {
      label: "Ver detalles",
      icon: Eye,
      action: (user: { name: any }) => {
        console.log({
          title: "Ver usuario",
          description: `Viendo detalles de ${user.name}`,
        });
      },
    },
    {
      label: "Editar",
      icon: Edit,
      action: (user: { name: any }) => {
        console.log({
          title: "Editar usuario",
          description: `Editando a ${user.name}`,
        });
      },
      // Only show edit for active users
      showCondition: (user: { isActive: any }) => user.isActive,
    },
    {
      label: "Duplicar",
      icon: Copy,
      action: (user: { name: any }) => {
        console.log({
          title: "Duplicar usuario",
          description: `Duplicando a ${user.name}`,
        });
      },
    },
    {
      label: (user: { isActive: any }) =>
        user.isActive ? "Desactivar" : "Activar",
      icon: (user: { isActive: any }) => (user.isActive ? UserX : UserCheck),
      action: (user: { isActive: any; name: any }) => {
        console.log({
          title: user.isActive ? "Usuario desactivado" : "Usuario activado",
          description: `${user.name} ha sido ${
            user.isActive ? "desactivado" : "activado"
          }`,
        });
      },
    },
    {
      label: "Eliminar",
      icon: Trash2,
      action: (user: { name: any }) => {
        console.log({
          title: "Eliminar usuario",
          description: `Eliminando a ${user.name}`,
          variant: "destructive",
        });
      },
      variant: "destructive",
    },
  ];

  // Create columns with actions as the first column
  const columns: ColumnDef<User>[] = [
    createActionsColumn(userActions),
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      size: 200,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "email",
      header: "Correo",
      size: 250,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "role",
      size: 150,
      meta: { filterType: "text" },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      size: 120,
      meta: {
        filterType: "boolean",
        booleanOptions: { trueLabel: "Activo", falseLabel: "Inactivo" },
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full mr-2 ${
              row.getValue("isActive") ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
          {row.getValue("isActive") ? "Activo" : "Inactivo"}
        </div>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verificado",
      size: 120,
      meta: {
        filterType: "boolean",
        booleanOptions: {
          trueLabel: "Verificado",
          falseLabel: "No verificado",
        },
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("isVerified") ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400 mr-2" />
          )}
          {row.getValue("isVerified") ? "Verificado" : "No verificado"}
        </div>
      ),
    },
    {
      accessorKey: "isSubscribed",
      header: "Suscripción",
      size: 120,
      meta: {
        filterType: "boolean",
        booleanOptions: { trueLabel: "Suscrito", falseLabel: "No suscrito" },
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("isSubscribed") ? (
            <Mail className="h-4 w-4 text-blue-500 mr-2" />
          ) : (
            <MailOpen className="h-4 w-4 text-gray-400 mr-2" />
          )}
          {row.getValue("isSubscribed") ? "Suscrito" : "No suscrito"}
        </div>
      ),
    },
    {
      accessorKey: "projectCount",
      header: "Proyectos",
      size: 100,
      enableSorting: true,
      meta: {
        filterType: "number",
        numberOptions: {
          min: 0,
          max: 50,
          step: 1,
          operators: true,
        },
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("projectCount")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Fecha de Creación",
      size: 180,
      meta: { filterType: "date" },
      cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString(
          "es-ES",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Usuarios</h1>
        <p className="text-muted-foreground">
          Administrar y visualizar todos los usuarios en el sistema
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <DataTable
          columns={columns}
          fetchDataFn={fetchUsers}
          booleanLabels={{ trueLabel: "Sí", falseLabel: "No" }}
        />
      </div>
    </div>
  );
}
