const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} = require('../controllers/productController');

const {authenticateUser,authorizePermissions} = require('../middleware/authentication')

const express = require('express');
const { create } = require('../models/Product');
const router = express.Router()


router.route('/')
    .post([authenticateUser,authorizePermissions('admin')], createProduct)
    .get(getAllProducts);

router.route('/uploadImage')
    .post([authenticateUser,authorizePermissions('admin')], uploadImage)
router.route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser,authorizePermissions('admin')], updateProduct)
    .delete([authenticateUser,authorizePermissions('admin')], deleteProduct);






module.exports = router;

