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
  //Trouve l'utilisateur associé au token
  Users.findOne({ "authentification.token": token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "Invalid token" });
    }
    //Recherche les réservations associées à cet utilisateur
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
//---- Permet d'ajouter une réservation
router.post("/add", (req, res) => {
  console.log("Données reçues dans le body:", req.body);
  const { name, token, date, conversation, restaurantId } = req.body;
  if (!name || !token || !date || !conversation || !restaurantId) {
    return res.json({ result: false, error: "Missing required fields" });
  }
  //Trouve l'utilisateur correspondant au token
  Users.findOne({ "authentification.token": token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "Invalid token" });
      }
      //Recherche le chat correspondant à la réservation
      Chats.findById(conversation).then((chats) => {
        if (!chats) {
          return res.json({ result: false, error: "Chat not found" });
        }

        Restaurants.findById(restaurantId).then((restaurant) => {
          if (!restaurant) {
            return res.json({ result: false, error: "Restaurant not found" });
          }

          const newReservation = new Reservations({
            name: restaurant.name,
            users: [user._id], //L'utilisateur qui a crée la réservation est ajouté comme participant
            date,
            conversation: chats._id, //Conversation liée à cette réservation
            restaurantId: restaurant._id,
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
      });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});
//---- Inviter un utilisateur à une réservation
router.post("/invite", (req, res) => {
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
    Users.findById(userId).then((user) => {
      if (!user) {
        return res.json({ result: false, error: "User not found" });
      }
      Chats.findById(conversation).then((chats) => {
        if (!chats) {
          return res.json({ result: false, error: "Chat not found" });
        }
        // Vérifie si l'utilisateur est déjà dans la réservation
        if (reservation.users.indexOf(userId) !== -1) {
          return res.json({
            result: false,
            error: "User already in reservation",
          });
        }
        reservation.users.push(userId);
        reservation.save().then((data) => {
          return res.json({ result: true, data });
        });
      });
    });
  });
});

//----- Supprimer une réservation par Id
router.delete("/deleteUser", (req, res) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.json({ result: false, error: "Reservation ID is required" });
  }

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
    // Vérifie si l'utilisateur fait bien partie de cette réservation
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
