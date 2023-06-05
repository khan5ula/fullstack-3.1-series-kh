const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
const urlFiltered = process.env.MONGODB_URI_FILTERED

console.log('connecting to', urlFiltered)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        const match = /^(\d{2}-\d{8}|\d{3}-\d{7})$/.test(v)
        console.log(`Testing phone number ${v}, result: ${match}`)
        return match
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true,
    minlength: 8
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)