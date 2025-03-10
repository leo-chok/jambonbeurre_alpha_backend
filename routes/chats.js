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

//----------------créer Une Discussion---------------------------------------------
router.post("/creeUneDiscussion", (req, res) => {
  // avec token du createur, userId de invité et title - retourne id de la discussion
  const token = req.body.token;
  let userIdHote;
  const userIdInvite = req.body.userIdInvite;
  const title = req.body.title;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    }
    console.log("token trouvé");
    userIdHote = dataUserHote._id;
    let tableauDesUsers = userIdInvite;
    console.log(tableauDesUsers);
    tableauDesUsers.push(userIdHote.toString()); //ajout de l'hote , transforme objectId en string

    console.log(tableauDesUsers);
    const newConversation = new Chat({
      users: tableauDesUsers,
      title: title,
      messages: [],
    });
    //creation d'une discussion
    newConversation.save().then((data) => {
      console.log(data);
      res.json({ Discussion: data });
    }); //then save
  }); //findOne token1
}); //route post creeUneDiscussion

//-----------affiche Une Discussion--------------------------------------------------------

router.post("/afficheUneDiscussion", (req, res) => {
  //avec id de la discussion - retourne la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if
    console.log("token trouvé");
    Chat.findById(idDiscussion).then((dataChat) => {
      res.json({ discussion: dataChat });
    }); //then Chat.findOne
  }); //User.findOne
}); //get

//----------------------inviter une autre personne dans la discussion-------------------------------------

router.post("/inviter", (req, res) => {
  //avec id de la discussion et User(invité) - ajoute un invité à la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;
  const idInvite = req.body.idInvite;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if
    Chat.updateOne({ _id: idDiscussion }, { $push: { users: idInvite } }).then(
      (data) => {
        res.json({ nouvelleInvite: idInvite });
      }
    ); //then find
  }); //findOne token1
}); //get

//--------------creer Un Message-----------------------------------------------------

router.post("/creerUnMessage", (req, res) => {
  //avec id de discussion et User(emetteur du message) et le message- ajoute un message à la discussion.
  const idDiscussion = req.body.idDiscussion;
  const message = req.body.message;
  const token = req.body.token;
  let idHote;
  let userNameHote;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if
    idHote = dataUserHote._id;
    userNameHote = dataUserHote.infos.username;

    //creation du message
    const newMessage = {
      message: message,
      date: new Date(),
      idSender: idHote,
      userName: userNameHote,
      avatar: dataUserHote.infos.avatar,
    };
    //enregistrement du message
    Chat.updateOne(
      { _id: idDiscussion },
      { $push: { messages: newMessage } }
    ).then((data) => {
      console.log(data);
      res.json({ nouveauMessage: req.body.message });
    }); //then find
  }); //findOne token1
}); //get

//-----------quitte une discussion-----------------------------------------------------------------

router.get("/quitte", (req, res) => {
  //avec id de discussion et User - quitte la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;
  let idHote;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if
    idHote = dataUserHote._id;
    //supprime l'utilisateur de la discussion
    Chat.updateOne({ _id: idDiscussion }, { $pull: { users: idHote } }).then(
      (data) => {
        //detruire la discussion si il n'y a plus personne
        Chat.findById(idDiscussion).then((dataChat) => {
          if (!dataChat) {
            return res.json({
              result: false,
              message: "la discussion n'est pas trouvé",
            });
          } //if
          if (dataChat.users.length === 0) {
            //si il n'y a plus d'utilisateur
            Chat.deleteOne({ _id: idDiscussion }).then(() => {
              console.log("ok");
              res.json({ result: true, message: "discussion effacé" });
            });
          } //if length == 0
          else res.json({ quitteLeChat: idHote });
        }); //findById
      }
    ); //then find
  }); //findOne token1
}); //get
/*
//-------------supprime chat---------------------------------------
router.get("/supChat", (req, res) => {
  //avec id de discussion et User - quitte la discussion.
  const idDiscussion = req.body.idDiscussion;
  Chat.findById(idDiscussion).then((dataChat) => {
    if (dataChat) {
      if (dataChat.users.length === 0)
        Chat.deleteOne({ _id: idDiscussion }).then(() => {
          Chat.find().then((data) => {
            console.log("ok");
            res.json({ result: true, message: "discussion effacé" });
          });
        });
    } //if
    else  res.json({ result: false, message: "la discussion n'est pas trouvé" });
  }); //findById
}); //router
*/

//------------supprime un Message---------------------------------------------------------------

router.get("/supMessage", (req, res) => {
  //avec id de discussion - supprime un message.
  const idDiscussion = req.body.idDiscussion;
  const idMessage = req.body.idMessage;
  const token = req.body.token;
  let idHote;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if dataUserHote
    idHote = dataUserHote._id;
    console.log("controle token ok, id : " + idHote);
    //controle si idHote est bien propriétaire du message
    Chat.findOne({ _id: idDiscussion }).then((dataChat) => {
      if (!dataChat) {
        return res.json({
          result: false,
          message: "la discussion n'est pas trouvé",
        });
      } //if dataChat

      console.log("discussion trouvée");
      if (
        dataChat.messages.some((element) => {
          return element.idSender == idHote && element._id == idMessage;
        })
      ) {
        console.log("message trouvé et bien proprietaire");
        Chat.updateOne(
          { _id: idDiscussion },
          { $pull: { messages: { _id: idMessage } } }
        ).then((data) => {
          res.json({ supMessage: true, data: data });
          console.log(data);
        }); //then update
      } //if dataChat some
      else
        res.json({
          result: false,
          message: "le message n'est pas trouvé ou n'existe pas",
        });
    }); //then Chat.Find
  }); // then findOne
}); //get

//---------------renvoie les discussions------------------------------------------------
//    titre personne
router.post("/getAllChat", (req, res) => {
  const token = req.body.token;
  let idHote;

  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (!dataUserHote) {
      return res.json({ result: false, message: "le token n'est pas trouvé" });
    } //if dataUserHote
    idHote = dataUserHote._id;
    //controle si idHote est bien propriétaire du message
    Chat.find({ users: idHote }).then((dataChat) => {
      if (dataChat.length === 0) {
        return res.json({ result: false, message: "pas de discussion trouvé" });
      } //if datachat
      console.log(dataChat);
      res.json({ result: true, discussion: dataChat });
    }); //Chat.find
  }); //User.findOne
}); //router.get

//---------------renvoie tous les utilisateurs pour recuperer les noms et avatars----------------------
router.get("/allUsers", function (req, res) {
  User.find()
    .select("infos")
    .then((data) => {
      console.log("get all users");
      res.json({ result: true, listUsers: data });
    });
});
module.exports = router;
