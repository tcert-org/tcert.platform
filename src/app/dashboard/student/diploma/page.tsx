"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Award, Download, Loader2 } from "lucide-react";

interface ApprovedAttemptData {
  hasApprovedAttempts: boolean;
  approvedAttempts: any[];
}

export default function CertificatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApprovedAttempts, setHasApprovedAttempts] = useState<
    boolean | null
  >(null);
  const [approvedAttempts, setApprovedAttempts] = useState<any[]>([]);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    checkCertificateEligibility();
  }, []);

  const checkCertificateEligibility = async () => {
    setCheckingEligibility(true);
    setError(null);

    try {
      // Obtener datos del student-data desde sessionStorage
      const session = JSON.parse(
        sessionStorage.getItem("student-data") || "{}"
      );
      const voucherId = session?.state?.decryptedStudent?.voucher_id;

      if (!voucherId) {
        setError("No se encontró el ID del voucher.");
        setCheckingEligibility(false);
        return;
      }

      // Obtener el student_id usando el voucher_id
      const studentResponse = await fetch(
        `/api/students/by-voucher?voucher_id=${voucherId}`
      );

      if (!studentResponse.ok) {
        setError("Error al obtener los datos del estudiante.");
        setCheckingEligibility(false);
        return;
      }

      const studentData = await studentResponse.json();
      const studentId = studentData?.data?.id;

      if (!studentId) {
        setError("No se encontró el ID del estudiante.");
        setCheckingEligibility(false);
        return;
      }

      // Verificar si el estudiante tiene intentos aprobados
      const approvedResponse = await fetch(
        `/api/attempts/approved?student_id=${studentId}`
      );

      if (!approvedResponse.ok) {
        setError("Error al verificar la elegibilidad para el certificado.");
        setCheckingEligibility(false);
        return;
      }

      const approvedData = await approvedResponse.json();
      const attemptData: ApprovedAttemptData = approvedData.data;
      setHasApprovedAttempts(attemptData.hasApprovedAttempts);

      // Guardar los intentos aprobados en el estado
      if (
        attemptData.hasApprovedAttempts &&
        attemptData.approvedAttempts.length > 0
      ) {
        setApprovedAttempts(attemptData.approvedAttempts);
        console.log(
          "✅ Intentos aprobados guardados:",
          attemptData.approvedAttempts
        );
      } else {
        setApprovedAttempts([]);
      }
    } catch (err) {
      console.error("Error verificando elegibilidad:", err);
      setError("Error inesperado al verificar la elegibilidad.");
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleGetCertificate = async () => {
    // Verificar elegibilidad antes de proceder
    if (hasApprovedAttempts === false) {
      setError(
        "No puedes obtener el certificado porque no tienes ningún examen aprobado."
      );
      return;
    }

    if (hasApprovedAttempts === null) {
      setError(
        "No se pudo verificar tu elegibilidad. Por favor, intenta nuevamente."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener datos del student-data desde sessionStorage
      const session = JSON.parse(
        sessionStorage.getItem("student-data") || "{}"
      );
      const studentName = session?.state?.decryptedStudent?.fullname;
      const voucherId = session?.state?.decryptedStudent?.voucher_id;

      console.log("Datos de la sesión", session);
      console.log("Nombre del estudiante: ", studentName);

      if (!voucherId) {
        console.error("No se encontró el ID del voucher.");
        setError("No se encontró el ID del voucher.");
        setLoading(false);
        return;
      }

      // Obtener el student_id usando el voucher_id (de la tabla students)
      const studentResponse = await fetch(
        `/api/students/by-voucher?voucher_id=${voucherId}`
      );
      if (!studentResponse.ok) {
        console.error("Error al obtener los datos del estudiante");
        setError("Error al obtener los datos del estudiante.");
        setLoading(false);
        return;
      }

      const studentData = await studentResponse.json();
      const studentId = studentData?.data?.id;

      if (!studentId) {
        console.error("No se encontró el ID del estudiante en la respuesta.");
        setError("No se encontró el ID del estudiante.");
        setLoading(false);
        return;
      }

      console.log("ID del estudiante obtenido (tabla students): ", studentId);

      // Llamamos al endpoint para obtener los detalles del voucher
      const response = await fetch(`/api/vouchers/${voucherId}`);

      if (!response.ok) {
        console.error("Error al obtener los detalles del voucher");
        setError("Error al obtener los detalles del voucher.");
        setLoading(false);
        return;
      }

      // Parseamos la respuesta a JSON
      const voucherData = await response.json();

      if (voucherData?.data) {
        // Obtener el intento aprobado más reciente para usar su ID
        let examAttemptId = null;

        if (approvedAttempts.length > 0) {
          // Usar el intento más reciente (primero en la lista ya que está ordenado por fecha descendente)
          examAttemptId = approvedAttempts[0].id;
          console.log("✅ Usando exam_attempt_id:", examAttemptId);
          console.log("📋 Datos del intento:", approvedAttempts[0]);
        } else {
          console.warn("❌ No hay intentos aprobados disponibles");
          setError(
            "No se encontraron intentos aprobados para generar el certificado."
          );
          setLoading(false);
          return;
        }

        // Calcular la fecha de expiración (2 años después)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 2);
        const expirationDateString = expirationDate.toISOString().split("T")[0];

        // Validar o crear el registro del diploma antes de generar el PDF
        const diplomaResponse = await fetch("/api/diploma", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_attempt_id: examAttemptId, // Usar el ID del intento aprobado
            student_id: studentId, // Usar el ID de la tabla students
            certification_id: voucherData.data.certification_id,
            completion_date: new Date().toISOString().split("T")[0], // Solo la fecha (YYYY-MM-DD)
            expiration_date: expirationDateString, // Fecha de expiración (2 años después)
          }),
        });

        if (!diplomaResponse.ok) {
          const diplomaResponseText = await diplomaResponse.text();
          console.error("Error al validar/crear el diploma");
          setError(`Error al validar el diploma: ${diplomaResponseText}`);
          setLoading(false);
          return;
        }

        // Llamamos al endpoint para generar el certificado
        const certResponse = await fetch("/api/diploma/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: studentName,
            certificationName: voucherData.data.certification_name,
            expeditionDate: new Date().toISOString().split("T")[0], // Fecha de expedición por defecto (hoy)
            codigoVoucher: voucherData.data.code,
            URL_logo: voucherData.data.certification_logo_url,
          }),
        });

        if (!certResponse.ok) {
          console.error("Error al generar el certificado");
          setError("Error al generar el certificado.");
          setLoading(false);
          return;
        }

        // Aquí, descargamos el PDF directamente
        const certBlob = await certResponse.blob();
        const downloadUrl = URL.createObjectURL(certBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${studentName}-certificado.pdf`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error("Error inesperado", err);
      setError("Error inesperado al generar el certificado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Certificado de Finalización
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {hasApprovedAttempts === true
            ? "¡Felicitaciones! Has aprobado tu examen. Aquí podrás descargar tu certificado oficial de certificación."
            : "Felicidades por tu esfuerzo y dedicación. Aquí podrás descargar tu certificado oficial de certificación."}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {checkingEligibility ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">
              Verificando elegibilidad para el certificado...
            </p>
          </div>
        ) : hasApprovedAttempts === false ? (
          <div className="max-w-md text-center">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
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
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">
                Certificado No Disponible
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Para obtener tu certificado, debes aprobar el examen oficial de
                la certificación.
              </p>
              <p className="text-xs text-orange-600">
                Ve a la sección de &quot;Examen&quot; para presentar tu examen
                oficial.
              </p>
            </div>
            <Button
              disabled={true}
              className="bg-gray-400 cursor-not-allowed text-gray-600 font-medium px-8 py-3 text-lg"
            >
              <Award className="w-5 h-5 mr-2 opacity-50" />
              Certificado No Disponible
            </Button>
          </div>
        ) : hasApprovedAttempts === true ? (
          <Button
            onClick={handleGetCertificate}
            disabled={loading}
            className={`font-medium px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            {loading ? "Generando Certificado..." : "Obtener Certificado"}
          </Button>
        ) : (
          <div className="max-w-md text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">
                Error de Verificación
              </h3>
              <p className="text-sm text-red-700 mb-4">
                No se pudo verificar tu elegibilidad para el certificado.
              </p>
            </div>
            <Button
              onClick={checkCertificateEligibility}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
            >
              Reintentar Verificación
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
