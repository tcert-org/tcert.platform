"use client";
import { PartnerForDetail } from "@/modules/partners/table";
import { useEffect, useState, use } from "react";

interface PageProps {
  params: Promise<{ id: string }>; // params ahora es una Promesa
}

const PartnerPage = ({ params }: PageProps) => {
  const { id } = use(params); // Desempaquetamos params con el hook use()
  const [partnerData, setPartnerData] = useState<PartnerForDetail | null>(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const response = await fetch(`/api/partners?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch partner data");
        }
        const data: PartnerForDetail = await response.json();
        setPartnerData(data);
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };

    fetchPartnerData();
  }, [id]);

  return (
    <div>
      <h1>Detalles del Partner</h1>
      <p>ID: {id}</p>
      {partnerData ? (
        <pre>{JSON.stringify(partnerData, null, 2)}</pre>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default PartnerPage;
