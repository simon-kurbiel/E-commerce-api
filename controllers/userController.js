const User = require('../models/User');
const {StatusCodes}= require('http-status-codes')
const CustomError = require('../errors')
const utils = require('../utils')

const getAllUsers = async(req,res)=>{
    // console.log(req.user);
    const users = await User.find({role:'user'}).select('-password')
    res.status(StatusCodes.OK).json(users);
}

const getSingleUser = async(req,res)=>{
    const user = await User.findOne({_id:req.params.id}).select('-password');
    if(!user)
        throw new CustomError.NotFoundError("User Does't Exist");
    utils.checkPermissions(req.user,user._id);
    res.status(StatusCodes.OK).json(user);
}

const showCurrentUser = async(req,res)=>{

    res.send(StatusCodes.OK).json({user:req.user})
}


const updateUser = async(req,res)=>{
    const {email,name} = req.body;
    if(!email || !name)
        return new CustomError.BadRequestError("Please provide all values");
    const user = await User.findOne({_id:req.user.userId});
    user.email = email
    user.name = name;
    await user.save();
    tokenUser = utils.createTokenUser(user);
    utils.attachCookiesToResponse({res,user:tokenUser});

    res.status(StatusCodes.OK).json({sucess:true,msg:"User Updated Successfully",user:tokenUser})
}

const updateUserPassword =async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    if(!oldPassword || !newPassword)
        throw new CustomError.BadRequestError('Please provide old password and new password');
    const user = await User.findOne({_id:req.user.userId});
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if(!isPasswordCorrect)
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({success:true,msg:"Password Updated Successfully"})
};


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}