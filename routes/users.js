var express = require("express");
var router = express.Router();

const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
require("../models/connection");
const User = require("../models/users");

const { faker } = require("@faker-js/faker");
const randomLocation = require("random-location");

// Route pour récupérer tous les utilisateurs
router.get("/all", function (req, res) {
  User.find().then((data) => {
    res.json({ result: true, listUsers: data });
  });
});

// Route pour récupérer tous les utilisateurs sous une distance donnée
router.get("/near/:distance", function (req, res) {
  const { longitude, latitude } = req.query;
  User.find({
    "infos.location": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: req.params.distance,
      },
    },
  })
    .select("infos")
    .then((data) => {
      res.json({ result: true, listUsers: data });
    });
});

// Route récupération Utilisateur by Token
router.get("/:token", (req, res) => {
  User.find({ "authentification.token": req.params.token })
    .select("infos description preferences")
    .then((data) => {
      if (data.length !== 0) {
        res.json({ result: true, userInfos: data });
      } else {
        res.json({ result: false, userInfos: "User not found" });
      }
    });
});

// Route récupération Utilisateur by Object_Id
router.get("/other/:id", (req, res) => {
  User.findById(req.params.id)
    .select("infos description preferences")
    .then((data) => {
      if (data) {
        res.json({ result: true, userInfos: data });
      } else {
        res.json({ result: false, userInfos: "User not found" });
      }
    });
});

// Route de Signup (création d'un utilisateur)
router.post("/signup", (req, res) => {
  // Vérification si les champs sont remplis
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Destructuration du req.body
  const { email, password } = req.body;

  //Vérification si l'email n'est pas déjà enregistré
  User.findOne({ "authentification.email": email }).then((data) => {
    if (!data) {
      // Hashage du password et attribution d'un token
      const hash = bcrypt.hashSync(password, 10);
      const token = uid2(32);

      // Creation User
      const newUser = new User({
        infos: {
          username: "",
          firstname: "",
          lastname: "",
          avatar: "avatar_01.png",
          online: true,
          location: {
            type: "Point",
            coordinates: [3.0644092, 50.6490435],
          },
        },
        authentification: {
          email: email,
          password: hash,
          token: token,
        },
        description: {
          work: "",
          bio: "",
        },
        preferences: {
          favBuddies: [],
          favRestaurant: [],
          favFood: [],
          hobbies: [],
          languages: [],
          holidays: false,
          lunchtime: [
            {
              name: "Lundi",
              start: "12:00",
              stop: "13:00",
              worked: true,
            },
            {
              name: "Mardi",
              start: "12:00",
              stop: "13:00",
              worked: true,
            },
            {
              name: "Mercredi",
              start: "12:00",
              stop: "13:00",
              worked: true,
            },
            {
              name: "Jeudi",
              start: "12:00",
              stop: "13:00",
              worked: true,
            },
            {
              name: "Vendredi",
              start: "12:00",
              stop: "13:00",
              worked: true,
            },
            {
              name: "Samedi",
              start: null,
              stop: null,
              worked: false,
            },
            {
              name: "Dimanche",
              start: null,
              stop: null,
              worked: false,
            },
          ],
        },
      });
      //Sauvegarde de l'utilisateur avec résult
      newUser
        .save()
        .then((data) => {
          res.json({ result: true, newUser: data.authentification.token });
        })
        .catch((error) => {
          res.json({ result: false, info: String(error) });
        });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

// Route de Signin (Vérification utilisateur)
router.post("/signin", (req, res) => {
  // Vérification si les champs sont remplis
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Destructuration du req.body
  const { email, password } = req.body;

  // Recherche par email
  User.findOne({ "authentification.email": email }).then((data) => {
    if (data && bcrypt.compareSync(password, data.authentification.password)) {
      res.json({ result: true, userInfos: data});
    } else if (data) {
      res.json({ result: false, info: "Authentification failed" });
    } else {
      res.json({ result: false, info: "User doesn't exist" });
    }
  });
});

// Route de mise à jour du profil utilisateur (Signup et Edit profile)
router.post("/update", (req, res) => {
  // Destructuration du req.body (Tous les champs ne sont pas forcément définis)
  const {
    username,
    firstname,
    lastname,
    online,
    avatar,
    location,
    token,
    work,
    bio,
    favBuddies,
    favRestaurant,
    favFood,
    hobbies,
    languages,
    holidays,
    lunchtime,
  } = req.body;

  User.findOne({ "authentification.token": token }).then(async (data) => {
    // Si utilisateur trouvé par ID
    if (data) {
      // Création d'un tableau des éléments qui seront modifiés pour avoir en réponse

      const listModifications = [];

      // Modifications des éléments SI élément existe

      if (username) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.username": username }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(username);
        }
      }

      if (firstname) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.firstname": firstname }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(firstname);
        }
      }

      if (lastname) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.lastname": lastname }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(lastname);
        }
      }

      if (avatar) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.avatar": avatar }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(avatar);
        }
      }

      if (online) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.online": online }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(online);
        }
      }

      if (location) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "infos.location.coordinates": location }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(location);
        }
      }

      if (work) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "description.work": work }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(work);
        }
      }

      if (bio) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "description.bio": bio }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(bio);
        }
      }

      if (favBuddies) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.favBuddies": favBuddies }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(favBuddies);
        }
      }

      if (favRestaurant) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.favRestaurant": favRestaurant }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(favRestaurant);
        }
      }

      if (favFood) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.favFood": favFood }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(favFood);
        }
      }

      if (hobbies) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.hobbies": hobbies }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(hobbies);
        }
      }

      if (languages) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.languages": languages }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(languages);
        }
      }

      if (holidays !== undefined) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.holidays": holidays }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(holidays);
        }
      }

      if (lunchtime) {
        const data = await User.updateOne(
          { "authentification.token": token },
          { "preferences.lunchtime": lunchtime }
        );
        if (data.modifiedCount === 1) {
          listModifications.push(lunchtime);
        }
      }

      res.json({ modifications: listModifications.length });
    } else {
      res.json({ result: false, error: "Can't find user by this Id" });
    }
  });
});

// Route de Desinscription (Besoin email et mot de passe)
router.delete("/unsuscribe", (req, res) => {
  // Vérification si les champs sont remplis
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Destructuration du req.body
  const { email, password } = req.body;

  // Recherche par email
  User.findOne({ "authentification.email": email }).then((data) => {
    if (data && bcrypt.compareSync(password, data.authentification.password)) {
      User.deleteOne({ "authentification.email": email }).then(() => {
        res.json({ result: true, user: "User deleted" });
      });
    } else if (data) {
      res.json({ result: false, info: "Authentification failed" });
    } else {
      res.json({ result: false, info: "User doesn't exist" });
    }
  });
});

// Génération d'un faux utilisateur
router.post("/addfake", (req, res) => {
  // Hashage du password et attribution d'un token
  const hash = uid2(16);
  const token = uid2(32);
  const P = {
    latitude: 50.6490435,
    longitude: 3.0644092,
  };

  const R = 4000; // meters

  const randomPoint = randomLocation.randomCirclePoint(P, R);

  // Creation User
  const newUser = new User({
    infos: {
      username: faker.person.fullName(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      avatar: faker.image.avatar(),
      online: true,
      location: {
        type: "Point",
        coordinates: [randomPoint.longitude, randomPoint.latitude],
      },
    },
    authentification: {
      email: faker.internet.email(),
      password: hash,
      token: token,
    },
    description: {
      work: faker.person.jobTitle(),
      bio: faker.person.bio(),
    },
    preferences: {
      favBuddies: [],
      favRestaurant: [],
      favFood: [],
      hobbies: [],
      languages: [],
      holidays: false,
      lunchtime: [
        {
          name: "Lundi",
          start: "12:00",
          stop: "13:00",
          worked: true,
        },
        {
          name: "Mardi",
          start: "12:00",
          stop: "13:00",
          worked: true,
        },
        {
          name: "Mercredi",
          start: "12:00",
          stop: "13:00",
          worked: true,
        },
        {
          name: "Jeudi",
          start: "12:00",
          stop: "13:00",
          worked: true,
        },
        {
          name: "Vendredi",
          start: "12:00",
          stop: "13:00",
          worked: true,
        },
        {
          name: "Samedi",
          start: null,
          stop: null,
          worked: false,
        },
        {
          name: "Dimanche",
          start: null,
          stop: null,
          worked: false,
        },
      ],
    },
  });
  //Sauvegarde de l'utilisateur avec résult
  newUser
    .save()
    .then((data) => {
      res.json({ result: true, newUser: data.authentification.token });
    })
    .catch((error) => {
      res.json({ result: false, info: String(error) });
    });
});

module.exports = router;
