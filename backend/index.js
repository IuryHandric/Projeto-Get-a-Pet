require('dotenv').config()
const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 3006;
const app = express();

// Config JSON response

app.use(express.json());


// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Public folder for images
app.use(express.static('public'))

// Routes

const UserRoutes = require('./routes/User.Routes')
const PetRoutes = require('./routes/Pet.Routes')

app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)


app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`)
})