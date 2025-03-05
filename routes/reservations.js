var express = require("express");
var router = express.Router();
const Reservations = require("../models/reservations");
const Users = require("../models/users");
const Chats = require("../models/chats");
const Restaurants = require("../models/restaurant");

//----- Permet d'afficher les réservations existantes via son token
router.get("/:token", (req, res) => {
  const token = req.params.token;

  if (!token) {
    return res.json({ result: false, error: "Missing token" });
  }
  //Trouver l'utilisateur correspondant au token
  Users.findOne({ "authentification.token": token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Invalid token" });
    }
    Reservations.find({ users: user._id })
      .populate("users")
      .then((data) => {
        if (data.length === 0) {
          console.log(data);
          return res.json({ result: false, error: "No reservations found" });
        } else {
          return res.json({ result: true, data });
        }
      });
  });
});
//---- Permet d'ajouter des réservations
router.post("/add", (req, res) => {
  const { name, token, date, conversation, restaurantId } = req.body;
  if (!name || !token || !date || !conversation || !restaurantId) {
    return res.json({ result: false, error: "Missing required fields" });
  }
  //Trouver l'utilisateur avec le token avant de créer reservation
  Users.findOne({ "authentification.token": token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "Invalid token" });
      }
      // Trouver le chat correspondant
      Chats.findById(conversation).then((chats) => {
        if (!chats) {
          return res.json({ result: false, error: "Chat not found" });
        }
        // Créer la réservation après avoir trouvé le chat
        const newReservation = new Reservations({
          name,
          users: [user._id],
          date,
          conversation: chats._id,
        });
        return newReservation
          .save()
          .then((newReservation) => {
            res.json({ result: true, Reservations: newReservation });
          })
          .catch((error) => {
            res.json({ result: false, error: error.message });
          });
      });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});


//----- Supprimer une réservation par Id
router.delete("/deleteUser", (req, res) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.json({ result: false, error: "Reservation ID is required" });
  }
  console.log(reservationId);
  Reservations.deleteOne({
    _id: reservationId,
  }).then((data) => {
    console.log(data);
    if (data.deletedCount > 0) {
      return res.json({ result: true, message: "Reservation delete" });
    } else {
      res.json({ result: false, message: "Reservation not found" });
    }
  });
});

// ---- Quitter une réservation
router.delete("/leaveReservation", (req, res) => {
  const { reservationId, userId } = req.body;

  if (!reservationId || !userId) {
    return res.json({
      result: false,
      error: "Reservation ID and User ID are required",
    });
  }
  Reservations.findById(reservationId).then((reservation) => {
    if (!reservation) {
      return res.json({ result: false, error: "Reservation not found" });
    }
    // Vérifie si l'utilisateur fait partie de la réservation
    if (reservation.users.indexOf(userId) === -1) {
      return res.json({ result: false, error: "User not in reservation" });
    }
    reservation.users = reservation.users.filter((user) => user != userId);
    reservation.save().then((data) => {
      return res.json({ result: true, data });
    });
  });
});
module.exports = router;
