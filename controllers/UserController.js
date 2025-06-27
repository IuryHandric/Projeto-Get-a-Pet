require('dotenv').config()
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET

module.exports = class UserController {

    static async register(req, res) {

        // Utilizar dessa forma para o código ficar mais claro, no lugar de criar 5 constantes.
        const { name, email, phone, password, confirmpassword } = req.body;

        // Validations

        const requiredFields = [
            { field: name, name: 'nome' },
            { field: email, name: 'email' },
            { field: phone, name: 'telefone' },
            { field: password, name: 'senha' },
            { field: confirmpassword, name: 'confirmação de senha' }
        ];

        for (const item of requiredFields) {
            if (!item.field) {
                return res.status(422).json({ message: `O ${item.name} é obrigatório!` });
            }
        }
        // passwords validation

        if (password !== confirmpassword) {
            return res.status(422).json({ message: 'As senhas não conferem!' });
        }

        // check if user exists

        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({
                message: 'Usuário já cadastrado, tente outro email'
            })
            return
        }

        // create a password

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // create a user

        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        // Cadastro no banco de dados

        try {
            const newUser = await user.save()

            await createUserToken(newUser, req, res)
        } catch (e) {
            res.status(500).json({ message: 'Erro de servidor' })
        }

    }

    static async login(req, res) {
        const { email, password } = req.body

        if (!email) {
            res.status(422).json({ message: 'Email Obrigatório!' })
        }

        if (!password) {
            res.status(422).json({ message: 'Senha Obrigatória!' })
        }

        const user = await User.findOne({ email: email })

        if (!user) {
            res.status(422).json({
                message: 'Não existe usuário cadastrado com esse email'
            })
            return
        }

        // check if password match with db password

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({
                message: 'Senha incorreta!'
            })
        }

        await createUserToken(user, req, res)

    }

    static async checkUser(req, res) {
        let currentUser

        if (req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, secret)

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id
        // removendo o campo senha no retorno
        const user = await User.findById(id).select("-password")

        if (!user) {
            res.status(422).json({
                message: 'Usuário não escontrado!'
            })
            return
        }

        res.status(200).json({ user })

    }

    static async editUser(req, res) {
        const id = req.params.id

        // check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, email, phone, password, confirmpassword } = req.body

        let image = ''

        // Validation

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        user.name = name

        if (!email) {
            res.status(422).json({ message: 'O email é obrigatório' })
            return
        }

        if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório' })
        }

        user.phone = phone

        // check if email has already taken
        const userExists = await User.findOne({ email: email })

        if (user.email !== email && userExists) {
            res.status(422).json({
                message: 'Por favor, utilize outro email'
            })
            return
        }

        user.email = email

        // passwords validation

        if (password !== confirmpassword) {
            return res.status(422).json({ message: 'As senhas não conferem!' });
        } else if (password === confirmpassword && password != null) {

            // creating new password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash

        }

        console.log(user)

        try {

            // return user uptaded data
            await user.save();
            res.status(200).json({
                message: 'Usuário atualizado com sucesso!',
                user
            });

        } catch (e) {
            res.status(500).json({ message: 'Erro de servidor', e })
            return
        }

    }



}