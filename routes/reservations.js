var express = require("express");
var router = express.Router();
const Reservations = require("../models/reservations");
const Users = require("../models/users");
const Chats = require("../models/chats");
const Restaurants = require("../models/restaurant");

//------------------- Permet d'afficher les réservations existantes via son token ------------------------
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
//------------------- Permet d'afficher les reservations via restaurantsID ------------------------
router.get("/restaurant/:restaurantId", (req, res) => {
  const restaurantId = req.params.restaurantId;
  if (!restaurantId) {
    return res.json({ result: false, error: "Missing restaurant ID" });
  }
  Restaurants.findById(restaurantId).then((restaurant) => {
    if (!restaurant) {
      return res.json({ result: false, error: "Restaurant not found" });
    }
    Reservations.find({ restaurants: restaurantId })
      .populate("users")
      .select("infos")
      .then((data) => {
        if (data.length === 0) {
          return res.json({ result: false, error: "No reservations found" });
        } else {
          return res.json({ result: true, data });
        }
      });
  });
});
//------------------- Permet d'afficher les reservations via usersID ------------------------
router.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.json({ result: false, error: "Missing user ID" });
  }
  Users.findById(userId).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }
    Reservations.find({ users: userId })
      .populate("users")
      .select("infos")
      .then((data) => {
        if (data.length === 0) {
          return res.json({ result: false, error: "No reservations found" });
        } else {
          return res.json({ result: true, data });
        }
      });
  });
});
//------------------- Permet d'ajouter une réservation ------------------------
router.post("/add", (req, res) => {
  const { name, token, date, restaurantId } = req.body;
  if (!name || !token || !date || !restaurantId) {
    return res.json({ result: false, error: "Missing required fields" });
  }
  //Trouve l'utilisateur correspondant au token
  Users.findOne({ "authentification.token": token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "Invalid token" });
      }

      Restaurants.findById(restaurantId).then((restaurant) => {
        if (!restaurant) {
          return res.json({ result: false, error: "Restaurant not found" });
        }
        const newConversation = new Chats({
          users: [user._id],
          title: "",
          messages: [],
        });
        const newReservation = new Reservations({
          name: restaurant.name,
          users: [user._id], //L'utilisateur qui a crée la réservation est ajouté comme participant
          date: date,
          conversation: newConversation._id, //Conversation liée à cette réservation
          restaurants: restaurant._id,
        });
        newConversation.save();
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

//------------------- Inviter un utilisateur à une réservation ------------------------
router.post("/invite", (req, res) => {
  const { reservationId, userId } = req.body;
  Reservations.findById(reservationId).then((reservation) => {
    if (!reservation) {
      return res.json({ result: false, error: "Réservation introuvable" });
    }
    // Vérifie si l'utilisateur est déjà dans la réservation
    if (reservation.users.includes(userId)) {
      return res.json({ result: false, error: "Utilisateur déjà invité" });
    }
    reservation.users.push(userId);
    reservation.save().then((data) => {
      return res.json({ result: true, data });
    });
  });
});

//------------------- Supprimer une réservation par Id ------------------------
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

// ------------------- Quitter une réservation ------------------------
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
