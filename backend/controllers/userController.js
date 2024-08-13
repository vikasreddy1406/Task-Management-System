import { User } from "../models/User.js";

const registerUser = async (req, res) => {
    const { fullName, email, password, role } = req.body
    try {
        if (!fullName || !email || !password || !role) return res.status(404).json({ message: "Some fields are missing" })
        const existedUser = await User.findOne({ email })
        if (existedUser) return res.status(404).json({ message: "User with this email already exists" })

        const user = await User.create({
            fullName,
            email,
            password,
            role
        })
        const createdUser = await User.findById(user._id).select("-password")

        if (!createdUser) return res.status(504).json({ message: "Error while creating the user" })

        return res.status(200).json(createdUser)
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(404).json({ message: "Some fields are missing" })
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: 'User not found' });
        }
        const isPasswordValid = await user.isPasswordCorrect(password)

        if (!isPasswordValid) {
            return res.status(404).json({ message: "Invalid Password" })
        }
        const accessToken = user.generateAccessToken()

        const loggedInUser = await User.findById(user._id).select("-password")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .json({
                message:"ok",
                loggedInUser,
                accessToken
            })
        // return res
        //     .status(200)
        //     .cookie("accessToken", accessToken, options)
        //     .json(loggedInUser)
        //     .send(accessToken)
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getTeamLeads = async (req, res) => {
    try {
        const teamLeads = await User.find({ role: 'teamLead' }).select('fullName _id');
        return res.status(200).json(teamLeads);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getAllMembers = async (req, res) => {
    try {
        const members = await User.find({ role: 'member' }).select('fullName _id');
        return res.status(200).json(members);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export {
    registerUser,
    loginUser,
    getTeamLeads,
    getAllMembers,

}