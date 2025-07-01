const Pet = require('../models/Pet')

// helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId

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

    static async getAll(req, res) {

        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({
            pets: pets
        })

    }

    static async getAllUserPets(req, res) {

        // get user from token
        const token = getToken(req)
        const user = await getUserByToken(token)

        // filter from user id
        const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')
        console.log(user.id)
        res.status(200).json({
            pets
        })

    }

    static async getAllUserAdoptions(req, res) {
        // get user from token
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')

        res.status(200).json({
            pets
        })
    }

    static async getPetById(req, res) {
        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' })
            return
        }
        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
        }
        res.status(200).json({
            pet
        })
    }

    static async removePetById(req, res) {
        const id = req.params.id

        // check if id is valid
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID Inválido!' })
            return
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamente mais tarde!' })
            return
        }

        await Pet.findByIdAndDelete(id)

        res.status(200).json({ message: 'Pet removido com sucesso!' })

    }

    static async updatePet(req, res) {
        const id = req.params.id

        const { name, age, weight, color, available } = req.body

        const images = req.files

        const updatedData = {}

        if (!req.body) {
            return res.status(400).json({ message: 'Corpo da requisição ausente!' });
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamente mais tarde!' })
            return
        }

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        } else {
            updatedData.name = name
        }

        if (!age) {
            res.status(422).json({ message: 'O idade é obrigatória!' })
            return
        } else {
            updatedData.age = age
        }

        if (!weight) {
            res.status(422).json({ message: 'O peso é obrigatório!' })
            return
        } else {
            updatedData.weight = weight
        }

        if (!color) {
            res.status(422).json({ message: 'A cor é obrigatória!' })
            return
        } else {
            updatedData.color = color
        }

        if (images.length === 0) {
            res.status(422).json({ message: 'Imagens são obrigatórias' })
            return
        } else {
            updatedData.images = []
            updatedData.images = images.map(image => image.filename);
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({ message: 'Pet atualizado com sucesso!', updatedData })

        console.log('Pet atualizado com sucesso', updatedData)

    }

    static async schedule(req, res) {

        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        // check if user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.equals(user._id)) {
            res.status(422).json({ message: 'Você não pode agendar uma visita com o seu próprio Pet!' })
            return
        }

        // check if user has already scheduled a visit

        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                res.status(422).json({ message: 'Você já agendou uma visita para esse Pet!' })
                return
            }
        }

        // add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({ message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo contato ${pet.user.phone}` })
    }

    static async concludeAdoption(req, res) {

        const id = req.params.id

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })
        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrato' })
            return
        }

        // check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamente mais tarde!' })
            return
        }
        pet.available = false

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({message: 'Parabéns, o ciclo de adoção foi finalizado com sucesso!'})



    }

}