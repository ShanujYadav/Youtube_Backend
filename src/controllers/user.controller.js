import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from'jsonwebtoken'


// Genrate Access and Refresh Token 
const genrateAccessAndRefreshToken=async(userId)=>{
    try {
        const user =await User.findById(userId)
        const accessToken=user.genrateAccessToken()
        const refreshToken=user.genrateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while genrating Access And Refresh Token")
    }
}


// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body
    // check for Empty Values
    if ([fullName, email, userName, password].some((field) =>
        field?.trim() === '')
    ) {
        throw new ApiError(400, "All fields is Required ! ")
    }

    // check for Exist User
    const existedUser =await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User is Already Exists")
    }

    // Check For Files
    const avtarLocalPath = req.files?.avtar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if (!avtarLocalPath) {
        throw new ApiError(400, "Avtar file is Required !")
    }
    // Upload file on Cloudinary
    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avtar) {
        throw new ApiError(400, "Avtar file is Required !")
    }

    //Create Entry in DB
    const user = await User.create({
        fullName,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    // Check if User Created
    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong While creating User")
    }

    return res.status(201).json(
        new ApiResponse('000',createdUser,"User Registered SuccessFully ")
    )

})


// Login User
const loginUser =asyncHandler (async (req,res)=>{
    const {  email, userName, password } = req.body
    if(!email && !userName){
        throw new ApiError(400, "Email or UserName are Required")
    }
     const user=await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(404, "User Does not Exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401, 'Incorrect Password')
}


const {accessToken,refreshToken}=await genrateAccessAndRefreshToken(user._id)
const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

// Cookies

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(new ApiResponse(
    200,{
        user:loggedInUser,
        accessToken,
        refreshToken
    },
    "User loggedIn SuccessFully"
))
})


//Logout User
const logoutUser=asyncHandler (async(req,res)=>{    
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
        new:true
        }
    )
     
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json(new ApiResponse(200,{}, "User Logged Out"))

})


//Verify AccessToken
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incommingRefreshToken=rew.cookie.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

   try {
     const decodeToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN)
   const user =await User.findById(decodeToken?._id)
   
   if(!user){
     throw new ApiError(401,"Invalied Refresh Token")
   }
   if(incommingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"Refresh Token is Expired")
   }
 
   const options={
     httpOnly:true,
     secure:true,
   }
 const {accessToken,newRefreshToken}= await genrateAccessAndRefreshToken(user._id)
   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',newRefreshToken,options)
   .json(
     new ApiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access Token Refreshed"
     )
   )
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh Token")
   }
})

export { registerUser ,loginUser,logoutUser,refreshAccessToken}