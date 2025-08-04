"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CertificatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetCertificate = async () => {
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
        // Validar o crear el registro del diploma antes de generar el PDF
        const diplomaResponse = await fetch("/api/diploma", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_attempt_id: null, // Campo nullable según la tabla
            student_id: studentId, // Usar el ID de la tabla students
            certification_id: voucherData.data.certification_id,
            completion_date: new Date().toISOString().split("T")[0], // Solo la fecha (YYYY-MM-DD)
            diploma_url: null, // Dejamos null como mencionaste
            expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Solo la fecha, expira en 1 año
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
          Felicidades por tu esfuerzo y dedicación. Aquí podrás descargar tu
          certificado oficial de certificación.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button
          onClick={handleGetCertificate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? "Generando Certificado..." : "Obtener Certificado"}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
