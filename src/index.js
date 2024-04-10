import dotenv from 'dotenv'
import express from "express";
import connectDB from "./db/dbConnect.js"

dotenv.config({
    path:'../env'
})

const app=express()

connectDB()

// ( async()=>{
//     console.log('mongo uri---',process.env.MONGOURI);
// try{
//    await  mongoose.connect(`${process.env.MONGOURI}/${DB_NAME}`)

//  app.on("error" ,(error)=>{
//     console.log('error--',error);
//     throw error
//  })
//  app.listen(process.env.PORT,()=>{
//     console.log(`app is listining on ${process.env.PORT}`);
//  })
// }catch(e){
//     console.log('error---',e)
//     throw e;
// }
// })()