import ExamsTable from "./table";

export async function getExamsByVoucher(voucher_id: number) {
  if (!voucher_id || typeof voucher_id !== "number") {
    throw new Error("voucher_id invalido");
  }

  const table = new ExamsTable();
  const exams = await table.getExamsByVoucherId(voucher_id);

  if (!exams || exams.length === 0) {
    throw new Error("No se encontraron examenes");
  }

  return exams;
}

export async function getRandomExamForVoucher(voucher_id: number) {
  if (!voucher_id || typeof voucher_id !== "number") {
    throw new Error("voucher_id invalido");
  }

  const table = new ExamsTable();
  const exam = await table.getRandomActiveExam(voucher_id);

  if (!exam) {
    throw new Error("No se encontró un examen disponible");
  }

  return exam;
}
