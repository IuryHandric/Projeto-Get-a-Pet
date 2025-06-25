const mongoose = require('../db/conn')
const { Schema } = mongoose

const Pet = mongoose.model(
    'Pet',
    new Schema({
        name: {
            type: String, required: true
        },
        age: {
            type: Number, required: true
        },
        weight: {
            type: Number, required: true
        },
        color: {
            type: String, required: true
        },
        available: {
            type: Boolean
        },
        user: Object,
        adopter: Object
    },
        // Criando data de criação e alteração
        {timestamps: true}
    )
)

module.exports = Pet