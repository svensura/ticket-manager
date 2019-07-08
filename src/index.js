const express = require('express')
const cors = require('cors')

require('./db/mongoose')
const userRouter = require('./routers/user')
const venueRouter = require('./routers/venue')
const gigRouter = require('./routers/gig')

const app = express()
const port = process.env.PORT || 3001

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

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.use(express.json())
app.use(userRouter)
app.use(venueRouter)
app.use(gigRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
