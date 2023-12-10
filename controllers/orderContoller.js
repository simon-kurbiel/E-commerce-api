const {StatusCodes} = require('http-status-codes')
const Product = require('../models/Product')
const Order = require('../models/Order')
const CustomError = require('../errors')
const utils = require('../utils')

const fakeStripeApi =async ({amount, currency})=>{
    const client_secret = 'someRandomValue';
    return {client_secret,amount};
}

const createOrder =async (req,res)=>{
    const {items:cartItems, tax, shippingFee} = req.body;
    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError("No Cart items provided");
    }
    if(!tax || !shippingFee){
         throw new CustomError.BadRequestError("Please Provide tax and shipping fee");
    }
    let orderItems = [];
    let subTotal = 0;

    for(const item of cartItems){
        const dbProduct =  await Product.findOne({_id:item.product});
        if(!dbProduct)
            throw new CustomError.NotFoundError("No product with that id.");
        const {name, price, image, _id} = dbProduct;
        const singleOrderItem = {
            amount:item.amount,
            name,price,image,product:_id
        };
        //add item to order
        orderItems = [...orderItems,singleOrderItem];
        subTotal+=item.amount*price;


    }
    const total= tax+shippingFee+subTotal;

    // get client secret
    const paymentIntent = await fakeStripeApi({amount:total, currency:'usd'});
    const order = await Order.create({
                orderItems, total,subTotal,tax, 
                shippingFee,clientSecret:paymentIntent.client_secret,
            user:req.user.userId})

    res.status(StatusCodes.CREATED).json({order,clientSecret:order.clientSecret})
}
const getAllOrders = async (req,res)=>{
    const orders = await Order.find({});

    res.status(StatusCodes.OK).json({orders, count:orders.lengths});
}
const getSingleOrder =async (req,res)=>{
    const {id:orderId} = req.params
    const order = await Order.findOne({_id:orderId});
    if(!order){
        throw new CustomError.BadRequestError("Order does not exist")
    }
    utils.checkPermissions(req.user,order.user);

    res.status(StatusCodes.OK).json({order});
}

const getCurrentUserOrders =async (req,res)=>{
    const orders = await Order.find({user:req.user.userId});
    res.status(StatusCodes.OK).json({orders})
}

const updateOrder =async (req,res)=>{
    const {id:orderId} = req.params
    const {paymentIntentId} = req.body
    const order = await Order.findOne({_id:orderId});
    if(!order){
        throw new CustomError.BadRequestError("Order does not exist")
    }
    utils.checkPermissions(req.user,order.user);
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid'

    await order.save();
}


module.exports ={
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder,
}