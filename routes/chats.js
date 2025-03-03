var express = require("express");
var router = express.Router();
const Chat = require("../models/chats");
/*
router.get("/chat", (req, res) => {
  Chat.find().then((data) => {
    console.log(data);
    res.json({ all: data });
  }); //find
}); //get
*/

router.post("/creeUneDiscussion", (req, res) => {
  // avec user1 user2 et title - retourne id de la discussion
  const username1 = req.body.username1;
  const username2 = req.body.username2;
  const title = req.body.title;
  const newConversation = new Chat({
    users: [username1, username2],
    title: title,
    // message: [messageSchema],
  });
  newConversation.save().then(() => {
    // res.json({ creation: "discussion" });
    console.log("creation d'une discussion");
    Chat.findOne(
      { users: username1 },
      { users: username2 },
      { title: title }
    ).then((data) => {
      console.log(data._id);
      res.json({ id: data._id });
    }); //then find
  });
});
router.get("/afficheUneDiscussionById", (req, res) => {
  //avec id - retourne la discussion.
  const id = req.body.id;
  Chat.findById(id).then((data) => {
    console.log(data);
    res.json({ discussion: data });
  }); //then find
}); //get

router.get("/inviter", (req, res) => {
  //avec id et User(invité) - ajoute un invité à la discussion.
  Chat.updateOne(
    { _id: req.body.id },
    { $push: { users: req.body.user } }
  ).then((data) => {
    console.log(data);
    res.json({ nouvelleInvite: req.body.user });
  }); //then find
}); //get

router.get("/creerUnMessage", (req, res) => {
  //avec id et User(emetteur du message) et le message- ajoute un message à la discussion.
  const newMessage = {
    message: req.body.message,
    date: new Date(),
    sender: req.body.sender,
  };
  Chat.updateOne({ _id: req.body.id }, { $push: { message: newMessage } }).then(
    (data) => {
      console.log(data);
      res.json({ nouveauMessage: req.body.message });
    }
  ); //then find
}); //get

router.get("/quitte", (req, res) => {
  //avec id et User - quitte la discussion.
  Chat.updateOne(
    { _id: req.body.id },
    { $pull: { users: req.body.user } }
  ).then((data) => {
    console.log(data);
    res.json({ quitteLeChat: req.body.user });
  }); //then find
}); //get

router.get("/supMessage", (req, res) => {
  //avec id et Date - supprime un message.
  Chat.updateOne(
    { _id: req.body.id },
    { $pull: { message: { date: req.body.date } } }
  ).then((data) => {
    // console.log(data);
    res.json({ supMessage: true });
  }); //then find
}); //get

module.exports = router;
