const express = require('express')
const cors = require('cors')


const userRouter = require('./routers/user')
const venueRouter = require('./routers/venue')
const gigRouter = require('./routers/gig')


const app = express()
const port = process.env.PORT

require('./db/mongoose')


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
app.options('*', cors());


app.use(express.json())
app.use(userRouter)
app.use(venueRouter)
app.use(gigRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
