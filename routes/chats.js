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
    if (dataUserHote) {
      userIdHote = dataUserHote._id;

      console.log("token trouvé");
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
          res.json({ result: true, idDiscussion: dataChat._id });
        }); //then find
      }); //then save
    } //if
    else res.json({ result: false, message: "le token n'est pas trouvé" });
  }); //findOne token1
}); //route post creeUneDiscussion

//-----------affiche Une Discussion--------------------------------------------------------

router.post("/afficheUneDiscussion", (req, res) => {
  //avec id de la discussion - retourne la discussion.
  const idDiscussion = req.body.idDiscussion;
  const token = req.body.token;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      Chat.findById(idDiscussion).then((dataChat) => {
        res.json({ discussion: dataChat });
      }); //then Chat.findOne
    } //if
    else res.json({ result: false, message: "le token n'est pas trouvé" });
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
      Chat.updateOne(
        { _id: idDiscussion },
        { $push: { users: idInvite } }
      ).then((data) => {
        res.json({ nouvelleInvite: idInvite });
      }); //then find
    } //if
    else res.json({ result: false, message: "le token n'est pas trouvé" });
  }); //findOne token1
}); //get

//--------------creer Un Message-----------------------------------------------------

router.post("/creerUnMessage", (req, res) => {
  //avec id de discussion et User(emetteur du message) et le message- ajoute un message à la discussion.
  const idDiscussion = req.body.idDiscussion;
  const message = req.body.message;
  const token = req.body.token;
  let idHote;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      idHote = dataUserHote._id;
      
      //creation du message
      const newMessage = {
        message: message,
        date: new Date(),
        idSender: idHote,
      };
      //enregistrement du message
      Chat.updateOne(
        { _id: idDiscussion },
        { $push: { messages: newMessage } }
      ).then((data) => {
        console.log(data);
        res.json({ nouveauMessage: req.body.message });
      }); //then find
    } //if
    else res.json({ result: false, message: "le token n'est pas trouvé" });
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
    if (dataUserHote) {
      idHote = dataUserHote._id;
      //supprime l'utilisateur de la discussion
      Chat.updateOne({ _id: idDiscussion }, { $pull: { users: idHote } }).then(
        (data) => {
          

          //detruire la discussion si il n'y a plus personne
          Chat.findById(idDiscussion).then((dataChat) => {
            if (dataChat) {
              if (dataChat.users.length === 0){//si il n'y a plus d'utilisateur
                Chat.deleteOne({ _id: idDiscussion }).then(() => {
                  
                    console.log("ok");
                    res.json({ result: true, message: "discussion effacé" });
                  
                });
              }//if length == 0
              else res.json({ quitteLeChat: idHote });
            } //if datachat
            else  res.json({ result: false, message: "la discussion n'est pas trouvé" });
          }); //findById
        
        }
      ); //then find
    } //if
    else res.json({ result: false, message: "le token n'est pas trouvé" });
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
  //avec id de discussion et Date - supprime un message.
  const idDiscussion = req.body.idDiscussion;
  const idMessage = req.body.idMessage;
  const token = req.body.token;
  let idHote;

  //recuperation du username à partir du token
  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      idHote = dataUserHote._id;

      //controle si idHote est bien propriétaire du message
      Chat.findOne({ _id: idDiscussion }).then((dataChat) => {
        if (dataChat) {
          if (
            dataChat.messages.some((element) => {
              return element.idSender == idHote && element._id == idMessage;
            })
          ) {
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
        } //if dataChat
        else
          res.json({
            result: false,
            message: "la discussion n'est pas trouvé",
          });
      }); //then Chat.Find
    } //if dataUserHote
    else res.json({ result: false, message: "le token n'est pas trouvé" });
  }); // then findOne
}); //get

//---------------renvoie les discussions------------------------------------------------
//    titre personne
router.post("/getAllChat", (req, res) => {
  const token = req.body.token;
  let idHote;

  User.findOne({ "authentification.token": token }).then((dataUserHote) => {
    if (dataUserHote) {
      idHote = dataUserHote._id;
  
      //controle si idHote est bien propriétaire du message
      Chat.find({ users: idHote }).then((dataChat) => {
        if (dataChat.length !==0)  {
          console.log(dataChat);
          res.json({ result: true, discussion: dataChat });
        }//if datachat
        else res.json({ result: false, message: "pas de discussion trouvé" });
      });//Chat.find
    }//if dataUserHote
    else res.json({ result: false, message: "le token n'est pas trouvé" });
  });//User.findOne
  });//router.get

module.exports = router;
