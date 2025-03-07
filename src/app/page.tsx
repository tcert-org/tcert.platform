"use client";

import { useEffect, useState } from "react";
import { StudentInterface } from "@/components/student-interface";
import { PartnerInterface } from "@/components/partner-interface";
import { AdminInterface } from "@/components/admin-interface";
import { useUserStore } from "@/stores/user-store";
import type { UserProfile, UserRole } from "@/lib/types";

export default function RootPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getUser } = useUserStore();

  useEffect(() => {
    async function fetchUserProfile() {
      const user = await getUser();
      if (user) {
        const response = await fetch(`/api/roles?id=${user.role_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const { data: role } = await response.json();
          setUserProfile({
            ...user,
            nameRol: role.name as UserRole | "unknown",
          });
        } else {
          console.error("Failed to fetch role");
        }
      }
      setIsLoading(false);
    }

    fetchUserProfile();
  }, [getUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // If no user profile is found, show an error or redirect to login
  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>
          No se ha encontrado información de usuario. Por favor, inicie sesión
          nuevamente.
        </p>
      </div>
    );
  }

  // Render the appropriate interface based on the user's role
  switch (userProfile.nameRol) {
    case "student":
      return <StudentInterface userProfile={userProfile} />;
    case "partner":
      return <PartnerInterface userProfile={userProfile} />;
    case "admin":
      return <AdminInterface userProfile={userProfile} />;
    default:
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Rol de usuario no reconocido: {userProfile.nameRol}</p>
        </div>
      );
  }
}
