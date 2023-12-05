const { string } = require('joi');
const mongoose=require('mongoose');
const Review = require('./Review')

const ProductSchema = new mongoose.Schema({
    name :{
        type:String,
        trim:true,
        required : [true,'Please provide a product name'],
        maxlength : [100, 'Name ca not be more than 100 characters']
    },
    price :{
        type:Number,
        required : [true,'Please provide a price'],
        default : 0,
    },
    description :{
        type:String,
        required : [true,'Please provide a product description'],
        maxlength : [1000, 'cant be more than 1000 charcaters']
    },
    image: {
        type:String,
        default :'/uploads/example.jpeg',
    },
    category:{
        type:String,
        required:[true,'please provide products category'],
        enum : ['office','kitchen','bedroom'],

    },
    company:{
        type:String,
        required:[true,'please provide company name'],
        enum : {
            values: ['ikea','liddy','marcos'],
            message : '{VALUE} is not supported'
        },

    },
    colors:{
        type:[String],
        default: ['#222'],
        required:true,

    },
    featured:{
        type:Boolean,
        default:false,

    },
    freeShipping:{
        type:Boolean,
        default:false,

    },
    inventory:{
        type:Number,
        required:true,
        default:15,

    },
    averageRating:{
        type:Number,
        default:0,

    },
    numOfReview:{
        type:Number,
        default:0
    },
    user : {
        type:mongoose.Types.ObjectId,
        ref :'User',
        required:true
    }


},{timestamps:true, toJSON:{virtuals:true}, toObject:{virtuals:true}});

ProductSchema.virtual('reviews', {
    ref : 'Review',
    localField:'_id',
    foreignField: 'product',
    justOne:false,

})

ProductSchema.pre('deleteOne', {document:true},async function (next){
    console.log("Here we are")

    await this.model('Review').deleteMany({product:this._id}); 
   
  
   
  
    
})
module.exports = mongoose.model('Product',ProductSchema);
