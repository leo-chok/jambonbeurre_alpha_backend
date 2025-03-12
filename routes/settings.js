var express = require("express");
var router = express.Router();
const Users = require("../models/users");


//--------- Permet de modifier son mot de passe -----------------
router.put("/updatepwd", (req,res) => {
const {userId, oldPassword, newPassword} = req.body
if (!userId || !oldPassword || !newPassword) {
    return res.json({error:"Tous les champs sont requis"})
}
const user = Users.findById(userId);
if (!user)
    return res.json({error : "Utilisateur introuvable"})
})
//PAS TERMINÉ
//-------- Permet de modifier email -------------------