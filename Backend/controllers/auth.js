import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export async function register(req, res) {

    try {
        const { name, surname, email, password } = req.body;
        if (
            typeof name !== "string" ||
            typeof surname !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !surname.trim() ||
            !email.trim() ||
            password.length < 8
        ) {
            return res.status(400).json({
                message:
                    "All field are required"
            });
        }
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exist"
            })

        };
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name: name,
            surname: surname,
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });
        return res.status(201).json({
            message: "User created"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });

    }

};

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (

            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                message:
                    "All field are required"
            });
        }
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password")
        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid credential"
            });

        };
        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });

        }
        const token = jwt.sign({
            id: existingUser._id,
        },

            process.env.JWT_SECRET,

            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }




        )
        return res.status(200).json({ token });

    } catch (error) {
        return res.status(500).json ({
            message: "internal server error"
        })

    }
};

export async function getMe(req,res){
try {
    const user= await User.findById(req.userId)
    if(!user){
        return res.status(404).json ({message: "user not available"})
    }
    return res.status(200).json ({user})
} catch (error) {
    return res.status(500).json ({
            message: "internal server error"
        })

}
}