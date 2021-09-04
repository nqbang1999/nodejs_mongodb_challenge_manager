// const mongoose = require('mongoose')
//
// const mongoConnect = 'mongodb+srv://root:a12345@cluster0.990qz.mongodb.net/bangquang11?retryWrites=true&w=majority'
//
// const connectDB = async() => {
//     try {
//         const con = await mongoose.connect(mongoConnect, {
//             userNewUrlParser: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false,
//             useCreateIndex: true
//         })
//         console.log('MongoDB connected: ' + con.connection.host);
//     } catch(err) {
//         console.log('MongoDB connection error: ' + err);
//         return;
//     }
// }
//
// module.exports = connectDB;