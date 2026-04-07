const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 

router.get('/list', adminController.getAdminUsers);

router.post('/login/admin', adminController.loginAdmin);

router.post('/register/admin', adminController.createAdmin);

router.delete('/delete/:id', adminController.deleteAdmin);
router.put('/update/:id', adminController.updateAdmin);
module.exports = router;