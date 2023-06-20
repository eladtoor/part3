require("dotenv").config();
const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(cors());

app.use(express.json());
app.use(express.static("build"));

// app.use(morgan("tiny"));
// app.use(morgan("short"));
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
const morganLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body"
);

app.use(morganLogger);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    console.log(persons);
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people.</p> 
  <p>${new Date()}`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res) => {
  if (!req.body.number || !req.body.name) {
    return res.status(400).json({ error: "Name or number is missing" });
  }
  // if (true) { IF PERSON EXIST>>
  //   Person.find({ nae: req.body.name }).then((result) => console.log(result));
  //   return res.status(400).json({ error: "name must be unique" });
  // }
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });
  person.save().then((savedPerson) => res.json(savedPerson));
});

app.put("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  console.log(`${id} ${typeof id} here`);
  const person = persons.find((person) => person.id === id);
  const newPerson = { ...person, number: req.body.number };
  console.log(newPerson);
  persons = persons.filter((person) => person.id !== id);

  persons = persons.concat(newPerson);
  res.json(newPerson);
});
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
