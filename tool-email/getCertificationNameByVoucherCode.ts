import { supabase } from "@/lib/database/conection";

export async function getCertificationNameByVoucherCode(code: string): Promise<string | null> {
	// Buscar el voucher por código y obtener el certification_id
	const { data: voucher, error: voucherError } = await supabase
		.from("vouchers")
		.select("certification_id")
		.eq("code", code)
		.single();
	if (voucherError || !voucher || !voucher.certification_id) return null;

	// Buscar el nombre de la certificación
	const { data: cert, error: certError } = await supabase
		.from("certifications")
		.select("name")
		.eq("id", voucher.certification_id)
		.single();
	if (certError || !cert) return null;
	return cert.name || null;
}
