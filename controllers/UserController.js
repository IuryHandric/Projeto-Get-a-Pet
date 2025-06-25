const User = require('../models/User')

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

        res.status(201).json({ message: 'Usuário recebido com sucesso!' })

    }


}