const express = require('express')
var morgan = require('morgan')
require('dotenv').config()

const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('postContent', function (req) {
    if (req.method === 'POST') {
        return JSON.stringify({
            name: req.body.name,
            number: req.body.number
        });
    } else {
        return null;
    }
});

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.status(req, res),
        tokens.url(req, res),
        tokens['response-time'](req, res),
        'ms',
        tokens.postContent(req, res)
    ].join(' ')
}));

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    }, {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    }, {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.get('/info', (req, res) => {
    const count = persons.length
    const date = new Date()
    res.send(`Phonebook has info for ${count} people<br>${date}`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const n = Math.max(...persons.map(person => person.id))
    return Math.floor(Math.random() * (101 - n)) + n;
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const nameExists = persons.some(person => person.name === body.name);
    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }

    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number,
    })

    person.save().then(newPerson => {
        response.json(newPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})