import dotenv from 'dotenv'
import connectDB from "./db/dbConnect.js"
import {app}  from './app.js'

dotenv.config({
    path:'../env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(` Server is running at ${process.env.PORT}`);
   })
})
.catch((err)=>{
    console.log('Error=---',err)
})


// ( async()=>{
//     console.log('mongo uri---',process.env.MONGOURI);
// try{
//    await  mongoose.connect(`${process.env.MONGOURI}/${DB_NAME}`)

//  app.on("error" ,(error)=>{
//     console.log('error--',error)
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