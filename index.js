const express = require('express')
var morgan = require('morgan')
require('dotenv').config()

const app = express()
const cors = require('cors')
const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

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
app.use(errorHandler)

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

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    const count = persons.length
    const date = new Date()
    res.send(`Phonebook has info for ${count} people<br>${date}`)
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})