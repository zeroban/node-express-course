require('dotenv').config() // pulls the envirnment veriables from the .env file
require('express-async-errors')

// async errors

const express = require('express');
const app = express();


const connectDB = require('./db/connect')
const producstsRouter = require('./routes/products')


// pulling in the functions from middleware folder
const notFoundMiddleware = require('./middleware/not-found')
const errorMiddleware = require('./middleware/error-handler')

// middleware

app.use(express.json())

//rootes

app.get('/', (req, res) => {
    res.send('<h1>Store API</h1><a href="/api/v1/products">producsts routes</a>')
})


app.use('/api/v1/products', producstsRouter)


// products route


app.use(notFoundMiddleware)
app.use(errorMiddleware)

const port = process.env.PORT || 3000


const start = async () => {
    try {
        // connect to DB
        await connectDB(process.env.MONGO_URI)

        app.listen(port, console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error)

    }
}

start()