"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Select, { SingleValue } from "react-select";
import { useUserStore } from "@/stores/user-store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type VoucherFormData = {
  partner_id: string;
  certification_id: string;
  status_id: string;
  email: string;
  used: boolean;
  expiration_dates: string;
};

type OptionType = {
  value: string;
  label: string;
};

function getDatePlusTwoYears() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date.toISOString().split("T")[0];
}

export default function VoucherForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: { used: false },
  });

  const router = useRouter();
  const { decryptedUser, getUser } = useUserStore();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<OptionType[]>([]);
  const [statuses, setStatuses] = useState<OptionType[]>([]);

  useEffect(() => {
    const init = async () => {
      await getUser();
      setReady(true);
      setValue("expiration_dates", getDatePlusTwoYears());
    };
    init();
  }, [setValue, getUser]);

  useEffect(() => {
    fetch("/api/vouchers/certifications")
      .then((r) => r.json())
      .then((d) =>
        setCertifications(
          (d.data || []).map((c: any) => ({ value: c.id, label: c.name }))
        )
      );
  }, []);

  useEffect(() => {
    fetch("/api/vouchers/statutes")
      .then((r) => r.json())
      .then((d) => {
        const options = (d.data || []).map((item: any) => ({
          value: item.id,
          label: item.name,
        }));

        setStatuses(options);

        const defaultOption = options.find(
          (item) => item.label.toLowerCase() === "sin presentar"
        );

        if (defaultOption) {
          setValue("status_id", defaultOption.value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      });
  }, [setValue]);

  const onSubmit = async (data: VoucherFormData) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...data,
        partner_id: String(decryptedUser!.id),
        certification_id: String(data.certification_id),
        status_id: String(data.status_id),
        used: false,
      };

      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      const result = txt ? JSON.parse(txt) : {};
      const backendErr = result.error || result.message;

      if (!res.ok || backendErr) {
        setErrorMessage(backendErr?.toString() || "Error al crear voucher");
        return;
      }

      toast.success("✅ Voucher creado exitosamente", {
        position: "top-center",
        theme: "colored",
      });

      reset();
      setTimeout(
        () => router.push("/dashboard/partner/voucher-administration"),
        4000
      );
    } catch {
      setErrorMessage("Error inesperado al crear el voucher.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !decryptedUser)
    return <p className="text-center mt-4">Cargando usuario...</p>;

  return (
    <section className="flex justify-center items-start p-6">
      <ToastContainer />
      <div className="w-full max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <input
            type="hidden"
            {...register("partner_id")}
            value={decryptedUser.id}
          />
          <input type="hidden" {...register("status_id")} />
          <input type="hidden" {...register("expiration_dates")} />
          <input type="hidden" {...register("used")} value="false" />

          <div>
            <Label>Certificación</Label>
            <Controller
              control={control}
              name="certification_id"
              rules={{ required: "Debe seleccionar una certificación" }}
              render={({ field }) => (
                <>
                  <Select
                    options={certifications}
                    placeholder="Seleccione una certificación"
                    isSearchable
                    value={certifications.find((o) => o.value === field.value)}
                    onChange={(o) => field.onChange(o?.value || "")}
                  />
                  {errors.certification_id && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.certification_id.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "El correo es obligatorio",
              })}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {loading ? "Guardando..." : "Crear Voucher"}
          </Button>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm text-center">
              <strong className="font-bold">Error:</strong>{" "}
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
