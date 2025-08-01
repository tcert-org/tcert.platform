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
        console.log("Datos del voucher:", voucherData.data);

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
    <div className="flex flex-col gap-4 px-4 items-center text-center">
      <h1 className="text-2xl font-bold text-primary-700 -mt-8">
        Material de tu Certificación
      </h1>
      <p className="text-base text-gray-600">
        Felicidades por tu esfuerzo y dedicación. Aquí podrás descargar el
        certificado.
      </p>

      <Button onClick={handleGetCertificate} disabled={loading}>
        {loading ? "Generando Certificado..." : "Obtener Certificado"}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="w-full max-w-7xl mx-auto mt-8"></div>
    </div>
  );
}
