const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/userController');
const {authenticateUser,authorizePermissions} = require('../middleware/authentication')
const express = require('express');
const router = express.Router()

router.route('/').get(authenticateUser,authorizePermissions('admin'),getAllUsers);
router.route('/showMe').get(authenticateUser,showCurrentUser);
router.route('/updateuser').patch(authenticateUser,updateUser);
router.route('/updatepassword').patch(authenticateUser,updateUserPassword);
router.route('/:id').get(authenticateUser,authorizePermissions,getSingleUser);

module.exports = router

