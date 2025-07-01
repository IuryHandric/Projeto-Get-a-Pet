require('dotenv').config()
const jwt = require('jsonwebtoken')
const getToken = require('./get-token');

const secret = process.env.JWT_SECRET

// midleware to validate token
const checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Acesso Negado!' })
    }

    const token = getToken(req)

    if (!token) {
        return res.status(401).json({ message: 'Acesso Negado!' })
    }

    try {
        const verified = jwt.verify(token, secret)
        req.user = verified
        next()
    } catch (e) {
        return res.status(400).json({ message: 'Token Inválido!' })
    }

}

module.exports = checkToken