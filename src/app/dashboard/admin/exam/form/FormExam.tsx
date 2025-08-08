"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

type OptionType = { value: string; label: string };

type ExamFormData = {
  name_exam: string;
  certification_id: string;
  type: "simulador" | "examen";
  attempts: number;
  time_limit: number;
  active: string;
};

const typeOptions: OptionType[] = [
  { value: "simulador", label: "Simulador" },
  { value: "examen", label: "Examen" },
];

export default function FormExam({
  onExamCreated,
}: {
  onExamCreated: (id: number) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    defaultValues: {
      active: "activo",
      attempts: 1,
      time_limit: 60,
      type: "simulador",
    },
  });

  const [certifications, setCertifications] = useState<OptionType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [examCreated, setExamCreated] = useState<null | {
    id: number;
    name: string;
  }>(null);

  useEffect(() => {
    fetch("/api/vouchers/certifications")
      .then((r) => r.json())
      .then((d) => {
        const certs = (d.data || []).map((c: any) => ({
          value: c.id.toString(),
          label: c.name,
        }));
        setCertifications(certs);
      });
  }, []);

  const typeValue = useWatch({
    control,
    name: "type",
  });

  useEffect(() => {
    if (typeValue === "simulador") {
      setValue("attempts", 0, { shouldValidate: true });
      setValue("time_limit", 0, { shouldValidate: true });
    } else if (typeValue === "examen") {
      setValue("attempts", 1, { shouldValidate: false });
      setValue("time_limit", 60, { shouldValidate: false });
    }
  }, [typeValue, setValue]);

  const onSubmit = async (data: ExamFormData) => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const dataToSend: any = {
        ...data,
        certification_id: Number(data.certification_id),
        simulator: data.type === "simulador",
        active: data.active === "activo",
      };
      delete dataToSend.type;

      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setErrorMessage(result.error || "No se pudo crear el examen");
        toast.error(result.error || "No se pudo crear el examen");
        setSubmitting(false);
        return;
      }
      reset();
      setValue("active", "activo");
      toast.success("Examen creado correctamente");
      if (result.data && result.data.id) {
        onExamCreated(result.data.id);
        setExamCreated({ id: result.data.id, name: data.name_exam });
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Error desconocido");
      toast.error(e.message || "Error desconocido");
      setSubmitting(false);
    }
  };

  const handleTerminado = () => {
    toast.warn("¡Formulario de examen terminado!", {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
    });
    setTimeout(() => {
      router.push("/dashboard/admin/exam");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-0 mt-[-1.5rem] md:mt-[-2.5rem]">
      <ToastContainer position="top-center" theme="colored" />
      {examCreated ? (
        <div className="w-full flex items-center justify-center gap-4">
          <div className="w-full max-w-2xl mx-auto bg-green-100 border border-green-300 px-6 py-3 rounded-lg flex items-center gap-3 shadow-none">
            <span className="inline-block bg-green-200 text-green-700 px-2 py-1 rounded font-semibold text-xs uppercase tracking-wide mr-3">
              Examen creado
            </span>
            <span className="font-bold text-base text-gray-800 flex-1 truncate">
              {examCreated.name}
            </span>
            <span className="text-gray-400 text-xs ml-auto">
              ID: {examCreated.id}
            </span>
          </div>
          <Button
            className="h-10 px-5 text-base font-semibold bg-green-700 text-white hover:bg-green-800 transition"
            onClick={handleTerminado}
          >
            Terminado
          </Button>
        </div>
      ) : (
        <Card className="w-full max-w-full sm:max-w-3xl md:max-w-5xl xl:max-w-[1400px] rounded-2xl shadow-2xl px-2 sm:px-4 md:px-8 xl:px-0 py-3 md:py-5 xl:py-8 bg-card flex flex-col justify-center">
          <CardContent className="h-full flex flex-col justify-center">
            <CardTitle className=" mb-4 text-xl md:text-2xl">
              Información del examen
            </CardTitle>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-3 gap-x-3 md:gap-x-6 xl:gap-x-10 gap-y-2 md:gap-y-4 xl:gap-y-6 w-full items-end"
            >
              {/* Campo oculto para "activo" */}
              <input type="hidden" {...register("active")} value="activo" />

              <div>
                <Label className="text-base md:text-lg" htmlFor="name_exam">
                  Nombre del Examen
                </Label>
                <Input
                  id="name_exam"
                  {...register("name_exam", { required: "Campo obligatorio" })}
                  placeholder="Asigna un nombre"
                />
                {errors.name_exam && (
                  <span className="text-red-500 text-xs">
                    {errors.name_exam.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-base md:text-lg">Certificación</Label>
                <Controller
                  control={control}
                  name="certification_id"
                  rules={{ required: "Seleccione una certificación" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="certification_id">
                        <SelectValue placeholder="Selecciona una certificación" />
                      </SelectTrigger>
                      <SelectContent>
                        {certifications.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.certification_id && (
                  <span className="text-red-500 text-xs">
                    {errors.certification_id.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-base md:text-lg">Tipo</Label>
                <Controller
                  control={control}
                  name="type"
                  rules={{ required: "Seleccione el tipo de examen" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <span className="text-red-500 text-xs">
                    {errors.type.message}
                  </span>
                )}
              </div>
              {typeValue === "examen" && (
                <div>
                  <Label className="text-base md:text-lg" htmlFor="attempts">
                    Intentos
                  </Label>
                  <Input
                    id="attempts"
                    type="number"
                    min={1}
                    {...register("attempts", {
                      required:
                        typeValue === "examen" ? "Campo obligatorio" : false,
                      valueAsNumber: true,
                      min: { value: 1, message: "Debe ser mínimo 1" },
                    })}
                    placeholder="Número de intentos"
                  />
                  {errors.attempts && (
                    <span className="text-red-500 text-xs">
                      {errors.attempts.message}
                    </span>
                  )}
                </div>
              )}
              {typeValue === "examen" && (
                <div>
                  <Label className="text-base md:text-lg" htmlFor="time_limit">
                    Tiempo (min)
                  </Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min={1}
                    {...register("time_limit", {
                      required:
                        typeValue === "examen" ? "Campo obligatorio" : false,
                      valueAsNumber: true,
                      min: { value: 1, message: "Debe ser mínimo 1 minuto" },
                    })}
                    placeholder="Minutos"
                  />
                  {errors.time_limit && (
                    <span className="text-red-500 text-xs">
                      {errors.time_limit.message}
                    </span>
                  )}
                </div>
              )}
              <div className="md:col-span-3 flex justify-center mt-2">
                <Button
                  type="submit"
                  className="min-w-[220px] px-8 py-4 text-lg"
                  disabled={isSubmitting || submitting}
                >
                  {isSubmitting || submitting ? "Guardado" : "Guardar"}
                </Button>
              </div>
              {errorMessage && (
                <div className="md:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm text-center mt-2">
                  <strong className="font-bold">Error:</strong> {errorMessage}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
