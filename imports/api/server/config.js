/* global Assets */
import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';

// collection
import { Citoyens } from '../citoyens.js';

Accounts.onLogin(function(user) {
// console.log(user.user._id)
  const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(user.user._id) }, { fields: { pwd: 0 } });

  if (!userC) {
  // throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');
  } else {
    /* if (!userC.isScope('organizations', Meteor.settings.public.orgaCibleId)) {
      Meteor.call('connectEntity', Meteor.settings.public.orgaCibleId, 'organizations', userC._id._str, 'member');
    }
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Meteor.settings.public.orgaCibleId) });
    if (orgaOne && orgaOne.isAdmin()) {
      if (orgaOne.links && orgaOne.links.projects) {
        if (userC && userC.links && userC.links.projects) {
          const arrayIds = Object.keys(orgaOne.links.projects)
            .filter(k => !(userC.links.projects[k] && userC.links.projects[k].isAdmin))
            .map((k) => {
              console.log(k);
              Citoyens.update({
                _id: new Mongo.ObjectID(userC._id._str),
              }, {
                $set: {
                  [`links.projects.${k}`]: {
                    type: 'projects',
                    isAdmin: true,
                  },
                },
              });

              Projects.update({
                _id: new Mongo.ObjectID(k),
              }, {
                $set: {
                  [`links.contributors.${userC._id._str}`]: {
                    type: 'citoyens',
                    isAdmin: true,
                  },
                },
              });
            });
        }
      }
    } */

    // ok valide
    const userM = Meteor.users.findOne({ _id: userC._id._str });
    // console.log(userM);
    if (userM && userM.profile && userM.profile.pixelhumain) {
    // Meteor.user existe
      const userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    } else {
    // username ou emails
      const userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    }
  }
});

const serviceAccountJson = JSON.parse(Assets.getText('oceco-a60b5-firebase-adminsdk-rfgzm-f8a214638f.json'));


if (Meteor.isDevelopment) {
  Push.debug = true;
  Push.Configure({
    fcm: {
      serviceAccountJson,
    },
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 653253366584,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
    sendInterval: null,
    appName: 'main',
  });
} else {
  Push.Configure({
    fcm: {
      serviceAccountJson,
    },
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 653253366584,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
    appName: 'main',
    sendBatchSize: 1000,
    keepNotifications: true,
  });
}


Push.allow({
  send() {
    return true;
  },
});

