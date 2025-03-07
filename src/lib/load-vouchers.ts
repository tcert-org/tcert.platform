export const fetchVouchers = async (filters = {}, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
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
