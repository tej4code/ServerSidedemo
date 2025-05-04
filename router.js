const express = require('express');
const router = express.Router();
const { registerUser, verifyUser, adminLogin ,customerLogin} = require('./controller/user');


router.post('/register', registerUser);

router.post('/verify', verifyUser);


router.post('/admin-login', adminLogin);

router.post('/customer-login', customerLogin);

module.exports = router;
