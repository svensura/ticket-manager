const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    //mongoose.connect('mongodb://mongo:27017/ticket-manager', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

mongoose.connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})