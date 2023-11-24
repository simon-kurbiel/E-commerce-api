const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors/')
const utils = require('../utils');
const { token } = require('morgan');

const register = async (req,res)=>{
    const {email,name,password}=  req.body;
    const emailAlreadyExists = await User.findOne({email})
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('email already exists');
    }
    // first registered user is an admin;
    const isFirstacount = await User.countDocuments({}) === 0;
    const role = isFirstacount?'admin':'user';

    const user = await User.create({name,email,password,role});
    const tokenUser = utils.createTokenUser(user) //create payload
    

    utils.attachCookiesToResponse({res,user:tokenUser});
    res.status(StatusCodes.CREATED).json({user:tokenUser});
}

const login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password)
        throw new CustomError.BadRequestError("Please provide email and password");
    const user = await User.findOne({email});
    if(!user)
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect)
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    const tokenUser = utils.createTokenUser(user)
    utils.attachCookiesToResponse({res,user:tokenUser});
    res.status(StatusCodes.OK).json({user:{tokenUser}});
}
const logout = async (req,res)=>{

    res.cookie('token','random',{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.status(StatusCodes.OK).json("logged out");
}

module.exports = {
    register,login,logout
};