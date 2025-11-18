const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/metricsController');
const { validateRequest, rangeLimit } = require('../middlewares/validate');

// GET /api/v1/metrics/revenue?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get(
	'/revenue',
	[
		query('start').optional().isISO8601().withMessage('start must be ISO8601 date'),
		query('end').optional().isISO8601().withMessage('end must be ISO8601 date')
	],
	validateRequest,
	rangeLimit(365),
	controller.getRevenue
);

// GET /api/v1/metrics/top-products?start=&end=&limit=
router.get(
	'/top-products',
	[
		query('start').optional().isISO8601(),
		query('end').optional().isISO8601(),
		query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
	],
	validateRequest,
	rangeLimit(365),
	controller.getTopProducts
);

// GET /api/v1/metrics/sales-by-channel?start=&end=
router.get(
	'/sales-by-channel',
	[query('start').optional().isISO8601(), query('end').optional().isISO8601()],
	validateRequest,
	rangeLimit(365),
	controller.getSalesByChannel
);

// catalog
router.get('/catalog', controller.getCatalog);

// GET /api/v1/metrics/product-margins?start=&end=&limit=&assumed_cost_pct=
router.get(
	'/product-margins',
	[
		query('start').optional().isISO8601(),
		query('end').optional().isISO8601(),
		query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
		query('assumed_cost_pct').optional().isFloat({ min: 0, max: 1 }).toFloat(),
		query('product_id').optional().isInt().toInt()
	],
	validateRequest,
	rangeLimit(365),
	controller.getProductMargins
);

// GET /api/v1/metrics/ticket-average?group=channel|store&start=&end=
router.get(
	'/ticket-average',
	[
		query('group').optional().isIn(['channel', 'store']).withMessage('group must be channel or store'),
		query('start').optional().isISO8601(),
		query('end').optional().isISO8601()
	],
	validateRequest,
	rangeLimit(365),
	controller.getTicketAverage
);

// GET /api/v1/metrics/delivery-times?start=&end=&channel_id=&store_id=
router.get(
	'/delivery-times',
	[query('start').optional().isISO8601(), query('end').optional().isISO8601(), query('channel_id').optional().isInt().toInt(), query('store_id').optional().isInt().toInt()],
	validateRequest,
	rangeLimit(365),
	controller.getDeliveryTimes
);

// GET /api/v1/metrics/top-products-when?start=&end=&channel_id=&dow=&hour_start=&hour_end=&limit=
router.get(
	'/top-products-when',
	[
		query('start').optional().isISO8601(),
		query('end').optional().isISO8601(),
		query('channel_id').optional().isInt().toInt(),
		query('dow').optional().isInt({ min: 0, max: 6 }).toInt(),
		query('hour_start').optional().isInt({ min: 0, max: 23 }).toInt(),
		query('hour_end').optional().isInt({ min: 0, max: 23 }).toInt(),
		query('limit').optional().isInt({ min: 1, max: 200 }).toInt()
	],
	validateRequest,
	rangeLimit(365),
	controller.getTopProductsWhen
);

// GET /api/v1/metrics/product-customers?product_id=&start=&end=&min_orders=&limit=
router.get(
	'/product-customers',
	[query('product_id').isInt().toInt(), query('start').optional().isISO8601(), query('end').optional().isISO8601(), query('min_orders').optional().isInt().toInt(), query('limit').optional().isInt().toInt()],
	validateRequest,
	rangeLimit(365),
	controller.getProductCustomers
);

// GET /api/v1/metrics/customer-summary?customer_id=&start=&end=&limit=
router.get(
	'/customer-summary',
	[query('customer_id').isInt().toInt(), query('start').optional().isISO8601(), query('end').optional().isISO8601(), query('limit').optional().isInt().toInt()],
	validateRequest,
	rangeLimit(365),
	controller.getCustomerSummary
);

// GET /api/v1/metrics/customer-summary-by-name?name=&start=&end=&limit=
router.get(
  '/customer-summary-by-name',
  [query('name').notEmpty(), query('start').optional().isISO8601(), query('end').optional().isISO8601(), query('limit').optional().isInt().toInt()],
  validateRequest,
  controller.getCustomerSummaryByName
);

// GET /api/v1/metrics/customer-last-order-by-name?name=
router.get(
	'/customer-last-order-by-name',
	[query('name').notEmpty()],
	validateRequest,
	controller.getCustomerLastOrderByName
);

// GET /api/v1/metrics/channels
router.get(
	'/channels',
	[],
	validateRequest,
	controller.getChannels
);

// GET /api/v1/metrics/customers-lost?min_orders=&since_days=&limit=
router.get(
	'/customers-lost',
	[query('min_orders').optional().isInt().toInt(), query('since_days').optional().isInt().toInt(), query('limit').optional().isInt().toInt()],
	[query('min_orders').optional().isInt().toInt(), query('since_days').optional().isInt().toInt(), query('limit').optional().isInt().toInt(), query('fallback').optional().toBoolean()],
	validateRequest,
	controller.getCustomersLost
);

// POST /api/v1/metrics/decompose { group, a_start, a_end, b_start, b_end }
const { body } = require('express-validator');
router.post(
	'/decompose',
	[
		body('group').optional().isIn(['channel', 'store']),
		body('a_start').isISO8601(),
		body('a_end').isISO8601(),
		body('b_start').isISO8601(),
		body('b_end').isISO8601()
	],
	validateRequest,
	controller.postDecompose
);

module.exports = router;
