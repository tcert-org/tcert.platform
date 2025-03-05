import RoleTable, {
  RoleRowType,
  RoleInsertType,
  RoleUpdateType,
} from "./table";

const roleTable = new RoleTable();

export default class RoleService {
  static async create(data: RoleInsertType): Promise<RoleRowType | null> {
    return await roleTable.insert(data);
  }

  static async update(
    id: number,
    data: RoleUpdateType
  ): Promise<RoleRowType | null> {
    return await roleTable.update(id, data);
  }

  static async getAllRoles(): Promise<RoleRowType[]> {
    return await roleTable.getAll();
  }

  static async getRoleById(id: number): Promise<RoleRowType | null> {
    return await roleTable.getById(id);
  }

  static async deleteRole(id: number): Promise<boolean> {
    return await roleTable.delete(id);
  }
}
