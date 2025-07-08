"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { GeneralLoader } from "@/components/general-loader";
import FormVoucher from "@/components/form-voucher";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AssignVoucherPage() {
  const { getUser } = useUserStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      const user = await getUser();
      if (!user?.id) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/vouchers/quantity?partner_id=${user.id}`);
        const json = await res.json();
        const available = json?.data?.voucher_available ?? 0;

        if (available > 0) {
          setCanAccess(true);
        } else {
          toast.warning("No tienes vouchers disponibles para asignar.", {
            position: "top-center",
            autoClose: 2500,
            theme: "colored",
          });
          setTimeout(() => {
            router.replace("/dashboard/partner/voucher-administration");
          }, 4000); // ligeramente más largo que autoClose para garantizar visibilidad
        }
      } catch (err) {
        console.error("Error validando acceso:", err);
        toast.error("Error validando acceso. Intenta más tarde.", {
          position: "top-center",
          autoClose: 2500,
          theme: "colored",
        });
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2700);
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [getUser, router]);

  if (loading) return <GeneralLoader />;

  return (
    <>
      <ToastContainer />
      {canAccess ? (
        <div className="max-w-3xl mx-auto mt-10 px-4">
          <h1 className="text-2xl font-bold mb-6">Asignar nuevo voucher</h1>
          <FormVoucher />
        </div>
      ) : null}
    </>
  );
}
