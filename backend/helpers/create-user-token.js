require('dotenv').config();
const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET

const createUserToken = async (user, req, res) => {

    // create a token

    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, secret)

    res.status(200).json({
        message: "Auth Validate!",
        token: token,
        userId: user._id
    })

}

module.exports = createUserToken