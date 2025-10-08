const express = require('express');
const router = express.Router();
const dishRoutes = require('./dishRoutes');
const categoryRoutes = require('./categoryRoutes');

router.get('/ping', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString()
	});
});

router.use('/dishes', dishRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
