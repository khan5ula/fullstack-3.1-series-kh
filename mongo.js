const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('given password as argument')
  process.exit(1)
}

const password = process.argv[2]
let newName = null
let newNumber = null

if (process.argv.length === 5) {
  newName = process.argv[3]
  newNumber = process.argv[4]
}

const url =
  `mongodb+srv://kristian:${password}@phonebook.rwyqwqb.mongodb.net/personsApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (newName && newNumber) {
  /* Name and number were provided, add them do the database */
  const newPerson = new Person({
    name: newName,
    number: newNumber,
  })

  newPerson.save().then(() => {
    console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  /* No additional parameters, display information from the database */
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}