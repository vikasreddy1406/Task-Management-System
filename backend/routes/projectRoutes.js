import express from "express"
import { createProject, deleteProject, getProjectById, getProjects, getProjectsOfMember, getProjectsOfUser } from "../controllers/projectController.js"
import { verifyJWT } from "../middlewares/authMiddleware.js"


const router = express.Router()

router.route('/createproject').post( createProject)
router.route('/getprojects').get(getProjects)
router.route('/getproject/:projectId').get(getProjectById)
router.route('/delete/:projectId').delete(deleteProject)
router.route('/getprojects/:userId').get(getProjectsOfUser)
router.route('/getmemberprojects/:userId').get(getProjectsOfMember)

export default router