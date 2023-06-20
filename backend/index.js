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
  Person.countDocuments({}).then((result) =>
    response.send(`<p>Phonebook has info for ${result}
  people.</p> 
<p>${new Date()}`)
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  const person = Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res, next) => {
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
  console.log(person.validateSync());
  person
    .save()
    .then((savedPerson) => res.json(savedPerson))
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
