require('dotenv').config();
const mongoose = require('mongoose')

const uri = process.env.URI;

async function main() {
    await mongoose.connect(uri)
    console.log('Conexão ao Mongoose bem sucedida!')
}

main().catch((e) => console.log(e))

module.exports = mongoose