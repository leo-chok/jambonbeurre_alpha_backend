var express = require("express");
var router = express.Router();
const Restaurants = require("../models/restaurant");
const GoogleRestaurants = require("../models/googlerestaurant");
let restaurantPhoto;
let restaurantName;
let restaurantType;
let restaurantPriceRange;
let restaurantAdress;
let restaurantRating;
let restaurantLocation;
let restaurantWebsite;
let restaurantIsOpen;

// Route POST pour créer des restaurants depuis les données Google
// Récupérer les restaurants depuis Google
router.get("/", async (req, res) => {
  GoogleRestaurants.find().then((data) => {
    for (const restaurant of data) {
      restaurantPhoto = restaurant.photos;
      restaurantName = restaurant.displayName.text;
      restaurantType = restaurant.primaryType;
      restaurantPriceRange = restaurant.priceRange;
      restaurantAdress = restaurant.formattedAddress;
      restaurantRating = restaurant.rating;
      restaurantLocation = restaurant.location;
      restaurantWebsite = restaurant.websiteUri;
      restaurantIsOpen = restaurant.currentOpeningHours;



      // Sauvegarder les données au nouveau format plus léger
      const formatedRestaurant = new Restaurants({
        photo: restaurantPhoto, //OK
        name: restaurantName,
        type: restaurantType,
        priceRange: restaurantPriceRange,
        address: restaurantAdress, //OK
        rating: restaurantRating, //OK
        location: restaurantLocation,
        website: restaurantWebsite, //OK
        openNow: restaurantIsOpen,
      });

    // Sauvegarder le résultat dans la base de données restaurants avec une route POST ????


      console.log(formatedRestaurant);
    }

    res.json({ result: data });
  });
});


// Route GET pour rechercher un restaurant par son nom
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
  const restaurant = await Restaurants.findOne({
    "displayName.text": new RegExp(restaurantName, "i"), // Recherche sur displayName.text  A CHANGER
  });

  // Vérifier si un restaurant a été trouvé
  if (!restaurant) {
    return res.json({ result: false, error: "Aucun restaurant trouvé" });
  }

  // Retourner les informations du restaurant trouvé
  res.json({ result: true, data: restaurant });
});

module.exports = router;
