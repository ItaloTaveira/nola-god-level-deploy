const repo = require('../repositories/metricsRepository');

const parseDateRange = (start, end) => {
  const now = new Date();
  const defaultEnd = now.toISOString();
  const defaultStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(); // last 30 days
  return [start || defaultStart, end || defaultEnd];
};

const getRevenue = async (start, end) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.revenueByDay(s, e);
  return rows.map(r => ({ day: r.day, revenue: Number(r.revenue), sales: Number(r.sales) }));
};

const getTopProducts = async (start, end, limit = 10) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.topProducts(s, e, limit);
  return rows.map(r => ({ id: r.id, name: r.name, qty: Number(r.qty), revenue: Number(r.revenue) }));
};

const getSalesByChannel = async (start, end) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.salesByChannel(s, e);
  return rows.map(r => ({ id: r.id, name: r.name, sales: Number(r.sales), revenue: Number(r.revenue), avg_delivery_seconds: r.avg_delivery_seconds == null ? null : Number(r.avg_delivery_seconds) }));
};

const getTicketAverage = async (group, start, end) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.ticketAverage(group, s, e);
  return rows.map(r => ({ id: r.id, group: r.group_name, orders: Number(r.orders), revenue: Number(r.revenue), ticket_avg: Number(r.ticket_avg) }));
};

const getDecompose = async (group, a_start, a_end, b_start, b_end) => {
  // assume dates are provided; no defaults since decomposition needs two explicit periods
  const res = await repo.decomposeMixWithin(group, a_start, a_end, b_start, b_end);
  // normalize numeric values
  return {
    delta_avg_total: Number(res.delta_avg_total || 0),
    effect_within: Number(res.effect_within || 0),
    effect_mix: Number(res.effect_mix || 0)
  };
};

const getProductMargins = async (start, end, limit = 50, assumed_cost_pct = 0.3, product_id = null) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.productMargins(s, e, Number(limit), Number(assumed_cost_pct), product_id);
  return rows.map(r => ({
    id: r.id,
    name: r.product_name,
    qty: Number(r.qty),
    revenue: Number(r.revenue),
    avg_price: Number(r.avg_price || 0),
    cost_total: Number(r.cost_total || 0),
    margin_abs: Number(r.margin_abs || 0),
    margin_pct: Number(r.margin_pct || 0)
  }));
};

const getDeliveryTimes = async (start, end, channel_id = null, store_id = null) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.deliveryTimes(s, e, channel_id, store_id);
  return rows.map(r => ({ dow: Number(r.dow), hour: Number(r.hour), avg_delivery_seconds: Number(r.avg_delivery_seconds), orders: Number(r.orders) }));
};

const getTopProductsWhen = async (opts) => {
  // opts: { start,end,channel_id,dow,hour_start,hour_end,limit }
  const [s, e] = parseDateRange(opts.start, opts.end);
  const rows = await repo.topProductsWhen({ ...opts, start: s, end: e, limit: Number(opts.limit || 20) });
  return rows.map(r => ({ id: r.id, name: r.name, qty: Number(r.qty), revenue: Number(r.revenue) }));
};

const getProductCustomers = async (product_id, start, end, min_orders = 1, limit = 100) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.productCustomers(product_id, s, e, Number(min_orders), Number(limit));
  return rows.map(r => ({ id: r.id, name: r.customer_name, email: r.email, phone: r.phone_number, orders: Number(r.orders), last_order: r.last_order }));
};

const getCustomerSummary = async (customer_id, start, end, limit = 100) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.customerSummary(customer_id, s, e, Number(limit));
  return rows.map(r => ({ id: r.id, name: r.name, qty: Number(r.qty) }));
};

const getCustomerSummaryByName = async (customer_name, start, end, limit = 100) => {
  const [s, e] = parseDateRange(start, end);
  const rows = await repo.customerSummaryByName(customer_name, s, e, Number(limit));
  return rows.map(r => ({ id: r.id, name: r.name, qty: Number(r.qty) }));
};

const getLastOrderByName = async (customer_name) => {
  const row = await repo.lastOrderByCustomerName(customer_name);
  if (!row) return null;
  // items is returned as JSON string/object depending on driver; normalize
  let items = row.items || [];
  try {
    if (typeof items === 'string') items = JSON.parse(items);
  } catch (e) {
    // keep original
  }
  return { sale_id: row.sale_id, created_at: row.created_at, items };
};

const getChannels = async () => {
  const rows = await repo.listChannels();
  return rows.map(r => ({ id: r.id, name: r.name }));
};

const getCustomersLost = async (min_orders = 3, since_days = 30, limit = 100) => {
  const rows = await repo.customersLost(Number(min_orders), Number(since_days), Number(limit));
  return rows.map(r => ({ id: r.id, name: r.customer_name, email: r.email, phone: r.phone_number, orders: Number(r.orders), last_order: r.last_order }));
};

const getCustomersLostBySalesName = async (min_orders = 3, since_days = 30, limit = 100) => {
  const rows = await repo.customersLostBySalesName(Number(min_orders), Number(since_days), Number(limit));
  return rows.map(r => ({ id: r.id || null, name: r.customer_name, email: r.email || null, phone: r.phone_number || null, orders: Number(r.orders), last_order: r.last_order }));
};

module.exports = {
  getRevenue,
  getTopProducts,
  getSalesByChannel,
  getTicketAverage,
  getDecompose
  ,
  getProductMargins
  ,
  getDeliveryTimes
  ,
  getTopProductsWhen,
  getProductCustomers,
  getCustomerSummary,
  getCustomerSummaryByName,
  getLastOrderByName,
  getChannels,
  getCustomersLost,
  getCustomersLostBySalesName
};
