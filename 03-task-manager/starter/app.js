const express = require('express');
const app = express();
const tasks = require('./routes/tasks');
const connectDB = require('./db/connect');
require('dotenv').config()
const notFound = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')


// middleware
app.use(express.static('./public'))
app.use(express.json())


// routes
// app.get('/hello', (req, res) => {
//     res.send('Task Manager App')
// })

app.use('/api/v1/tasks', tasks)
// uses middleware to display route not found when searching to a route that does not exist
app.use(notFound)
app.use(errorHandlerMiddleware)


const port = 3000


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`server is listening on port ${port}...`))
    }
    catch (error) {
        console.log(error);
    }
}


start();
