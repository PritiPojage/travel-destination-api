
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// Sample travel destinations stored in memory
let destinations = [
  {
    id: 1,
    name: "Goa",
    country: "India",
    duration: 5,
    budget: 15000
  },
  {
    id: 2,
    name: "Manali",
    country: "India",
    duration: 4,
    budget: 12000
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    duration: 7,
    budget: 45000
  }
];

let nextId = 4;

// Validate destination request data
function validateDestination(req, res, next) {
  const { name, country, duration, budget } = req.body;

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof country !== "string" ||
    country.trim() === "" ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    typeof budget !== "number" ||
    !Number.isFinite(budget) ||
    budget < 0
  ) {
    return res.status(400).json({
      error:
        "Name and country must be non-empty strings, duration must be a positive integer, and budget must be a non-negative number."
    });
  }

  // Remove unnecessary spaces
  req.body.name = name.trim();
  req.body.country = country.trim();

  next();
}

// Validate destination ID
function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Destination ID must be a positive integer"
    });
  }

  req.destinationId = id;
  next();
}

// 1. CREATE a destination
app.post(
  "/api/destinations",
  validateDestination,
  (req, res) => {
    const { name, country, duration, budget } = req.body;

    const newDestination = {
      id: nextId++,
      name,
      country,
      duration,
      budget
    };

    destinations.push(newDestination);

    res.status(201).json({
      message: "Destination added successfully",
      destination: newDestination
    });
  }
);

// 2. READ all destinations
app.get("/api/destinations", (req, res) => {
  res.status(200).json(destinations);
});

// 3. READ a destination by ID
app.get(
  "/api/destinations/:id",
  validateId,
  (req, res) => {
    const destination = destinations.find(
      (item) => item.id === req.destinationId
    );

    if (!destination) {
      return res.status(404).json({
        error: "Destination not found"
      });
    }

    res.status(200).json(destination);
  }
);

// 4. UPDATE a destination
app.put(
  "/api/destinations/:id",
  validateId,
  validateDestination,
  (req, res) => {
    const index = destinations.findIndex(
      (item) => item.id === req.destinationId
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Destination not found"
      });
    }

    destinations[index] = {
      id: req.destinationId,
      name: req.body.name,
      country: req.body.country,
      duration: req.body.duration,
      budget: req.body.budget
    };

    res.status(200).json({
      message: "Destination updated successfully",
      destination: destinations[index]
    });
  }
);

// 5. DELETE a destination
app.delete(
  "/api/destinations/:id",
  validateId,
  (req, res) => {
    const index = destinations.findIndex(
      (item) => item.id === req.destinationId
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Destination not found"
      });
    }

    const deletedDestination = destinations.splice(index, 1)[0];

    res.status(200).json({
      message: "Destination deleted successfully",
      destination: deletedDestination
    });
  }
);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Handle malformed JSON and unexpected errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON request body"
    });
  }

  console.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(
    `Travel Destination API running at http://localhost:${PORT}`
  );
});
