"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const request = require("request");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`
});

exports.getCredential = functions.https.onRequest((req, res) => {
  const uid = req.body.email;

  if (uid) {
    admin
      .auth()
      .createCustomToken(uid)
      .then(function(customToken) {
        res.send(customToken);
      })
      .catch(function(error) {
        console.error("Error creating custom token:", error);
        res.status(500).send("Error creating custom token");
      });
  } else {
    console.error("No email provided");
    res.status(400).send('No email provided');
  }
});
