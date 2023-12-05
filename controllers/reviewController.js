const {StatusCodes} = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/Product');
const util = require('../utils');
const CustomError = require('../errors')

const createReview = async(req,res)=>{

    const {product:productId} = req.body;
    const isValidProduct = await Product.findOne({_id:productId});
    if(!isValidProduct)
        return new CustomError.NotFoundError(`Product with id :${productId} not found`);

    const alreadySubmitted = await Review.findOne({product:productId, user:req.user.userId});
    if(alreadySubmitted)
        throw new CustomError.BadRequestError("Already Have a review for this one.");
    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.OK).json({review});
}

const getAllReviews = async(req,res)=>{

    const review = await Review.find({})
                    .populate({
                        path:'product',
                        select : 'name company price'
                    });
    res.status(StatusCodes.OK).json({review})
}


const getSingleReview = async(req,res)=>{
    const {id:reviewId} = req.params;
    const review = await Review.findOne({_id:reviewId});
    if(!review)
        throw new CustomError.NotFoundError(`Id ${reviewId} not found`)
    res.status(StatusCodes.OK).json(review)
}

const updateReview = async(req,res)=>{
    const {id:reviewId} = req.params;
    const {rating,title,comment} = req.body;
    const review = await Review.findOne({_id:reviewId});
    if(!review)
        throw new CustomError.NotFoundError(`Id ${reviewId} not found`) 
    util.checkPermissions(req.user,review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;

    review.save();
  
   
    res.status(StatusCodes.OK).json({success:true, msg:"UPDATED", review});
}

const deleteReview = async(req,res)=>{
    const {id:reviewId} = req.params;
    const review = await Review.findOne({_id:reviewId});
    if(!review)
        throw new CustomError.NotFoundError(`Id ${reviewId} not found`) 
    util.checkPermissions(req.user,review.user);
    await review.deleteOne();
  
   
    res.status(StatusCodes.OK).json({success:true, msg:"Deleted"})

}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}
