var express = require("express");
var router = express.Router();
const Restaurant = require("../models/restaurant");
const GoogleRestaurants = require("../models/googlerestaurant");

// ROUTE GET pour récupérer les restaurants depuis la base de données Google

router.get("/all", async (req, res) => {
  GoogleRestaurants.find().then((data) => {
    for (const restaurant of data) {
      let restaurantName = restaurant.displayName.text;
      let restaurantType = restaurant.primaryType;
      let restaurantPriceLevel = restaurant.priceLevel;
      let restaurantAdress = restaurant.formattedAddress;
      let restaurantRating = restaurant.rating;
      let restaurantLocation = [
        restaurant.location.longitude,
        restaurant.location.latitude,
      ];
      let restaurantWebsite = restaurant.websiteUri;
      let restaurantOpeningHours = restaurant?.currentOpeningHours?.periods;

      // Sauvegarder les données au nouveau format souhaité correspondant au schéma restaurant
      const formatedRestaurant = new Restaurant({
        name: restaurantName,
        type: restaurantType,
        address: restaurantAdress,
        rating: restaurantRating,
        website: restaurantWebsite,
        priceLevel: restaurantPriceLevel,
        location: {
          type: "Point",
          coordinates: restaurantLocation,
        },
        openingHours: restaurantOpeningHours,
      });

       formatedRestaurant.save();
    }

    res.json({ result: true, googleRestaurants: data });
  });
});

// ROUTE GET pour pour récupérer tous les restaurants selon une distance donnée
router.get("/near/:distance", function (req, res) {
  const { longitude, latitude } = req.query;
  Restaurant.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude ],
        },
        $maxDistance: req.params.distance,
      },
    },
  })
    .then((data) => {
      res.json({ result: true, restaurantsList: data });
    });
});


// ROUTE GET pour rechercher un restaurant par son nom

router.get("/search/:name", async (req, res) => {
  // Récupérer le paramètre name depuis l'URL
  const restaurantName = req.params.name;

  // Vérifier que le paramètre n'est pas vide
  if (!restaurantName || restaurantName.length < 3) {
    return res.json({
      result: false,
      error: "Veuillez renseigner un nom valide",
    });
  }

  // Rechercher dans la base de données avec une regex insensible à la casse
  const restaurant = await Restaurant.findOne({
    name: new RegExp(restaurantName, "i"), // Recherche sur displayName.text  
  });

  // Vérifier si un restaurant a été trouvé
  if (!restaurant) {
    return res.json({ result: false, error: "Aucun restaurant trouvé" });
  }

  // Retourner les informations du restaurant trouvé
  res.json({ result: true, data: restaurant });
});

module.exports = router;
