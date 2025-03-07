"use client";
import { useState, useEffect } from "react";

const fetchVouchers = async (
  filters = {},
  page = 1,
  limit = 10,
  orderBy = "created_at",
  orderDir = "DESC"
) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      orderBy,
      orderDir,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/vouchers?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return { data: [], total: 0, page, totalPages: 0 };
  }
};

const VoucherTable = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderBy, setOrderBy] = useState("created_at");
  const [orderDir, setOrderDir] = useState("DESC");

  useEffect(() => {
    const loadVouchers = async () => {
      const result = await fetchVouchers(filters, page, 10, orderBy, orderDir);
      setVouchers(result.data);
      setTotalPages(result.totalPages);
    };

    loadVouchers();
  }, [filters, page, orderBy, orderDir]);

  // 📌 Función para cambiar el orden de las columnas
  const toggleSort = (column: any) => {
    if (orderBy === column) {
      setOrderDir(orderDir === "ASC" ? "DESC" : "ASC");
    } else {
      setOrderBy(column);
      setOrderDir("ASC");
    }
  };

  return (
    <div>
      <h2>Vouchers</h2>

      <div>
        <input
          type="text"
          placeholder="Buscar código"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, code: e.target.value }))
          }
        />
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          Prev
        </button>
        <span>
          {" "}
          Página {page} de {totalPages}{" "}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort("id")}>ID</th>
            <th onClick={() => toggleSort("code")}>Código</th>
            <th onClick={() => toggleSort("email")}>Email</th>
            <th onClick={() => toggleSort("used")}>Usado</th>
            <th onClick={() => toggleSort("student.fullname")}>Estudiante</th>
            <th onClick={() => toggleSort("partner.name")}>Partner</th>
            <th onClick={() => toggleSort("certification.name")}>
              Certificación
            </th>
            <th onClick={() => toggleSort("status.name")}>Estado</th>
            <th onClick={() => toggleSort("created_at")}>Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher: any) => (
            <tr key={voucher.id}>
              <td>{voucher.id}</td>
              <td>{voucher.code}</td>
              <td>{voucher.email}</td>
              <td>{voucher.used ? "Sí" : "No"}</td>
              <td>
                {voucher.student ? voucher.student.fullname : "Sin estudiante"}
              </td>
              <td>{voucher.partner ? voucher.partner.name : "Sin partner"}</td>
              <td>
                {voucher.certification
                  ? voucher.certification.name
                  : "Sin certificación"}
              </td>
              <td>{voucher.status ? voucher.status.name : "Sin estado"}</td>
              <td>{new Date(voucher.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;
