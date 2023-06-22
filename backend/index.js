require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());

app.use(express.json());
app.use(express.static('build'));

morgan.token('body', (req) =>
  JSON.stringify(req.body));
const morganLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body',
);

app.use(morganLogger);

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  Person.countDocuments({}).then((result) =>
    response.send(`<p>Phonebook has info for ${result}
  people.</p> 
<p>${new Date()}`));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) =>
      next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((err) =>
      next(err));
});

// eslint-disable-next-line consistent-return
app.post('/api/persons', (req, res, next) => {
  if (!req.body.number || !req.body.name) {
    return res.status(400).json({
      error: 'Name or number is missing',
    });
  }

  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });

  person
    .save()
    .then((savedPerson) =>
      res.json(savedPerson))
    .catch((error) =>
      next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query',
    },
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) =>
      next(error));
});

const errorHandler = ((error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id',
    });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message,
    });
  }

  return next(error);
});

app.use(errorHandler);
const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
