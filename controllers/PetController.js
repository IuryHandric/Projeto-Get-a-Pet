const Pet = require('../models/Pet')

module.exports = class PetController {
    
    //create
    static async create(req, res) {
        res.json({message: 'OK!'})
    }

}