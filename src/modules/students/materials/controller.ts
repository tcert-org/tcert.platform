import MaterialTable from "./table";

export async function getMaterialFromVoucher(
  voucher_id: number
): Promise<string | null> {
  if (!voucher_id || typeof voucher_id !== "number") {
    throw new Error("voucher_id inválido");
  }

  const table = new MaterialTable();
  const materialUrl = await table.getMaterialByVoucherId(voucher_id);

  if (!materialUrl) {
    throw new Error("Material no encontrado para este voucher");
  }

  return materialUrl;
}
