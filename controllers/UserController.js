const User = require('../models/User')
const bcrypt = require('bcrypt')
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
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' },
                newUser
            )
        } catch (e) {
            res.status(500).json({ message: 'Erro de servidor' })
        }

    }

}