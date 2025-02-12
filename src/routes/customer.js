const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');
const auth = require('../controllers/login');

router.get('/', customerController.list);
router.post('/add', customerController.save);
router.get('/update/:id', customerController.edit);
router.post('/update/:id', customerController.update)
router.get('/delete/:id', customerController.delete);
router.post('/login',auth.login);
module.exports = router;