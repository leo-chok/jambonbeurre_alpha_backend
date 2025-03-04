var express = require("express");
var router = express.Router();
const Chat = require("../models/chats");
const User = require("../models/users");
/*
router.get("/chat", (req, res) => {
  Chat.find().then((data) => {
    console.log(data);
    res.json({ all: data });
  }); //find
}); //get
*/

function getUerDataFromToken(localtoken) {
  //return data si le token existe
  //return null en cas d'erreur
  return User.findOne({ "authentification.token": localtoken }).then((data) => {
    return data;
  }); //then findOne
} //function
router.get("/chatTest", (req, res) => {
  getUerDataFromToken("").then((data) => {
    //console.log(data);
    if (data) console.log("ok");
    else console.log("nok");
    res.json({ test: "test" });
  });
});

router.post("/creeUneDiscussion", (req, res) => {
  // avec token1 token2 et title - retourne id de la discussion
  const token = req.body.token;
  let userIdHote;
  const userIdInvite = req.body.userIdInvite;
  const title = req.body.title;
  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      userIdHote = dataUserHote._id;

      const newConversation = new Chat({
        users: [userIdHote, userIdInvite],
        title: title,
        messages: [],
      });
      //creation d'une discussion
      newConversation.save().then(() => {
        Chat.findOne(
          { users: userIdHote },
          { users: userIdInvite },
          { title: title }
        ).then((dataChat) => {
          res.json({ idDiscussion: dataChat._id });
        }); //then find
      }); //then save
    } //if
  }); //findOne token1
}); //route post creeUneDiscussion

//-----------affiche Une Discussion--------------------------------------------------------

router.get("/afficheUneDiscussion", (req, res) => {
  //avec id de la discussion - retourne la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;
  let usernameHote;
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      usernameHote = dataUserHote.infos.username;
      Chat.findById(idDiscussion).then((dataChat) => {
        res.json({ discussion: dataChat });
      }); //then Chat.findOne
    } //if
  }); //User.findOne
}); //get

//----------------------inviter une autre personne dans la discussion-------------------------------------

router.post("/inviter", (req, res) => {
  //avec id de la discussion et User(invité) - ajoute un invité à la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;
  let usernameHote;
  const usernameInvite = req.body.username;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      usernameHote = dataUserHote.infos.username;

      Chat.updateOne(
        { _id: idDiscussion },
        { $push: { users: usernameInvite } }
      ).then((data) => {
        res.json({ nouvelleInvite: usernameInvite });
      }); //then find
    } //if
  }); //findOne token1
}); //get

//--------------creer Un Message-----------------------------------------------------

router.post("/creerUnMessage", (req, res) => {
  //avec id de discussion et User(emetteur du message) et le message- ajoute un message à la discussion.
  const idDiscussion = req.body.idDiscussion;

  const message = req.body.message;
  const token = req.body.token;
  let usernameHote;
console.log("helllo");
  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      usernameHote = dataUserHote.infos.username;
      console.log("usernameHote : " + usernameHote);
      const newMessage = {
        message: message,
        date: new Date(),
        sender: usernameHote,
      };
      Chat.updateOne(
        { _id: idDiscussion },
        { $push: { messages: newMessage } }
      ).then((data) => {
        console.log(data);
        res.json({ nouveauMessage: req.body.message });
      }); //then find
    } //if
  }); //findOne token1
}); //get

//-----------quitte une discussion-----------------------------------------------------------------

router.get("/quitte", (req, res) => {
  //avec id de discussion et User - quitte la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;
  let usernameHote;
  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      usernameHote = dataUserHote.infos.username;

      Chat.updateOne(
        { _id: idDiscussion },
        { $pull: { users: usernameHote } }
      ).then((data) => {
        res.json({ quitteLeChat: usernameHote });
      }); //then find
    } //if
  }); //findOne token1
}); //get

//------------supprime un Message---------------------------------------------------------------

router.get("/supMessage", (req, res) => {
  //avec id de discussion et Date - supprime un message.
  const idDiscussion = req.body.idDiscussion;
  const date = req.body.date;
  Chat.updateOne(
    { _id: idDiscussion },
    { $pull: { message: { date: date } } }
  ).then((data) => {
    res.json({ supMessage: true });
  }); //then find
}); //get

module.exports = router;
