import SimulatorTable from "./table";

export async function getSimulatorsByVoucher(voucher_id: number) {
  if (!voucher_id || typeof voucher_id !== "number") {
    throw new Error("voucher_id inválido");
  }

  const table = new SimulatorTable();
  const simulators = await table.getSimulatorsByVoucherId(voucher_id);

  if (!simulators || simulators.length === 0) {
    throw new Error("No se encontraron simuladores");
  }

  return simulators;
}
