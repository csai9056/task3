const knex = require("knex");
const knexConfig = require("../../../knexfile");
const encryptData = require("../../../middlewares/encrypt");
const { build } = require("joi");
const db = knex(knexConfig);
const getproduct = async (req, res) => {
  const { page = 1, limit = 5, search = "", filters = "{}" } = req.query;
  const offset = (page - 1) * limit;
  let data;
  let total;
  try {
    const parsedFilters = JSON.parse(filters);
    const user_id = req.id;
    const personalData = await db("userdetails")
      .select("*")
      .where("user_id", user_id)
      .first();
    if (personalData?.role === "admin") {
      console.log("admin");

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
          db.raw("GROUP_CONCAT(v.vendor_id) as vendor_id"),
          db.raw("GROUP_CONCAT(v.vendor_name) as vendor_names")
        )
        .leftJoin("categories as c", "p.category_id", "c.category_id")
        .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
        .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id");
      if (search && search.trim()) {
        query = query.andWhere((builder) => {
          builder
            .orWhere("p.product_name", "like", `%${search.trim()}%`)
            .orWhere("c.category_name", "like", `%${search.trim()}%`)
            .orWhere("v.vendor_name", "like", `%${search.trim()}%`);
        });
      }
      if (
        parsedFilters.vendor_name &&
        typeof parsedFilters.vendor_name === "string"
      ) {
        query = query.andWhere(
          "v.vendor_name",
          "like",
          `%${parsedFilters.vendor_name}%`
        );
      }
      if (
        parsedFilters.product_name &&
        typeof parsedFilters.product_name === "string"
      ) {
        query = query.andWhere(
          "p.product_name",
          "like",
          `%${parsedFilters.product_name}%`
        );
      }
      if (
        parsedFilters.category_name &&
        typeof parsedFilters.category_name === "string"
      ) {
        query = query.andWhere(
          "c.category_name",
          "like",
          `%${parsedFilters.category_name}%`
        );
      }
      const query1 = query;
      query = query.groupBy("p.product_id").limit(limit).offset(offset);
      data = await query;
      let totalQuery = db("products as p")
        .countDistinct("p.product_id as total")
        .leftJoin("categories as c", "p.category_id", "c.category_id")
        .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
        .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id")
        .whereNot("p.status", "99");
      if (search && search.trim()) {
        totalQuery = totalQuery.andWhere((builder) => {
          builder
            .orWhere("p.product_name", "like", `%${search.trim()}%`)
            .orWhere("c.category_name", "like", `%${search.trim()}%`)
            .orWhere("v.vendor_name", "like", `%${search.trim()}%`);
        });
      }

      if (
        parsedFilters.vendor_name &&
        typeof parsedFilters.vendor_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "v.vendor_name",
          "like",
          `%${parsedFilters.vendor_name}%`
        );
      }
      if (
        parsedFilters.product_name &&
        typeof parsedFilters.product_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "p.product_name",
          "like",
          `%${parsedFilters.product_name}%`
        );
      }
      if (
        parsedFilters.category_name &&
        typeof parsedFilters.category_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "c.category_name",
          "like",
          `%${parsedFilters.category_name}%`
        );
      }

      let total = await totalQuery;
      res.json(
        encryptData({
          data: data,
          total: total[0]?.total,
          page: page,
        })
      );
    } else {
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
          db.raw("GROUP_CONCAT(v.vendor_id) as vendor_id"),
          db.raw("GROUP_CONCAT(v.vendor_name) as vendor_names")
        )
        .leftJoin("categories as c", "p.category_id", "c.category_id")
        .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
        .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id")
        .leftJoin("product_region as pr ", " pr.product_id", "p.product_id")
        .whereNot("p.status", "99")
        .andWhere((builder) => {
          builder.orWhere("pr.region", personalData?.region);
        });

      if (search && search.trim()) {
        query = query.andWhere((builder) => {
          builder
            .orWhere("p.product_name", "like", `%${search.trim()}%`)
            .orWhere("c.category_name", "like", `%${search.trim()}%`)
            .orWhere("v.vendor_name", "like", `%${search.trim()}%`);
        });
      }
      if (
        parsedFilters.vendor_name &&
        typeof parsedFilters.vendor_name === "string"
      ) {
        query = query.andWhere(
          "v.vendor_name",
          "like",
          `%${parsedFilters.vendor_name}%`
        );
      }
      if (
        parsedFilters.product_name &&
        typeof parsedFilters.product_name === "string"
      ) {
        query = query.andWhere(
          "p.product_name",
          "like",
          `%${parsedFilters.product_name}%`
        );
      }
      if (
        parsedFilters.category_name &&
        typeof parsedFilters.category_name === "string"
      ) {
        query = query.andWhere(
          "c.category_name",
          "like",
          `%${parsedFilters.category_name}%`
        );
      }

      query = query.groupBy("p.product_id").limit(limit).offset(offset);
      data = await query;
      let totalQuery = db("products as p")
        .countDistinct("p.product_id as total")
        .leftJoin("categories as c", "p.category_id", "c.category_id")
        .leftJoin("product_to_vendor as pv", "p.product_id", "pv.product_id")
        .leftJoin("vendors as v", "pv.vendor_id", "v.vendor_id")
        .leftJoin("product_region as pr ", " pr.product_id", "p.product_id")

        .whereNot("p.status", "99")
        .andWhere((builder) => {
          builder.orWhere("pr.region", personalData?.region);
        });
      if (search && search.trim()) {
        totalQuery = totalQuery.andWhere((builder) => {
          builder
            .orWhere("p.product_name", "like", `%${search.trim()}%`)
            .orWhere("c.category_name", "like", `%${search.trim()}%`)
            .orWhere("v.vendor_name", "like", `%${search.trim()}%`);
        });
      }

      if (
        parsedFilters.vendor_name &&
        typeof parsedFilters.vendor_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "v.vendor_name",
          "like",
          `%${parsedFilters.vendor_name}%`
        );
      }
      if (
        parsedFilters.product_name &&
        typeof parsedFilters.product_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "p.product_name",
          "like",
          `%${parsedFilters.product_name}%`
        );
      }
      if (
        parsedFilters.category_name &&
        typeof parsedFilters.category_name === "string"
      ) {
        totalQuery = totalQuery.andWhere(
          "c.category_name",
          "like",
          `%${parsedFilters.category_name}%`
        );
      }

      let total = await totalQuery;
      res.json(
        encryptData({
          data: data,
          total: total[0]?.total,
          page: page,
        })
      );
    }
  } catch (err) {
    console.error("Error fetching product data:", err);
    res.status(500).json(encryptData({ error: "Error fetching product data" }));
  }
};

module.exports = getproduct;
