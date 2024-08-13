import express from "express"
import { getAllMembers, getTeamLeads, loginUser, registerUser } from "../controllers/userController.js"


const router=express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/teamleads').get(getTeamLeads)
router.route('/members').get(getAllMembers)

export default router