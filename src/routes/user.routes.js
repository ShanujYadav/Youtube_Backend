import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middle.js'
import { verifyJWT } from "../middlewares/auth.middle.js";

const router=Router()

router.route('/register').post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)


//Secured Routes

router.route('/logout').post(verifyJWT,logoutUser)

export default router