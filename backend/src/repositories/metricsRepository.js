const db = require('../db');

const revenueByDay = async (start, end) => {
  const res = await db.query(
    `SELECT DATE(created_at) as day, SUM(total_amount) as revenue, COUNT(*) as sales
     FROM sales
     WHERE sale_status_desc = 'COMPLETED'
       AND created_at >= $1::timestamp
       AND created_at <= $2::timestamp
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at)`,
    [start, end]
  );
  return res.rows;
};

const topProducts = async (start, end, limit = 10) => {
  const res = await db.query(
    `SELECT p.id, p.name, SUM(ps.quantity) as qty, SUM(ps.total_price) as revenue
     FROM product_sales ps
     JOIN products p ON p.id = ps.product_id
     JOIN sales s ON s.id = ps.sale_id
     WHERE s.sale_status_desc = 'COMPLETED'
       AND s.created_at >= $1::timestamp
       AND s.created_at <= $2::timestamp
     GROUP BY p.id, p.name
     ORDER BY qty DESC
     LIMIT $3`,
    [start, end, limit]
  );
  return res.rows;
};

const salesByChannel = async (start, end) => {
  const res = await db.query(
    `SELECT c.id, c.name, COUNT(*) as sales, SUM(s.total_amount) as revenue,
      AVG(s.delivery_seconds) AS avg_delivery_seconds
     FROM sales s
     JOIN channels c ON c.id = s.channel_id
     WHERE s.sale_status_desc = 'COMPLETED'
       AND s.created_at >= $1::timestamp
       AND s.created_at <= $2::timestamp
     GROUP BY c.id, c.name
     ORDER BY sales DESC`,
    [start, end]
  );
  return res.rows;
};

module.exports = {
  revenueByDay,
  topProducts,
  salesByChannel
};


// ticket average grouped by 'channel' or 'store'
const ticketAverage = async (group, start, end) => {
  if (group === 'channel') {
    const res = await db.query(
      `SELECT c.id, c.name as group_name, COUNT(*) as orders, SUM(s.total_amount) as revenue,
              SUM(s.total_amount)::numeric/NULLIF(COUNT(*),0) AS ticket_avg
       FROM sales s
       JOIN channels c ON c.id = s.channel_id
       WHERE s.sale_status_desc = 'COMPLETED' AND s.created_at >= $1::timestamp AND s.created_at <= $2::timestamp
       GROUP BY c.id, c.name
       ORDER BY ticket_avg DESC`,
      [start, end]
    );
    return res.rows;
  } else if (group === 'store') {
    const res = await db.query(
      `SELECT s.store_id as id, st.name as group_name, COUNT(*) as orders, SUM(s.total_amount) as revenue,
              SUM(s.total_amount)::numeric/NULLIF(COUNT(*),0) AS ticket_avg
       FROM sales s
       LEFT JOIN stores st ON st.id = s.store_id
       WHERE s.sale_status_desc = 'COMPLETED' AND s.created_at >= $1::timestamp AND s.created_at <= $2::timestamp
       GROUP BY s.store_id, st.name
       ORDER BY ticket_avg DESC`,
      [start, end]
    );
    return res.rows;
  } else {
    throw new Error('group must be channel or store');
  }
};

// decomposition between two periods A and B by group (channel/store)
const decomposeMixWithin = async (group, a_start, a_end, b_start, b_end) => {
  // This query returns: delta_avg_total, effect_within, effect_mix
  // Uses group key depending on requested group
  const joinClause = group === 'channel'
    ? `JOIN channels g ON g.id = s.channel_id`
    : `LEFT JOIN stores g ON g.id = s.store_id`;

  const sql = `WITH a AS (
      SELECT ${group === 'channel' ? 's.channel_id AS gid' : 's.store_id AS gid'},
        COUNT(*)::numeric AS orders_a,
        SUM(s.total_amount)::numeric AS rev_a,
        SUM(s.total_amount)/NULLIF(COUNT(*),0) AS avg_a
      FROM sales s
      WHERE s.sale_status_desc = 'COMPLETED' AND s.created_at BETWEEN $1::timestamp AND $2::timestamp
      GROUP BY gid
    ),
    b AS (
      SELECT ${group === 'channel' ? 's.channel_id AS gid' : 's.store_id AS gid'},
        COUNT(*)::numeric AS orders_b,
        SUM(s.total_amount)::numeric AS rev_b,
        SUM(s.total_amount)/NULLIF(COUNT(*),0) AS avg_b
      FROM sales s
      WHERE s.sale_status_desc = 'COMPLETED' AND s.created_at BETWEEN $3::timestamp AND $4::timestamp
      GROUP BY gid
    ),
    totals AS (
      SELECT (SELECT COALESCE(SUM(orders_a),0) FROM a) AS tot_orders_a,
             (SELECT COALESCE(SUM(orders_b),0) FROM b) AS tot_orders_b
    )
    SELECT
      ( (SELECT COALESCE(SUM(rev_b)/NULLIF(SUM(orders_b),0),0) FROM b) - (SELECT COALESCE(SUM(rev_a)/NULLIF(SUM(orders_a),0),0) FROM a) ) AS delta_avg_total,
      SUM( (COALESCE(b.avg_b,0) - COALESCE(a.avg_a,0)) * (COALESCE(a.orders_a,0) / NULLIF((SELECT tot_orders_a FROM totals),0)) ) AS effect_within,
      SUM( COALESCE(b.avg_b,0) * ( (COALESCE(b.orders_b,0) / NULLIF((SELECT tot_orders_b FROM totals),0)) - (COALESCE(a.orders_a,0) / NULLIF((SELECT tot_orders_a FROM totals),0)) ) ) AS effect_mix
    FROM (SELECT gid, orders_a, rev_a, avg_a FROM a) a
    FULL JOIN (SELECT gid, orders_b, rev_b, avg_b FROM b) b USING (gid);
  `;

  const res = await db.query(sql, [a_start, a_end, b_start, b_end]);
  return res.rows[0];
};

module.exports = {
  revenueByDay,
  topProducts,
  salesByChannel,
  ticketAverage,
  decomposeMixWithin
};

// product margins: attempts to use products.cost_price if present; otherwise uses assumed_cost_pct (fraction of price)
const productMargins = async (start, end, limit = 50, assumed_cost_pct = 0.3, product_id = null) => {
  // check if products.cost_price exists
  const col = await db.query(`SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price' LIMIT 1`);
  const hasCost = col.rowCount > 0;

  if (hasCost) {
    const sql = `SELECT p.id, p.name as product_name, SUM(ps.quantity) AS qty, SUM(ps.total_price) AS revenue,
      AVG(ps.base_price) AS avg_price, SUM(ps.quantity * COALESCE(p.cost_price,0)) AS cost_total,
      SUM(ps.total_price) - SUM(ps.quantity * COALESCE(p.cost_price,0)) AS margin_abs,
      CASE WHEN SUM(ps.total_price)=0 THEN 0 ELSE (SUM(ps.total_price) - SUM(ps.quantity * COALESCE(p.cost_price,0))) / SUM(ps.total_price) END AS margin_pct,
      'product' AS cost_source
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      JOIN sales s ON s.id = ps.sale_id
  WHERE s.sale_status_desc = 'COMPLETED' AND DATE(s.created_at) BETWEEN $1::date AND $2::date
  ${product_id ? 'AND p.id = $5' : ''}
      GROUP BY p.id, p.name
      ORDER BY margin_pct ASC NULLS LAST
      LIMIT $3`;
    const params = product_id ? [start, end, limit, assumed_cost_pct, product_id] : [start, end, limit, assumed_cost_pct];
    const res = await db.query(sql, params);
    return res.rows;
  } else {
    // use assumed cost percentage of average price
    const sql = `SELECT p.id, p.name as product_name, SUM(ps.quantity) AS qty, SUM(ps.total_price) AS revenue,
      AVG(ps.base_price) AS avg_price, SUM(ps.total_price) * $3 AS cost_total,
      SUM(ps.total_price) - SUM(ps.total_price) * $3 AS margin_abs,
      CASE WHEN SUM(ps.total_price)=0 THEN 0 ELSE (SUM(ps.total_price) - SUM(ps.total_price) * $3) / SUM(ps.total_price) END AS margin_pct,
      'assumed' AS cost_source
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      JOIN sales s ON s.id = ps.sale_id
  WHERE s.sale_status_desc = 'COMPLETED' AND DATE(s.created_at) BETWEEN $1::date AND $2::date
  ${product_id ? 'AND p.id = $5' : ''}
      GROUP BY p.id, p.name
      ORDER BY margin_pct ASC NULLS LAST
      LIMIT $4`;
    const params = product_id ? [start, end, assumed_cost_pct, limit, product_id] : [start, end, assumed_cost_pct, limit];
    const res = await db.query(sql, params);
    return res.rows;
  }
};

module.exports.productMargins = productMargins;

// average delivery time grouped by day-of-week and hour, optional filters by channel/store
const deliveryTimes = async (start, end, channel_id = null, store_id = null) => {
  const sql = `SELECT
    EXTRACT(DOW FROM s.created_at)::int AS dow,
    EXTRACT(HOUR FROM s.created_at)::int AS hour,
    AVG(s.delivery_seconds)::numeric AS avg_delivery_seconds,
    COUNT(*) AS orders
  FROM sales s
  WHERE s.sale_status_desc = 'COMPLETED'
    AND s.created_at BETWEEN $1::timestamp AND $2::timestamp
    AND s.delivery_seconds IS NOT NULL
    AND ($3::int IS NULL OR s.channel_id = $3::int)
    AND ($4::int IS NULL OR s.store_id = $4::int)
  GROUP BY dow, hour
  ORDER BY dow, hour`;
  const res = await db.query(sql, [start, end, channel_id, store_id]);
  return res.rows;
};

module.exports.deliveryTimes = deliveryTimes;

// top products in a specific time window, optional filters: channel_id, dow, hour range
const topProductsWhen = async ({ start, end, channel_id = null, dow = null, hour_start = null, hour_end = null, limit = 20 }) => {
  const clauses = ["s.sale_status_desc = 'COMPLETED'", "s.created_at BETWEEN $1::timestamp AND $2::timestamp"];
  const params = [start, end];
  let idx = 3;
  if (channel_id) { clauses.push(`s.channel_id = $${idx}`); params.push(channel_id); idx++; }
  if (dow !== null && dow !== undefined) { clauses.push(`EXTRACT(DOW FROM s.created_at)::int = $${idx}`); params.push(dow); idx++; }
  if (hour_start !== null && hour_start !== undefined) { clauses.push(`EXTRACT(HOUR FROM s.created_at)::int >= $${idx}`); params.push(hour_start); idx++; }
  if (hour_end !== null && hour_end !== undefined) { clauses.push(`EXTRACT(HOUR FROM s.created_at)::int <= $${idx}`); params.push(hour_end); idx++; }

  const sql = `SELECT p.id, p.name, SUM(ps.quantity) AS qty, SUM(ps.total_price) AS revenue
    FROM product_sales ps
    JOIN products p ON p.id = ps.product_id
    JOIN sales s ON s.id = ps.sale_id
    WHERE ${clauses.join(' AND ')}
    GROUP BY p.id, p.name
    ORDER BY qty DESC
    LIMIT $${idx}`;
  params.push(limit);
  const res = await db.query(sql, params);
  return res.rows;
};

// list customers who bought a given product in a period with counts and last order
const productCustomers = async (product_id, start, end, min_orders = 1, limit = 100) => {
  const sql = `SELECT c.id, c.customer_name, c.email, c.phone_number, COUNT(*) AS orders, MAX(s.created_at) AS last_order
    FROM sales s
    JOIN product_sales ps ON ps.sale_id = s.id
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE s.sale_status_desc = 'COMPLETED' AND ps.product_id = $1 AND s.created_at BETWEEN $2::timestamp AND $3::timestamp
    GROUP BY c.id, c.customer_name, c.email, c.phone_number
    HAVING COUNT(*) >= $4
    ORDER BY orders DESC
    LIMIT $5`;
  const res = await db.query(sql, [product_id, start, end, min_orders, limit]);
  return res.rows;
};

// customer summary: products bought by customer with counts
const customerSummary = async (customer_id, start, end, limit = 100) => {
  const sql = `SELECT p.id, p.name, SUM(ps.quantity) AS qty
    FROM product_sales ps
    JOIN products p ON p.id = ps.product_id
    JOIN sales s ON s.id = ps.sale_id
    WHERE s.sale_status_desc = 'COMPLETED' AND s.customer_id = $1 AND s.created_at BETWEEN $2::timestamp AND $3::timestamp
    GROUP BY p.id, p.name
    ORDER BY qty DESC
    LIMIT $4`;
  const res = await db.query(sql, [customer_id, start, end, limit]);
  return res.rows;
};

// customer summary by customer_name (fallback when customers table not used)
const customerSummaryByName = async (customer_name, start, end, limit = 100) => {
  const sql = `SELECT p.id, p.name, SUM(ps.quantity) AS qty
    FROM product_sales ps
    JOIN products p ON p.id = ps.product_id
    JOIN sales s ON s.id = ps.sale_id
    WHERE s.sale_status_desc = 'COMPLETED' AND s.customer_name = $1 AND s.created_at BETWEEN $2::timestamp AND $3::timestamp
    GROUP BY p.id, p.name
    ORDER BY qty DESC
    LIMIT $4`;
  const res = await db.query(sql, [customer_name, start, end, limit]);
  return res.rows;
};

// last completed sale for a customer_name with aggregated items
const lastOrderByCustomerName = async (customer_name) => {
  const sql = `WITH last_sale AS (
      SELECT id, created_at
      FROM sales
      WHERE sale_status_desc = 'COMPLETED' AND customer_name = $1
      ORDER BY created_at DESC
      LIMIT 1
    )
    SELECT ls.id as sale_id, ls.created_at,
      COALESCE(json_agg(json_build_object('product_id', p.id, 'name', p.name, 'quantity', ps.quantity, 'base_price', ps.base_price, 'total_price', ps.total_price)) FILTER (WHERE p.id IS NOT NULL), '[]') AS items
    FROM last_sale ls
    LEFT JOIN product_sales ps ON ps.sale_id = ls.id
    LEFT JOIN products p ON p.id = ps.product_id
    GROUP BY ls.id, ls.created_at`;
  const res = await db.query(sql, [customer_name]);
  return res.rows[0] || null;
};

// customers with >= min_orders and last_order < now() - since_days
const customersLost = async (min_orders = 3, since_days = 30, limit = 100) => {
  const sql = `SELECT c.id, c.customer_name, c.email, c.phone_number, COUNT(s.id) AS orders, MAX(s.created_at) AS last_order
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.sale_status_desc = 'COMPLETED'
    GROUP BY c.id, c.customer_name, c.email, c.phone_number
    HAVING COUNT(s.id) >= $1 AND MAX(s.created_at) < NOW() - ($2 || ' days')::interval
    ORDER BY last_order ASC
    LIMIT $3`;
  const res = await db.query(sql, [min_orders, since_days, limit]);
  return res.rows;
};

// fallback: derive customers by sales.customer_name when customers table is not populated
const customersLostBySalesName = async (min_orders = 3, since_days = 30, limit = 100) => {
  const sql = `SELECT s.customer_name as customer_name, NULL::int as id, NULL::text as email, NULL::text as phone_number, COUNT(s.id) AS orders, MAX(s.created_at) AS last_order
    FROM sales s
    WHERE s.sale_status_desc = 'COMPLETED' AND s.customer_name IS NOT NULL
    GROUP BY s.customer_name
    HAVING COUNT(s.id) >= $1 AND MAX(s.created_at) < NOW() - ($2 || ' days')::interval
    ORDER BY last_order ASC
    LIMIT $3`;
  const res = await db.query(sql, [min_orders, since_days, limit]);
  return res.rows;
};

module.exports.topProductsWhen = topProductsWhen;
module.exports.productCustomers = productCustomers;
module.exports.customerSummary = customerSummary;
module.exports.customersLost = customersLost;
module.exports.customersLostBySalesName = customersLostBySalesName;
module.exports.customerSummaryByName = customerSummaryByName;
module.exports.lastOrderByCustomerName = lastOrderByCustomerName;

// list channels id and name
const listChannels = async () => {
  const res = await db.query(`SELECT id, name FROM channels ORDER BY id`);
  return res.rows;
};

module.exports.listChannels = listChannels;
