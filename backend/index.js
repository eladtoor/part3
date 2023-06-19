const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.static("build"));
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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
  response.json(persons);
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

app.delete("/api/persons/:id", (request, response) => {
  console.log("here");
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (req, res) => {
  if (!req.body.number || !req.body.name) {
    return res.status(400).json({ error: "Name or number is missing" });
  }
  if (persons.find((person) => person.name === req.body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }
  const person = {
    id: Math.floor(Math.random() * 2147483647),
    name: req.body.name,
    number: req.body.number,
  };
  persons = persons.concat(person);

  return res.json(person);
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

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
