"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Building2,
  Lock,
  Cog,
} from "lucide-react";
import ProfileForm from "./profile";
import SecurityForm from "./security";

function SettingsPartner() {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);

  const settingsOptions = [
    {
      id: "profile",
      title: "Información del Perfil",
      description:
        "Gestiona la información de tu empresa, contacto y configuraciones generales",
      icon: Building2,
      color: "purple",
      isExpanded: showProfileForm,
      onToggle: () => setShowProfileForm(!showProfileForm),
      component: <ProfileForm />,
      features: [
        "Información de la empresa",
        "Datos de contacto",
        "URLs corporativas",
      ],
    },
    {
      id: "security",
      title: "Seguridad y Contraseña",
      description:
        "Administra la seguridad de tu cuenta y cambio de contraseña",
      icon: Shield,
      color: "red",
      isExpanded: showSecurityForm,
      onToggle: () => setShowSecurityForm(!showSecurityForm),
      component: <SecurityForm />,
      features: [
        "Cambio de contraseña",
        "Configuraciones de seguridad",
        "Validaciones robustas",
      ],
    },
  ];

  const getColorClasses = (
    color: string,
    variant: "card" | "button" | "icon" | "badge"
  ) => {
    const colorMap = {
      purple: {
        card: "border-purple-300/50 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100/70 hover:from-purple-100/80 hover:via-violet-100/60 hover:to-purple-200/50 shadow-purple-100/50 hover:shadow-purple-200/60",
        button:
          "bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-600/40 border border-purple-500/20",
        icon: "text-purple-600 drop-shadow-sm",
        badge:
          "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300/50 shadow-sm",
      },
      red: {
        card: "border-red-300/50 bg-gradient-to-br from-red-50 via-rose-50 to-red-100/70 hover:from-red-100/80 hover:via-rose-100/60 hover:to-red-200/50 shadow-red-100/50 hover:shadow-red-200/60",
        button:
          "bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-600/40 border border-red-400/20",
        icon: "text-red-600 drop-shadow-sm",
        badge:
          "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300/50 shadow-sm",
      },
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || "";
  };

  return (
    <div className="settings-container space-y-8 p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
              <User className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                Configuración del Partner
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Gestiona tu perfil y configuraciones de seguridad
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300/50 shadow-sm px-3 py-1"
            >
              Partner Dashboard
            </Badge>
          </div>
        </div>
        <Separator className="bg-gradient-to-r from-purple-200 via-violet-200 to-purple-200" />
      </div>

      {/* Settings Options */}
      <div className="grid gap-6">
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card
              key={option.id}
              className={`transition-all duration-500 hover:scale-[1.02] transform ${getColorClasses(
                option.color,
                "card"
              )} border-2 backdrop-blur-sm`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl shadow-lg border border-white/50 backdrop-blur-sm ${
                        option.color === "purple"
                          ? "bg-gradient-to-br from-purple-100 to-violet-200"
                          : "bg-gradient-to-br from-red-100 to-rose-200"
                      }`}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${getColorClasses(
                          option.color,
                          "icon"
                        )}`}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={option.onToggle}
                    variant="outline"
                    size="sm"
                    className={`transition-all duration-300 transform hover:scale-105 ${getColorClasses(
                      option.color,
                      "button"
                    )}`}
                  >
                    {option.isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Configurar
                      </>
                    )}
                  </Button>
                </div>

                {/* Features badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {option.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${getColorClasses(
                        option.color,
                        "badge"
                      )} text-xs font-medium`}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              {/* Expandable Content */}
              {option.isExpanded && (
                <CardContent className="pt-0">
                  <div
                    className={`border-t-2 pt-6 ${
                      option.color === "purple"
                        ? "border-purple-200/60"
                        : "border-red-200/60"
                    }`}
                  >
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-inner border border-white/40">
                      {option.component}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsPartner;
