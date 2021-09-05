const express = require('express')
const bodyparser = require('body-parser');
const {check, validationResult} = require('express-validator')
const session = require('express-session')
const flush = require('connect-flash')



// for connect mongo
const mongoose = require('mongoose')
const mongoConnect = 'mongodb+srv://root:a12345@cluster0.990qz.mongodb.net/bangquang11?retryWrites=true&w=majority'
const connectDB = async() => {
    try {
        const con = await mongoose.connect(mongoConnect)
        console.log('MongoDB connected: ' + con.connection.host);
    } catch(err) {
        console.log('MongoDB connection error: ' + err);
    }
}
connectDB();

// let currentDate = new Date();
// let cDay = currentDate.getDate()
// console.log(cDay);


var today = new Date();
console.log('today: ' + today)
var currentDateFormat = (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear();

// create table in database
var schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    startDay: {
        type: Date,
        default: currentDateFormat
    },
    finishDay: {
        type: Date,
        required: true
    },
    daysLeft: {
        type: String
    },
    status: {
        type: String,
        default: "In Progress"
    },
    note: String
})
const challengeDB = mongoose.model('challengeDB', schema)
console.log("create table mongoDB: qua chua")

/**
 * Controller
 * @type {*|Express}
 */
const create = (req, res) => {
    if (!req.body) {
        res.status(400).send({message: "controller create: req.body is empty"})
        return
    }

    let currentDateTime = new Date(currentDateFormat)
    // To calculate the time difference of two dates
    let finishDayInputFromUser = req.body.finishDay;
    var finishDayInputFromUserToDate = new Date(finishDayInputFromUser);
    // console.log('time minused: '+ date1)
    var differenceTimeBetweenTimeUserInputAndCurrentTime = finishDayInputFromUserToDate.getTime() - currentDateTime.getTime();

// To calculate the no. of days between two dates
    var daysLeft = Math.floor(differenceTimeBetweenTimeUserInputAndCurrentTime / (1000 * 3600 * 24));

    const newChallenge = new challengeDB({
        title: req.body.title,
        // startDay: req.body.startDay,
        finishDay: req.body.finishDay,
        daysLeft: daysLeft,
        note: req.body.note
    })

    newChallenge
        .save(newChallenge)
        .then(data => {
            return res.redirect('/');
        })
        .catch(err => {
            res.status(500).send('controller create: error save to dbs: ' + err);
        })
}

const find = (req, res) => {
    challengeDB.find()
        .then(data => {
            let findAllChallengesResponse = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].status == 'In Progress' || data[i].status == 'Overdue') {
                    let formattedStartDayResponse = data[i].startDay.getDate() + "/" + (data[i].startDay.getMonth() + 1) + "/" + data[i].startDay.getFullYear()
                    let formattedFinishDayResponse = data[i].finishDay.getDate() + "/" + (data[i].finishDay.getMonth() + 1) + "/" + data[i].finishDay.getFullYear()
                    let challengeElement = {title: data[i].title,
                        startDay: formattedStartDayResponse,
                        finishDay: formattedFinishDayResponse,
                        daysLeft: data[i].daysLeft,
                        status: data[i].status,
                        note: data[i].note,
                        id: data[i]._id}
                    findAllChallengesResponse.push(challengeElement)
                }
            }
            res.send(findAllChallengesResponse)
        })
        .catch(err => {
            res.status(500).send('controller find error: ' + err.message)
        })
}

const findToDisplayInTable = (req, res) => {
    challengeDB.find()
        .then(data => {
            let findAllChallengesResponse = [];
            for (let i = 0; i < data.length; i++) {
                let formattedStartDayResponse = data[i].startDay.getDate() + "/" + (data[i].startDay.getMonth() + 1) + "/" + data[i].startDay.getFullYear()
                let formattedFinishDayResponse = data[i].finishDay.getDate() + "/" + (data[i].finishDay.getMonth() + 1) + "/" + data[i].finishDay.getFullYear()
                let finishDayToDate = new Date(data[i].finishDay);
                let startDayToDate = new Date(data[i].startDay);
                let differenceTimeBetweenStartDayAndFinishDay = finishDayToDate.getTime() - startDayToDate.getTime();
                let duration = Math.floor(differenceTimeBetweenStartDayAndFinishDay / (1000 * 3600 * 24));
                findAllChallengesResponse[i] = {title: data[i].title,
                    startDay: formattedStartDayResponse,
                    finishDay: formattedFinishDayResponse,
                    daysLeft: data[i].daysLeft,
                    status: data[i].status,
                    note: data[i].note,
                    id: data[i]._id,
                    duration: duration}
            }
            res.send(findAllChallengesResponse)
        })
        .catch(err => {
            res.status(500).send('controller find error: ' + err.message)
        })
}

const updateByCurrentTime = (req, res) => {
    challengeDB.find()
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                let currentDateTime = new Date(currentDateFormat)
                // To calculate the time difference of two dates
                // let finishDayInputFromUser = req.body.finishDay;
                var finishDayToDate = new Date(data[i].finishDay);
                // console.log('time minused: '+ date1)
                var differenceTimeBetweenCurrentTimeAndFinishDay = finishDayToDate.getTime() - currentDateTime.getTime();
                // To calculate the no. of days between two dates
                var daysLeftUpdated = Math.floor(differenceTimeBetweenCurrentTimeAndFinishDay / (1000 * 3600 * 24));
                // data[i].startDay = currentDateFormat
                data[i].daysLeft = daysLeftUpdated
                if (daysLeftUpdated == 0) {
                    data[i].status = 'Overdue'
                }
                data[i].save()
            }
        })
        .catch(err => {
            res.status(500).send('controller updateByCurrentTime: error: ' + err);
        })
}

const getOne = (req, res) => {
    if (req.query.id) {
        const id = req.query.id;
        challengeDB.findById(id)
            .then(data => {
                if (!data) {
                    res.status(400).send({message: "find by id: not found id: " + id})
                } else {
                    let formattedStartDayResponse = data.startDay.toISOString().slice(0, 10)
                    let formattedFinishDayResponse  = data.finishDay.toISOString().slice(0, 10)
                    let challengeResponse = {title: data.title,
                        startDay: formattedStartDayResponse,
                        finishDay: formattedFinishDayResponse,
                        daysLeft: data.daysLeft,
                        status: data.status,
                        note: data.note,
                        id: data._id}
                    res.send(challengeResponse)
                }
            })
            .catch(err => {
                res.status(500).send({message: "get one: error get challenge id: " + err})
            })
    } else {
        console.log('getOne: vao cmn ko lay dc id')
        return
    }
}

update = (req, res) => {
    console.log('update: vao day chua')
    if (!req.body) {
        return res
            .status(400)
            .send({message: "Update: data input can not be empty"})
    }
    if (!req.body.title) {
        console.log('update: input title is empty')
        return res.redirect('/edit?id=' + req.body.id);
    }
    if (!req.body.finishDay) {
        return res.redirect('/edit?id=' + req.body.id);
    }

    console.log('title input from user: ' + req.body.title)
    console.log('note input from user: ' + req.body.note)

    const id = req.body.id
    console.log('update: req.params.id: ' + id)
    challengeDB.findByIdAndUpdate(id, req.body)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not update challenge with " + id + " maybe challenge not found"})
            } else {
                // res.send(data)
                // res.json(req.body)
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "update: error while updating challenge"})
        })

}

deleteChallenge = (req, res) => {
    console.log('delete: vao day chua')
    const idChallenge = req.body.id
    console.log('delete: req.params.id: ' + idChallenge)
    challengeDB.findByIdAndRemove(idChallenge)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not delete challenge with " + idChallenge + " maybe challenge not found"})
            } else {
                // res.send(data)
                // res.json(req.body)
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "delete: error while deleting challenge"})
        })

}




const app = express()
const bangquang11 = 'bangquang11'

const urlencodedParser = app.use(bodyparser.urlencoded({extended:true}))


/**
 * API
 * @type {*|Express}
 */
const route = express.Router();
route.post('/bangquang11/create', create);
app.use('/', route);
console.log('qua API chua')
route.get('/bangquang11/all', find);
route.get('/bangquang11/updateByCurrentTime', updateByCurrentTime);
route.get('/bangquang11/note', getOne);
route.get('/bangquang11/getOne', getOne);
route.post('/bangquang11/update', update);
route.get('/bangquang11/findAllToDisplayInTable', findToDisplayInTable);
route.post('/bangquang11/delete', deleteChallenge);


/**
 * ROUTES
 */
const axios = require('axios')

homeRoute = (req, res) => {
        // make a req api
        axios.get('http://localhost:3000/bangquang11/updateByCurrentTime')
            .then(function () {
                console.log('qua updateByCurrentTime chua')
            }).catch(err => {
            throw error})

    axios.get('http://localhost:3000/bangquang11/all')
        .then(function (response) {
            res.render('home', {challenges: response.data});
        })
        .catch(err => {
            throw err
        })
}
route.get('/', homeRoute);

noteRoute = (req, res) => {
    console.log('noteRoute: vao day chua')
    console.log('noteRoute: lay ra id tu url= ' + req.query.id)
    // console.log('API: ' + 'http://localhost:3000/bangquang11/note/' + {params: {id: req.query.id}})
    axios.get('http://localhost:3000/bangquang11/note', {params: {id: req.query.id}})
    // axios.get('http://localhost:3000/bangquang11/note/:id')
        .then(function (response) {
            console.log('noteRoute: goi dc api chua')
            res.render('note', {challenge: response.data});
        })
        .catch(err => {
            res.send(err)
        })
}
route.get('/note', noteRoute);

route.get('/create', (req, res) => {
    res.render('create')
});

editRoute = (req, res) => {
    axios.get('http://localhost:3000/bangquang11/getOne', {params: {id: req.query.id}})
        .then(function (response) {
            res.render('edit', {challenge: response.data});
        })
        .catch(err => {
            res.send(err)
        })

}
route.get('/edit', editRoute);

tableRoute = (req, res) => {
    // make a req api
    axios.get('http://localhost:3000/bangquang11/findAllToDisplayInTable')
        .then(function (response) {
            res.render('table', {challenges: response.data});
        })
        .catch(err => {
            res.send(err)
        })
}
route.get('/table', tableRoute);

deleteRoute = (req, res) => {
    axios.get('http://localhost:3000/bangquang11/getOne', {params: {id: req.query.id}})
        .then(function (response) {
            res.render('delete', {challenge: response.data});
        })
        .catch(err => {
            res.send(err)
        })

}
route.get('/delete', deleteRoute);



app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));




// app.get('/', (req, res) => {
//     console.log('render home: before')
//     res.render('home')
//     console.log('render home: after')
// })

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log('server running at port: ' + port)
    console.log('vao day: ' + bangquang11)
})