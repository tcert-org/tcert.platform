import PartnerTable, {
  PartnerRowType,
  PartnerInsertType,
  PartnerUpdateType,
  PartnerForDetail,
} from "./table";

const partnerTable = new PartnerTable();

export default class PartnerService {
  static async create(data: PartnerInsertType): Promise<PartnerRowType | null> {
    return await partnerTable.insert(data);
  }

  static async update(
    id: number,
    data: PartnerUpdateType
  ): Promise<PartnerRowType | null> {
    return await partnerTable.update(id, data);
  }

  static async getAllPartners(): Promise<PartnerRowType[]> {
    return await partnerTable.getAll();
  }

  static async getPartnerById(id: number): Promise<PartnerForDetail | null> {
    return await partnerTable.getPartnerById(id);
  }

  static async deletePartner(id: number): Promise<boolean> {
    return await partnerTable.delete(id);
  }
}
