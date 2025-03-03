var express = require("express");
var router = express.Router();
const Reservations = require("../models/reservations");
const { token } = require("morgan");

//Permet d'afficher les réservations existantes dans mongoDb via son userId
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.json({ result: false, error: "Missing userId" });
  }

  // Recherche des réservations par userId
  Reservations.find({ users: userId })
    .populate("users")
    .then((data) => {
      if (data.length === 0) {
        return res.json({ result: false, error: "No reservations found" });
      } else {
        return res.json({ result: true, data });
      }
    });
});

//Permet d'ajouter des réservations
router.post("/", (req, res) => {
  const { name, token, date, conversation } = req.body;

  if (!name || !token || !date || !conversation) {
    res.json({ result: false, error: "Missing required fields" });
  }
  //Trouver l'utilisateur avec le token avant de créer reservation
users.findOne({token}).then((user) => {
    if(!user){
        return res.json({ result: false, error: "Invalid token" });
    }
    const newReservation = new Reservations({
        name,
        users: [user._id],
        date,
        conversation: "65e01b8c4e3a2b3c4d5e6f79",
    });
    newReservation.save().then((newReservation) => {
        res.json({ result: true, Reservations: newReservation });
    });
})
});

//supprimer une réservation
router.delete("/", (req, res) => {
  Reservations.deleteOne({
    name: req.body.name,
  }).then((data) => {
      console.log(data)
    if (data.deleteCount > 0) {
     res.json({ result: true, message: "Reservation delete" });
    } else {
        res.json({ result: false });
    }
  });
});

module.exports = router;
