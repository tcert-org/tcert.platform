"use client";
import React, { useEffect, useState } from "react";
import {
  Loader2,
  BadgeCheck,
  Calendar,
  Mail,
  Barcode,
  BookOpen,
  User,
  IdCard,
  Contact2,
} from "lucide-react";

type Props = {
  voucherId: string;
};

// Función para obtener el color del estado basado en el nombre
const getStatusBadgeColor = (statusName: string | null | undefined): string => {
  if (!statusName)
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300/50";

  const status = statusName.toLowerCase();

  if (status.includes("activo") || status.includes("disponible")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50";
  }
  if (status.includes("usado") || status.includes("utilizado")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50";
  }
  if (status.includes("expirado") || status.includes("vencido")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50";
  }
  if (status.includes("pendiente")) {
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300/50";
  }

  return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300/50";
};

export default function VoucherDetailsPage({ voucherId }: Props) {
  const [voucher, setVoucher] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/vouchers/${voucherId}`, {
          cache: "no-store",
        });
        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.error || "Error");
        setVoucher(result.data);

        localStorage.setItem("voucher_id", result.data.id);

        const studentRes = await fetch(
          `/api/students/by-voucher?voucher_id=${result.data.id}`
        );
        const studentData = await studentRes.json();
        if (studentRes.ok) {
          setStudent(studentData.data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [voucherId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">
            Cargando información del voucher...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
              <Barcode className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                Detalles del Voucher
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Información completa del voucher y estudiante asociado
              </p>
            </div>
          </div>

          {/* Descripción detallada */}
          <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-200/80 rounded-lg p-4 border border-orange-300/60 shadow-lg shadow-orange-200/40">
            <p className="text-sm text-gray-700 leading-relaxed">
              Esta página muestra toda la información relacionada con el voucher
              seleccionado, incluyendo su estado actual, fechas importantes y
              los datos del estudiante que lo ha utilizado.
            </p>
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="space-y-6">
          {/* Información del Voucher */}
          <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg">
                <Barcode className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent">
                Información del Voucher
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Barcode className="text-purple-700 w-5 h-5" />
                  <p className="flex items-center gap-2">
                    <strong className="text-gray-700">Código:</strong>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50">
                      {voucher?.code}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Certificación:</strong>{" "}
                    <span className="text-gray-800 font-medium">
                      {voucher?.certification_name || "N/A"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Email:</strong>{" "}
                    <span className="text-gray-800">{voucher?.email}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <BadgeCheck className="text-purple-700 w-5 h-5" />
                  <p className="flex items-center gap-2">
                    <strong className="text-gray-700">Estado:</strong>
                    <span className={getStatusBadgeColor(voucher?.status_name)}>
                      {voucher?.status_name || "Sin estado"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-purple-700 w-5 h-5" />
                  <p className="flex items-center gap-2">
                    <strong className="text-gray-700">Fecha de compra:</strong>
                    <span className="text-gray-700">
                      {voucher?.purchase_date
                        ? new Date(voucher.purchase_date).toLocaleDateString(
                            "es-CO"
                          )
                        : "N/A"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="text-purple-700 w-5 h-5" />
                  <p className="flex items-center gap-2">
                    <strong className="text-gray-700">
                      Fecha de vencimiento:
                    </strong>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50">
                      {voucher?.expiration_date
                        ? new Date(voucher.expiration_date).toLocaleDateString(
                            "es-CO"
                          )
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Estudiante */}
          <div className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent">
                Detalles del Estudiante
              </h2>
            </div>

            {student ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Nombre:</strong>{" "}
                    <span className="text-gray-800 font-medium">
                      {student.fullname}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Contact2 className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Tipo Documento:</strong>{" "}
                    <span className="text-gray-800">
                      {student.document_type}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Correo:</strong>{" "}
                    <span className="text-gray-800">{student.email}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <IdCard className="text-purple-700 w-5 h-5" />
                  <p>
                    <strong className="text-gray-700">Documento:</strong>{" "}
                    <span className="text-gray-800 font-medium">
                      {student.document_number}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-300/50">
                  <User className="w-4 h-4 mr-2" />
                  No se encontró un estudiante asociado a este voucher
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center gap-4">
            <a
              href="/dashboard/student/simulators"
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Ir a Simuladores
            </a>
            <a
              href="/dashboard/student/exam"
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50 hover:from-green-200 hover:to-emerald-200 transition-all duration-200 shadow-sm"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              Ir a Exámenes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
