import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


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
export { registerUser }