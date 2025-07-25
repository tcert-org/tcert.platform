"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function VoucherDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [voucher, setVoucher] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Obtener voucher
        const res = await fetch(`/api/vouchers/${id}`, { cache: "no-store" });
        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.error || "Error");
        setVoucher(result.data);

        // 2. Guardar en localStorage por si lo usas en otro lado
        localStorage.setItem("voucher_id", result.data.id);

        // 3. Obtener estudiante por voucher_id
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 bg-white rounded-lg shadow-md border">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 text-center">
        Información del Voucher
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-800 text-base">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Barcode className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Código:</strong> {voucher?.code}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <BookOpen className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Certificación:</strong>{" "}
              {voucher?.certification_name || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Email:</strong> {voucher?.email}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <BadgeCheck className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={
                  voucher?.used
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {voucher?.used ? "Disponible" : "No disponible"}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Fecha de compra:</strong>{" "}
              {voucher?.purchase_date
                ? new Date(voucher.purchase_date).toLocaleDateString("es-CO")
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Fecha de vencimiento:</strong>{" "}
              {voucher?.expiration_date
                ? new Date(voucher.expiration_date).toLocaleDateString("es-CO")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-10 border-t" />

      <h2 className="text-3xl font-bold mb-8 text-blue-900 text-center">
        Detalles del estudiante
      </h2>

      {student ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          <div className="flex items-center space-x-3">
            <User className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Nombre:</strong> {student.fullname}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Contact2 className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Tipo Documento:</strong> {student.document_type}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Correo:</strong> {student.email}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <IdCard className="text-blue-700 w-5 h-5" />
            <p>
              <strong>Documento:</strong> {student.document_number}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 italic">
          No se encontró un estudiante asociado a este voucher.
        </p>
      )}
    </main>
  );
}
