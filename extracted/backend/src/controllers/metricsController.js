const service = require('../services/metricsService');

const getRevenue = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const data = await service.getRevenue(start, end);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const { start, end, limit } = req.query;
    const data = await service.getTopProducts(start, end, limit ? Number(limit) : 10);
    // format values for readability (BRL, 2 decimals)
    const formatterBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatted = data.map(r => ({
      ...r,
      revenue_fmt: formatterBRL.format(r.revenue),
      avg_price: r.qty ? (r.revenue / r.qty) : 0,
      avg_price_fmt: formatterBRL.format(r.qty ? (r.revenue / r.qty) : 0)
    }));
    res.json({ ok: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

const getSalesByChannel = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const data = await service.getSalesByChannel(start, end);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

const getTicketAverage = async (req, res, next) => {
  try {
    const { group = 'channel', start, end } = req.query; // group=channel|store
    const data = await service.getTicketAverage(group, start, end);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

const getDeliveryTimes = async (req, res, next) => {
  try {
    const { start, end, channel_id, store_id } = req.query;
    const data = await service.getDeliveryTimes(start, end, channel_id ? Number(channel_id) : null, store_id ? Number(store_id) : null);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

const getTopProductsWhen = async (req, res, next) => {
  try {
    const { start, end, channel_id, dow, hour_start, hour_end, limit } = req.query;
    const opts = { start, end, channel_id: channel_id ? Number(channel_id) : null, dow: dow !== undefined ? Number(dow) : undefined, hour_start: hour_start !== undefined ? Number(hour_start) : undefined, hour_end: hour_end !== undefined ? Number(hour_end) : undefined, limit: limit ? Number(limit) : 20 };
    const data = await service.getTopProductsWhen(opts);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const getProductCustomers = async (req, res, next) => {
  try {
    const { product_id, start, end, min_orders, limit } = req.query;
    if (!product_id) return res.status(400).json({ ok: false, error: 'product_id required' });
    const data = await service.getProductCustomers(Number(product_id), start, end, min_orders ? Number(min_orders) : 1, limit ? Number(limit) : 100);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const getCustomerSummary = async (req, res, next) => {
  try {
    const { customer_id, start, end, limit } = req.query;
    if (!customer_id) return res.status(400).json({ ok: false, error: 'customer_id required' });
    const data = await service.getCustomerSummary(Number(customer_id), start, end, limit ? Number(limit) : 100);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const getCustomerSummaryByName = async (req, res, next) => {
  try {
    const { name, start, end, limit } = req.query;
    if (!name) return res.status(400).json({ ok: false, error: 'name required' });
    const data = await service.getCustomerSummaryByName(name, start, end, limit ? Number(limit) : 100);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const getCustomerLastOrderByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ ok: false, error: 'name required' });
    const data = await service.getLastOrderByName(name);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const getChannels = async (req, res, next) => {
  try {
    const data = await service.getChannels()
    res.json({ ok: true, data })
  } catch (err) { next(err) }
}

const getCustomersLost = async (req, res, next) => {
  try {
    const { min_orders, since_days, limit, fallback } = req.query;
    if (fallback === 'true' || fallback === true) {
      const data = await service.getCustomersLostBySalesName(min_orders ? Number(min_orders) : 3, since_days ? Number(since_days) : 30, limit ? Number(limit) : 100);
      return res.json({ ok: true, data });
    }
    const data = await service.getCustomersLost(min_orders ? Number(min_orders) : 3, since_days ? Number(since_days) : 30, limit ? Number(limit) : 100);
    res.json({ ok: true, data });
  } catch (err) { next(err); }
};

const postDecompose = async (req, res, next) => {
  try {
    const { group = 'channel', a_start, a_end, b_start, b_end } = req.body;
    if (!a_start || !a_end || !b_start || !b_end) return res.status(400).json({ ok: false, error: 'provide a_start,a_end,b_start,b_end' });
    const data = await service.getDecompose(group, a_start, a_end, b_start, b_end);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

const getProductMargins = async (req, res, next) => {
  try {
    const { start, end, limit, assumed_cost_pct, product_id } = req.query;
    const data = await service.getProductMargins(start, end, limit ? Number(limit) : 50, assumed_cost_pct ? Number(assumed_cost_pct) : 0.3, product_id ? Number(product_id) : null);
    // add human friendly formatting (BRL + percent)
    const formatterBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatterPct = (v) => `${(v * 100).toFixed(1)}%`;
    const formatted = data.map(r => ({
      ...r,
      revenue_fmt: formatterBRL.format(r.revenue),
      avg_price_fmt: formatterBRL.format(r.avg_price),
      cost_total_fmt: formatterBRL.format(r.cost_total),
      margin_abs_fmt: formatterBRL.format(r.margin_abs),
      margin_pct_fmt: formatterPct(r.margin_pct)
    }));
    res.json({ ok: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

const getCatalog = async (req, res, next) => {
  try {
    const catalog = require('../../config/metrics.json');
    res.json({ ok: true, data: catalog });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRevenue,
  getTopProducts,
  getSalesByChannel,
  getTicketAverage,
  postDecompose,
  getProductMargins,
  getCatalog
  ,getDeliveryTimes
  ,getTopProductsWhen,
  getProductCustomers,
  getCustomerSummary,
  getCustomerSummaryByName,
  getCustomerLastOrderByName,
  getChannels,
  getCustomersLost
};

