/* eslint-disable object-shorthand */
/* eslint-disable no-shadow */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import MJML from 'meteor/djabatav:mjml';
import { Jobs } from 'meteor/wildhart:jobs';
import { Mongo } from 'meteor/mongo';

import { ActivityStream } from '../../api/activitystream.js';
import { notifyDisplay } from '../../api/helpers.js';
import { Organizations } from '../../api/organizations.js';
import { Citoyens } from '../../api/citoyens.js';

import log from '../../startup/server/logger.js';

if (Meteor.isDevelopment) {
  Push.debug = true;
} else {
  Jobs.configure({
    log: false,
  });
}

const pushUser = (title, text, payload, query, badge) => {
  const citoyensListEmail = Citoyens.find({ _id: new Mongo.ObjectID(query.userId) }, { fields: { oceco: 1 } });
  citoyensListEmail.forEach((citoyen) => {
    const notificationPush = (citoyen && !citoyen.oceco) ? true : citoyen.oceco.notificationPush;
    if (notificationPush) {
      const notId = Math.round(new Date().getTime() / 1000);
      // console.log(payload);
      const payloadStringify = {};
      /*
      for (const key in payload) {
        if (_.isString(payload[key])) {
          payloadStringify[key] = payload[key];
        }else {
          payloadStringify[key] = JSON.stringify(payload[key]);
        }
      } */
      payloadStringify.custom_key1 = JSON.stringify(payload);
      // console.log(payloadStringify);
      Push.send({
        from: 'push',
        title,
        text,
        // payload: payloadStringify,
        sound: 'default',
        query,
        badge,
        apn: {
          sound: 'default',
        },
        contentAvailable: 1,
        androidChannel: 'PushPluginChannel',
        notId,
      });
    }
  });
};

const pushEmail = (title, text, payload, query) => {
  const citoyensListEmail = Citoyens.find({ _id: new Mongo.ObjectID(query.userId) }, { fields: { email: 1, name: 1, oceco: 1 } });
  const emailTpl = Assets.getText('mjml/notification.mjml');
  citoyensListEmail.forEach((citoyen) => {
    const notificationEmail = (citoyen && !citoyen.oceco) ? false : citoyen.oceco.notificationEmail;
    if (notificationEmail) {
      // console.log(citoyen.email);
      if ((Meteor.isProduction && citoyen.email) || (Meteor.isDevelopment && (citoyen.email === 'thomas.craipeau@gmail.com'))) {
        // eslint-disable-next-line no-undef
        const email = new MJML(emailTpl);

        email.helpers({
          message: text,
          name: citoyen.name,
          userId: citoyen._id._str,
          signature: payload.target.name,
          subject: title,
          scope: 'notifications',
          scopeName: 'Voir les notifications',
          scopeUrl: Meteor.absoluteUrl('notifications'),
          ocecoUrl: Meteor.absoluteUrl(),
        });

        const options = {};
        options.subject = `${title} - ${payload.target.name}`;


        if (Meteor.isDevelopment) {
          options.from = Meteor.settings.mailSetting.dev.from;
          options.to = Meteor.settings.mailSetting.dev.to;
        } else {
          options.from = Meteor.settings.mailSetting.prod.from;
          options.to = citoyen.email;
        }
        // Meteor.defer(() => {
        try {
          email.send(options);

        } catch (e) {
          // console.error(`Problem sending email ${logEmailId} to ${options.to}`, e);
          throw log.error(`Problem sending email notif ${title} to ${options.to}`, e);
        }
        // });
      }
    }
  });
};

const notifPermissionArray = ({ notification, linkSelect = 'follows' }) => {
  const notifsId = Object.keys(notification.notify.id).map(key => key);
  // DIRECT
  const arrayIdsUsersObjId = notifsId.map(id => new Mongo.ObjectID(id));
  const arrayEnvoieDirect = Citoyens.find({ _id: { $in: arrayIdsUsersObjId }, 'oceco.notificationAllOrga': true }, { fields: { _id: 1, 'oceco.notificationAllOrga': 1 } });
  const arrayIdsUsersEnvoieDirect = arrayEnvoieDirect.map(citoyen => citoyen._id._str);

  const queryPasDirect = {};
  queryPasDirect._id = { $in: arrayIdsUsersObjId };
  queryPasDirect['oceco.notificationAllOrga'] = false;

  const fieldsSelect = `links.${linkSelect}`;

  if (notification && notification.targetProject && notification.targetProject.id) {
    // project
    // PAS DIRECT
    // links.follows
    const linkFollowId = `${fieldsSelect}.${notification.targetProject.id}`;
    queryPasDirect[linkFollowId] = { $exists: true };

  } else if (notification && notification.target && notification.target.id) {
    // orga
    // PAS DIRECT
    // links.follows
    const linkFollowId = `${fieldsSelect}.${notification.target.id}`;
    queryPasDirect[linkFollowId] = { $exists: true };
  }

  // PAS DIRECT
  // links.follows
  const arrayEnvoiePasDirect = Citoyens.find(queryPasDirect, { fields: { _id: 1, 'oceco.notificationAllOrga': 1, 'links.follows': 1 } });
  const arrayIdsUsersyEnvoiePasDirect = arrayEnvoiePasDirect.map(citoyen => citoyen._id._str);
  const arrayIdsUsersGroup = [...arrayIdsUsersEnvoieDirect, ...arrayIdsUsersyEnvoiePasDirect];
  return arrayIdsUsersGroup;
};

Jobs.register({
  sendEmail: function (options, helpers, logEmailId) {
    // eslint-disable-next-line no-undef
    const emailTpl = Assets.getText('mjml/email.mjml');
    // eslint-disable-next-line no-undef
    const email = new MJML(emailTpl);
    email.helpers(helpers);
    try {
      email.send(options);
    } catch (e) {
      // console.error(`Problem sending email ${logEmailId} to ${options.to}`, e);
      throw log.error(`Problem sending email ${logEmailId} to ${options.to}`, e);
    }
    this.success();
  },
  pushEmail: function (notification) {
    if (notification && notification.notify && notification.notify.id && notification.notify.displayName) {
      const title = 'notification';
      // const text = notification.notify.displayName;

      /* const notifsId = _.map(notification.notify.id, function (ids, key) {
        return key;
      }); */

      const notifsId = notifPermissionArray({ notification });

      // verifier que présent dans Meteor.users
      const notifsIdMeteor = Meteor.users.find({ _id: { $in: notifsId } }, { fields: { _id: 1 } }).map(user => user._id);
      // console.log(notifsIdMeteor);
      if (notifsIdMeteor && notifsIdMeteor.length > 0) {
        _.each(notifsIdMeteor, function (value) {
          const query = {};
          query.userId = value;
          const lang = Meteor.users.findOne({ _id: value }, { fields: { 'profile.language': 1 } });
          const text = lang && lang.profile.language ? notifyDisplay(notification.notify, lang.profile.language) : notifyDisplay(notification.notify, 'en');
          const textTarget = `${text} - ${notification.target.name}`;
          const payload = JSON.parse(JSON.stringify(notification));
          // console.log({ value, badge });
          // console.log(payload);
          pushEmail(title, textTarget, payload, query);
        }, title, notification);
      }
    }
    this.success();
  },
  pushMobile: function (notification) {
    if (notification && notification.notify && notification.notify.id && notification.notify.displayName) {
      const title = 'notification';
      // const text = notification.notify.displayName;

      const notifsId = _.map(notification.notify.id, function (ids, key) {
        return key;
      });
      // verifier que présent dans Meteor.users
      const notifsIdMeteor = Meteor.users.find({ _id: { $in: notifsId } }, { fields: { _id: 1 } }).map(user => user._id);
      // console.log(notifsIdMeteor);
      if (notifsIdMeteor && notifsIdMeteor.length > 0) {
        _.each(notifsIdMeteor, function (value) {
          const query = {};
          query.userId = value;
          const lang = Meteor.users.findOne({ _id: value }, { fields: { 'profile.language': 1 } });
          const text = lang && lang.profile.language ? notifyDisplay(notification.notify, lang.profile.language) : notifyDisplay(notification.notify, 'en');
          const textTarget = `${text} - ${notification.target.name}`;
          const payload = JSON.parse(JSON.stringify(notification));
          const badge = ActivityStream.api.queryUnseen(value).count();
          // console.log({ value, badge });
          // console.log(payload);
          pushUser(title, textTarget, payload, query, badge);
        }, title, notification);
      }
    }
    this.success();
  },
});

/* Meteor.startup(function() {
  const query = { type: 'oceco' };
  query.created = { $gt: new Date() };
  const options = {};
  options.sort = { created: 1 };

  var initNotifystart = ActivityStream.find(query, options).observe({
    added(notification) {
      if (!initNotifystart) return;
      // le serveur start donc la date est fixe on recupre les notifs qui sont créer aprés
      // mais ensuite
      // console.log(JSON.stringify(notification));
      if (notification && notification.notify && notification.notify.id && notification.notify.displayName) {
        const title = 'notification';
        // const text = notification.notify.displayName;

        const notifsId = _.map(notification.notify.id, function(ids, key) {
          return key;
        });
        // verifier que présent dans Meteor.users
        const notifsIdMeteor = Meteor.users.find({ _id: { $in: notifsId } }, { fields: { _id: 1 } }).map(user => user._id);
        // console.log(notifsIdMeteor);
        if (notifsIdMeteor && notifsIdMeteor.length > 0) {
          _.each(notifsIdMeteor, function(value) {
            const query = {};
            query.userId = value;
            const lang = Meteor.users.findOne({ _id: value }, { fields: { 'profile.language': 1 } });
            const text = lang && lang.profile.language ? notifyDisplay(notification.notify, lang.profile.language) : notifyDisplay(notification.notify, 'en');
            const textTarget = `${text} - ${notification.target.name}`;
            const payload = JSON.parse(JSON.stringify(notification));
            const badge = ActivityStream.api.queryUnseen(value).count();
            // console.log({ value, badge });
            // console.log(payload);
            pushUser(title, textTarget, payload, query, badge);
            pushEmail(title, textTarget, payload, query);
          }, title, notification);
        }
      }
    },
    // eslint-disable-next-line no-unused-vars
    changed(notification, oldNotification) {
      // eslint-disable-next-line no-useless-return
      if (!initNotifystart) return;
      // console.log(JSON.stringify(notification));
    },
  },
  );
}); */
