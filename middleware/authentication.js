const CustomError = require('../errors');
const {isTokenValid}= require('../utils')

const authenticateUser =async(req,res,next)=>{
    const token = req.signedCookies.token;
    if(!token)
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    try{
        const payLoad = isTokenValid({token});
        req.user = {name:payLoad.name, userId:payLoad.userId,role:payLoad.role}
    }
    catch(error){
        console.log(error)
    }
    next();
}

const authorizePermissions = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
            throw new CustomError.UnauthorizedError("Don't have permission")
        console.log('admin');
        next();
    }
}

module.exports = {authenticateUser,authorizePermissions};