const express = require('express')
const cors = require('cors')

require('./db/mongoose')
const userRouter = require('./routers/user')
const studentRouter = require('./routers/student')

const app = express()
const port = process.env.PORT


// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

app.use(cors())



app.use(express.json())
app.use(userRouter)
app.use(studentRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
