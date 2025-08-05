"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

interface Partner {
  id: number;
  company_name: string;
  email: string;
}

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
  });

  // Cargar datos del partner
  useEffect(() => {
    async function fetchPartner() {
      try {
        const response = await fetch(`/api/partners/${partnerId}`);
        if (!response.ok) throw new Error("Error al cargar partner");

        const data = await response.json();
        setPartner(data);
        setFormData({
          company_name: data.company_name || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar los datos del partner");
      } finally {
        setLoading(false);
      }
    }

    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar partner");
      }

      alert("Partner actualizado exitosamente");
      router.push("/dashboard/admin/partners");
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar el partner"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Partner no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/partners")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Partners
        </Button>

        <h1 className="text-2xl font-bold">Editar Partner</h1>
        <p className="text-muted-foreground text-sm">
          Modifica la información del partner
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="company_name">Nombre de la Empresa</Label>
                <Input
                  id="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/partners")}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
