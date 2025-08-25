"use client";
import React, { useEffect, useState, useCallback } from "react";
type Certification = { id: number; name: string };
import { usePathname } from "next/navigation";
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
  Download,
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
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [hasApprovedAttempts, setHasApprovedAttempts] = useState<
    boolean | null
  >(null);
  const [approvedAttempts, setApprovedAttempts] = useState<any[]>([]);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [savingCertification, setSavingCertification] = useState(false);
  const [certificationError, setCertificationError] = useState<string | null>(
    null
  );
  const [showCertificationSuccess, setShowCertificationSuccess] =
    useState(false);
  const pathname = usePathname();
  // Cargar certificaciones
  useEffect(() => {
    async function fetchCertifications() {
      try {
        const res = await fetch("/api/vouchers/certifications");
        const result = await res.json();
        if (res.ok && result.data) {
          setCertifications(result.data);
        }
      } catch (err) {
        // Silenciar error
      }
    }
    fetchCertifications();
  }, []);

  // Detectar si estamos en la ruta de admin
  const isAdminRoute = pathname.includes("/dashboard/admin");

  // Construir la URL de resultados según el contexto
  const getResultsUrl = () => {
    if (isAdminRoute) {
      // Si estamos en admin, usar la ruta específica de admin
      return `/dashboard/admin/results?voucher_id=${voucher?.id}&student_id=${student.id}`;
    }
    return `/dashboard/partner/results?voucher_id=${voucher?.id}&student_id=${student.id}`;
  };

  // Verificar elegibilidad para certificado (igual que vista estudiante)
  const checkCertificateEligibility = useCallback(async () => {
    if (!student?.id) return;
    setCertificateError(null);
    setHasApprovedAttempts(null);
    setApprovedAttempts([]);
    try {
      // Verificar si el estudiante tiene intentos aprobados
      const approvedResponse = await fetch(
        `/api/attempts/approved?student_id=${student.id}`
      );
      if (!approvedResponse.ok) {
        setCertificateEligible(false);
        setHasApprovedAttempts(false);
        setCertificateError(
          "Error al verificar la elegibilidad para el certificado."
        );
        return;
      }
      const approvedData = await approvedResponse.json();
      const attemptData = approvedData.data;
      setHasApprovedAttempts(attemptData.hasApprovedAttempts);
      if (
        attemptData.hasApprovedAttempts &&
        attemptData.approvedAttempts.length > 0
      ) {
        setApprovedAttempts(attemptData.approvedAttempts);
        setCertificateEligible(true);
        setCertificateError(null);
      } else {
        setApprovedAttempts([]);
        setCertificateEligible(false);
        setCertificateError(
          "El estudiante debe aprobar un examen para generar el certificado."
        );
      }
    } catch (error) {
      setCertificateEligible(false);
      setHasApprovedAttempts(false);
      setCertificateError("Error inesperado al verificar la elegibilidad.");
      console.error("Error verificando elegibilidad:", error);
    }
  }, [student?.id]);

  // Generar certificado (solo si hay intentos aprobados)
  const generateCertificate = async () => {
    if (
      !certificateEligible ||
      !voucher ||
      !student ||
      !hasApprovedAttempts ||
      approvedAttempts.length === 0
    ) {
      setCertificateError(
        "No puedes obtener el certificado porque no tienes ningún examen aprobado."
      );
      return;
    }
    setCertificateLoading(true);
    setCertificateError(null);
    try {
      // Usar el intento aprobado más reciente
      const examAttemptId = approvedAttempts[0].id;
      // Obtener el diploma para extraer la fecha de expiración real
      const diplomaByVoucherRes = await fetch(
        `/api/diploma/by-voucher-code?voucher_code=${voucher.code}`
      );
      let expirationDate = new Date();
      if (diplomaByVoucherRes.ok) {
        const diplomaByVoucherData = await diplomaByVoucherRes.json();
        const expirationDateRaw = diplomaByVoucherData?.data?.diploma
          ?.expiration_date;
        if (typeof expirationDateRaw === "string") {
          expirationDate = new Date(expirationDateRaw.split("T")[0]);
        }
      }
      const expirationDateString = expirationDate.toISOString().split("T")[0];
      // Validar o crear el registro del diploma antes de generar el PDF
      const diplomaResponse = await fetch("/api/diploma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_attempt_id: examAttemptId,
          student_id: student.id,
          certification_id: voucher.certification_id,
          completion_date: new Date().toISOString().split("T")[0],
          expiration_date: expirationDateString,
        }),
      });
      if (!diplomaResponse.ok) {
        const diplomaResponseText = await diplomaResponse.text();
        setCertificateError(
          `Error al validar el diploma: ${diplomaResponseText}`
        );
        setCertificateLoading(false);
        return;
      }
      // Generar el certificado
      const certResponse = await fetch("/api/diploma/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: student.fullname,
          certificationName: voucher.certification_name,
          expeditionDate: expirationDateString,
          codigoVoucher: voucher.code,
          URL_logo: voucher.certification_logo_url,
          documentNumber: student.document_number,
        }),
      });
      if (!certResponse.ok) {
        setCertificateError("Error al generar el certificado.");
        setCertificateLoading(false);
        return;
      }
      // Descargar el PDF
      const certBlob = await certResponse.blob();
      const url = window.URL.createObjectURL(certBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${student.fullname}-certificado.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setCertificateError("Error inesperado al generar el certificado.");
    } finally {
      setCertificateLoading(false);
    }
  };

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
          setEditName(studentData.data?.fullname || "");
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [voucherId]);

  // Verificar elegibilidad cuando se cargan voucher y student
  useEffect(() => {
    if (voucher && student) {
      checkCertificateEligibility();
    }
  }, [voucher, student, checkCertificateEligibility]);

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
                    {isAdminRoute ? (
                      <>
                        <select
                          className="border rounded px-2 py-1 text-gray-800 font-medium focus:outline-none focus:ring focus:border-purple-400"
                          value={voucher?.certification_id || ""}
                          onChange={async (e) => {
                            setSavingCertification(true);
                            setCertificationError(null);
                            setShowCertificationSuccess(false);
                            const newId = e.target.value;
                            try {
                              const res = await fetch(
                                `/api/vouchers/${voucher.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    certification_id: newId,
                                  }),
                                }
                              );
                              if (!res.ok) {
                                const err = await res.text();
                                setCertificationError(
                                  err || "Error al actualizar certificación"
                                );
                              } else {
                                const selected = certifications.find(
                                  (c) => c.id === Number(newId)
                                );
                                setVoucher({
                                  ...voucher,
                                  certification_id: Number(newId),
                                  certification_name: selected?.name,
                                });
                                setShowCertificationSuccess(true);
                                setTimeout(
                                  () => setShowCertificationSuccess(false),
                                  2500
                                );
                              }
                            } catch (err) {
                              setCertificationError(
                                "Error de red al actualizar certificación"
                              );
                            } finally {
                              setSavingCertification(false);
                            }
                          }}
                          disabled={savingCertification}
                          style={{ minWidth: 180 }}
                        >
                          <option value="">Selecciona una certificación</option>
                          {certifications.map((cert) => (
                            <option key={cert.id} value={cert.id}>
                              {cert.name}
                            </option>
                          ))}
                        </select>
                        {savingCertification && (
                          <span className="ml-2 text-xs text-purple-600">
                            Guardando...
                          </span>
                        )}
                        {certificationError && (
                          <span className="ml-2 text-xs text-red-600">
                            {certificationError}
                          </span>
                        )}
                        {showCertificationSuccess && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded shadow">
                            ¡Certificación actualizada!
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {voucher?.certification_name || "N/A"}
                      </span>
                    )}
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
                  <p className="flex items-center gap-2">
                    <strong className="text-gray-700">Nombre:</strong>{" "}
                    {isAdminRoute ? (
                      <>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 text-gray-800 font-medium focus:outline-none focus:ring focus:border-purple-400"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={savingName}
                          style={{ minWidth: 180 }}
                        />
                        <button
                          className={`ml-2 px-3 py-1 rounded bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed`}
                          onClick={async () => {
                            setSavingName(true);
                            setNameError(null);
                            try {
                              const res = await fetch(
                                `/api/students/${student.id}/update-name`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ fullname: editName }),
                                }
                              );
                              if (!res.ok) {
                                const err = await res.text();
                                setNameError(err || "Error al guardar nombre");
                              } else {
                                setStudent({ ...student, fullname: editName });
                                setShowSuccess(true);
                                setTimeout(() => setShowSuccess(false), 2500);
                              }
                            } catch (err) {
                              setNameError("Error de red al guardar nombre");
                            } finally {
                              setSavingName(false);
                            }
                          }}
                          disabled={
                            savingName ||
                            !editName ||
                            editName === student.fullname
                          }
                        >
                          {savingName ? "Guardando..." : "Guardar"}
                        </button>
                        {nameError && (
                          <span className="ml-2 text-xs text-red-600">
                            {nameError}
                          </span>
                        )}
                        {showSuccess && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded shadow">
                            ¡Nombre actualizado!
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {student.fullname}
                      </span>
                    )}
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
          <div className="flex justify-center gap-4">
            {student && (
              <a
                href={getResultsUrl()}
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-300/50 hover:from-purple-200 hover:to-violet-200 transition-all duration-200 shadow-sm"
              >
                <Contact2 className="w-4 h-4 mr-2" />
                Ver Resultados del Estudiante
              </a>
            )}

            {student && (
              <button
                onClick={generateCertificate}
                disabled={
                  !certificateEligible ||
                  certificateLoading ||
                  !hasApprovedAttempts ||
                  approvedAttempts.length === 0
                }
                className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                  certificateEligible &&
                  !certificateLoading &&
                  hasApprovedAttempts &&
                  approvedAttempts.length > 0
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300/50 hover:from-green-200 hover:to-emerald-200"
                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-500 border border-gray-300/50 cursor-not-allowed"
                }`}
              >
                {certificateLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {certificateLoading ? "Generando..." : "Generar Certificado"}
              </button>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col items-center gap-4">
            {/* Mostrar advertencia personalizada si no hay intentos aprobados */}
            {certificateError && hasApprovedAttempts === false && (
              <div className="max-w-md mx-auto w-full">
                <div className="flex flex-col items-center bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2 shadow-sm">
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-orange-800 mb-1 text-base">
                    Certificado No Disponible
                  </h3>
                  <p className="text-xs text-orange-700 mb-1 text-center">
                    Para obtener el certificado, el estudiante debe aprobar al
                    menos un examen oficial de la certificación.
                  </p>
                  <p className="text-xs text-orange-600 text-center">
                    Verifica los resultados o indícale que presente el examen
                    correspondiente.
                  </p>
                </div>
              </div>
            )}
            {/* Otros errores */}
            {certificateError && hasApprovedAttempts !== false && (
              <div className="max-w-md text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300/50">
                  <BadgeCheck className="w-4 h-4 mr-2" />
                  {certificateError}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
