const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/venue')

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(venueRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})