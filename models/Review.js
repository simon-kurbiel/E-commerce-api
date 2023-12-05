const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:[true,'Please provide a rating']
    },
    title:{
        type:String,
        trim:true,
        required:[true,'Please provide review title'],
        maxlength:100,
    
    },
    comment:{
        type:String,
        required:[true,'Please provide review title'],
        maxlength:100,
    
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref : 'User',
        required:true
    },
    product:{
        type:mongoose.Schema.ObjectId,
        ref : 'Product',
        required:true
    },

},{timestamps:true});

ReviewSchema.index({product:1, user:1}, {unique:true});

ReviewSchema.statics.calculateAverageRating = async function(productId){
    console.log(productId);
    const result = await this.aggregate([
        {
            $match : {product:productId}
        },
        {$group : {
            _id:null,
            averageRating : {$avg: '$rating'}, 
            numOfReview : {$sum : 1},
        }}
    ]);
    try {
        await this.model('Product').findOneAndUpdate({_id:productId}, {
            averageRating:Math.ceil(result[0]?.averageRating || 0),
            numOfReview:result[0]?.averageRating || 0,
        })
        
    } catch (error) {
        
    }
}

ReviewSchema.post('save', async function(){
    await this.constructor.calculateAverageRating(this.product);
    console.log('post save hook called');

})

ReviewSchema.post('deleteOne', { document: true, query: false },async function(){
    console.log('post remove hook called');
    await mongoose.model('Review').calculateAverageRating(this.product);
    
})



module.exports = mongoose.model('Review', ReviewSchema)