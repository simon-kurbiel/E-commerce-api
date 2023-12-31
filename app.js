require('dotenv').config()
require('express-async-errors')

const express = require('express');
const app = express()

//rest of packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload')

//import database
const connectDB = require('./db/connect');

//routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoute');
const reviewRouter = require('./routes/reviewRoute');
const OrderRouter = require('./routes/orderRoutes');

//middleware
const notFoundMiddleWare = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
// const {authenticateUser} = require('./middleware/authentication');


app.use(morgan('tiny'));
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.use(fileupload())
app.get('/',(req,res)=>{
  
    res.send('e-commerce api')
})
app.get('/api/v1',(req,res)=>{
    console.log("signed", req.signedCookies);
    res.send('e-commerce api')
})
app.use('/api/v1/auth/',authRouter);
app.use('/api/v1/users/',userRouter);
app.use('/api/v1/products',productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders',OrderRouter);
app.use(notFoundMiddleWare);
app.use(errorHandlerMiddleware);
//port
const port = process.env.port || 5000;
const start = async (url="")=>{
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port, (req,res)=>{
            console.log(`Listening on port ${port}`)
        })
        
    } catch (error) {
        console.log(err)
        
    }
};

start();