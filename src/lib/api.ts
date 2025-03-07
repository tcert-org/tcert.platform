import { Settings, LogOut } from "lucide-react"
import type { UserProfile } from "./types"

// Simulated API call to fetch user profile
export async function fetchUserProfile(): Promise<UserProfile> {
  // In a real application, this would be an API call
  // For demo purposes, we'll return a mock user

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock user data
  return {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "admin", // This could be 'admin', 'manager', or 'user'
    profileOptions: [
      {
        title: "Configuración",
        path: "/settings",
        icon: Settings,
      },
      {
        title: "Cerrar sesión",
        path: "/logout",
        icon: LogOut,
      },
    ],
  }
}

