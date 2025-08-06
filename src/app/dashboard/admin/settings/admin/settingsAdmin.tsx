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
  Users,
  Settings,
  CreditCard,
  Cog,
  Sparkles,
} from "lucide-react";
import MembershipForm from "./membership/membership";
import ParamsPage from "./params/params";

function SettingsAdmin() {
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showParamsForm, setShowParamsForm] = useState(false);

  const settingsOptions = [
    {
      id: "memberships",
      title: "Gestión de Membresías",
      description:
        "Administra tipos de membresía, precios y beneficios para los usuarios",
      icon: Users,
      color: "purple",
      isExpanded: showMembershipForm,
      onToggle: () => setShowMembershipForm(!showMembershipForm),
      component: <MembershipForm />,
      features: [
        "Crear membresías",
        "Configurar precios",
        "Gestionar beneficios",
      ],
    },
    {
      id: "parameters",
      title: "Parametrización del Sistema",
      description:
        "Configura parámetros globales y ajustes generales de la plataforma",
      icon: Settings,
      color: "orange",
      isExpanded: showParamsForm,
      onToggle: () => setShowParamsForm(!showParamsForm),
      component: <ParamsPage />,
      features: [
        "Configuraciones globales",
        "Parámetros de exámenes",
        "Ajustes generales",
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
      orange: {
        card: "border-orange-300/50 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/70 hover:from-orange-100/80 hover:via-amber-100/60 hover:to-orange-200/50 shadow-orange-100/50 hover:shadow-orange-200/60",
        button:
          "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40 border border-orange-400/20",
        icon: "text-orange-600 drop-shadow-sm",
        badge:
          "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300/50 shadow-sm",
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
              <Cog className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                Panel de Administración
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Configura y gestiona todos los aspectos de tu plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200/80 rounded-full border border-orange-300/60 shadow-lg shadow-orange-200/40">
            <Sparkles className="h-4 w-4 text-orange-700 drop-shadow-sm" />
            <span className="text-sm font-medium bg-gradient-to-r from-orange-800 to-amber-800 bg-clip-text text-transparent">
              Configuraciones Avanzadas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 rounded-lg p-4 border border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent">
                Sistema Activo
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Todas las configuraciones funcionando correctamente
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-orange-100/50 rounded-lg p-4 border border-orange-200/50 shadow-lg shadow-orange-100/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full shadow-sm shadow-purple-400/50"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-orange-800 to-amber-700 bg-clip-text text-transparent">
                Módulos Configurables
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {settingsOptions.length} secciones disponibles
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Enhanced Settings Grid */}
      <div className="grid gap-6">
        {settingsOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <Card
              key={option.id}
              className={`transition-all duration-300 hover:shadow-2xl hover:shadow-${
                option.color
              }-500/20 transform hover:-translate-y-2 ${getColorClasses(
                option.color,
                "card"
              )} animate-in slide-in-from-bottom-4 backdrop-blur-sm border-2`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br from-white to-white/80 shadow-lg border border-white/50 ${getColorClasses(
                        option.color,
                        "icon"
                      )} transition-all duration-300 hover:scale-110 hover:shadow-xl backdrop-blur-sm`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {option.title}
                        </CardTitle>
                        <div className="flex gap-2"></div>
                      </div>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={option.onToggle}
                    variant="default"
                    size="lg"
                    className={`transition-all duration-300 transform hover:scale-105 ${getColorClasses(
                      option.color,
                      "button"
                    )} backdrop-blur-sm`}
                  >
                    {option.isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Ocultar Configuración
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Abrir Configuración
                      </>
                    )}
                  </Button>
                </div>

                {/* Enhanced Feature badges */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/60">
                  <span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent uppercase tracking-wide mb-1">
                    Funcionalidades principales:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {option.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-white/90 to-white/70 text-gray-700 hover:from-white hover:to-white/90 transition-all duration-200 cursor-default border border-white/60 shadow-sm backdrop-blur-sm"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>

              {option.isExpanded && (
                <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
                  <Separator className="mb-6" />
                  <div className="bg-gradient-to-br from-white via-white/95 to-white/90 rounded-xl p-6 border border-white/70 shadow-inner backdrop-blur-sm">
                    {option.component}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Enhanced Footer info */}
      <Card className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100/80 border-slate-300/50 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-200/80 rounded-lg shadow-sm border border-amber-200/50">
              <CreditCard className="h-5 w-5 text-amber-700 drop-shadow-sm" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                Información Importante
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Las configuraciones aplicadas en este panel afectarán a toda la
                plataforma y a todos los usuarios. Asegúrate de revisar
                cuidadosamente los cambios antes de confirmar cualquier
                modificación.
              </p>
              <div className="flex gap-4 text-xs text-gray-500 mt-3">
                <span>• Los cambios se aplican inmediatamente</span>
                <span>• Se registran todas las modificaciones</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsAdmin;
