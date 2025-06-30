const Pet = require('../models/Pet')

// helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class PetController {

    //create
    static async create(req, res) {
        const { name, age, weight, color } = req.body

        const images = req.files

        const available = true

        // images uploads

        // Validations

        const requiredFields = [
            { field: name, name: 'nome' },
            { field: age, name: 'idade' },
            { field: weight, name: 'peso' },
            { field: color, name: 'cor' }
        ];

        for (const item of requiredFields) {
            if (!item.field) {
                return res.status(422).json({ message: `O valor para ${item.name} é obrigatório!` });
            }
        }

        if (!images || images.length === 0) {
            res.status(422).json({ message: 'Imagens são obrigatórias' })
            return
        }

        // get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (!user) {
            return res.status(401).json({ message: 'Usuário não autorizado!' });
        }

        // create a pet
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        // images.map((image) => {
        //     pet.images.push(image.filename)
        // })

        pet.images = images.map(image => image.filename);


        // save a pet into system
        try {

            const newPet = await pet.save()
            res.status(201).json({ message: 'Pet Cadastrado com sucesso!', pet: newPet }),

                console.log('Pet Cadastrado com sucesso!', newPet)

        } catch (e) {
            res.status(500).json({ message: 'Erro de servidor!' })
        }

    }

}