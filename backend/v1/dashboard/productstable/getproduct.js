const knex = require("knex");
const knexConfig = require("../../../knexfile");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const product = require("../../../models/Product");
const getproduct = async (req, res) => {
  const { page = 1, limit = 5, search = "", filters = "{}" } = req.query;
  const offset = (page - 1) * limit;
  try {
    const parsedFilters = JSON.parse(filters);
    const user_id = req.id;
    const personalData = await db("userdetails")
      .select("role", "region")
      .where("user_id", user_id)
      .first();
    const isAdmin = personalData?.role === "admin";
    // const data1 = await product
    //   .query()
    //   .select(
    //     "product_image",
    //     "product_id",
    //     "product_name",
    //     "status",
    //     "quantity_in_stock as quantity",
    //     "unit_price as unit",
    //     "category_name as category",
    //     "created_at"
    //   );
    // console.log(data1);

    let query = db("products as p")
      .select(
        "p.product_image",
        "p.product_id",
        "p.product_name",
        "p.status",
        "p.quantity_in_stock as quantity",
        "p.unit_price as unit",
        "c.category_name as category",
        "p.created_at",
        "pd.region",
        db.raw("GROUP_CONCAT(v.vendor_id) as vendor_id"),
        db.raw("GROUP_CONCAT(v.vendor_name) as vendor_names")
      )
      .leftJoin("categories as c", "p.category_id", "c.category_id")
      .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
      .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id")
      .leftJoin("product_region as pd ", "pd.product_id", "p.product_id");
    if (!isAdmin) {
      query = query
        .leftJoin("product_region as pr", "pr.product_id", "p.product_id")
        .where("pr.region", personalData?.region);
    }
    query = applyFilters(query, search, parsedFilters);
    query = query
      .groupBy("p.product_id", "pd.region")
      .limit(limit)
      .offset(offset);
    const data = await query;

    let totalQuery = db("products as p")
      .countDistinct("p.product_id as total")
      .leftJoin("categories as c", "p.category_id", "c.category_id")
      .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
      .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id")
      .whereNot("p.status", "99");

    if (!isAdmin) {
      totalQuery = totalQuery
        .leftJoin("product_region as pr", "pr.product_id", "p.product_id")
        .where("pr.region", personalData?.region);
    }

    totalQuery = applyFilters(totalQuery, search, parsedFilters);

    const total = await totalQuery;
    // console.log(data);

    res.json({
      data,
      total: total[0]?.total || 0,
      page,
    });
  } catch (err) {
    console.error("Error fetching product data:", err);
    res.status(500).json(encryptData({ error: "Error fetching product data" }));
  }
};
function applyFilters(query, search, filters) {
  if (search.trim()) {
    query.andWhere((builder) => {
      builder
        .orWhere("p.product_name", "like", `%${search.trim()}%`)
        .orWhere("c.category_name", "like", `%${search.trim()}%`)
        .orWhere("v.vendor_name", "like", `%${search.trim()}%`);
    });
  }
  const filterFields = ["vendor_name", "product_name", "category_name"];
  filterFields.forEach((field) => {
    if (filters[field] && typeof filters[field] === "string") {
      query.andWhere(`v.${field}`, "like", `%${filters[field]}%`);
    }
  });
  return query;
}

module.exports = getproduct;
