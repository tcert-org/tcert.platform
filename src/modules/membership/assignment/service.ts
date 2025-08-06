import { MembershipAssignmentTable } from "./table";
import VoucherCountTable from "@/modules/vouchers/quantity/table";

export class MembershipAssignmentService {
  table = new MembershipAssignmentTable();
  voucherCountTable = new VoucherCountTable();

  async assignMembershipsToPartners() {
    const partners = await this.table.getPartners();
    const memberships = await this.table.getMemberships();

    for (const partner of partners) {
      const counts = await this.voucherCountTable.getVoucherCounts(partner.id);
      const total = counts.voucher_purchased ?? 0;

      const matchedMembership = memberships.find(
        (m) => total >= m.count_from && total <= m.count_up
      );

      if (matchedMembership) {
        await this.table.updateUserMembership(partner.id, matchedMembership.id);
      }
    }

    return { message: "Membresías asignadas correctamente" };
  }
}
