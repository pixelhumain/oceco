/* eslint-disable key-spacing */
/* eslint-disable import/prefer-default-export */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import i18n from 'meteor/universe:i18n';

import { Citoyens } from '../../api/citoyens.js';
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Actions } from '../../api/actions.js';
import { LogUserActions } from '../../api/loguseractions.js';

i18n.setOptions({
  open: '__',
  close: '__',
  defaultLocale: 'en',
  sameLocaleOnServerConnection: true,
  // translationsHeaders: {'Cache-Control':'no-cache'},
});

Meteor.startup(function () {
  // liste les actions avec finishedBy exist true
  const actionsArray = Actions.find({ finishedBy: { $exists: true } });
  if (actionsArray.count() > 0 && LogUserActions.find().count() === 0) {
    actionsArray.forEach((action) => {
      // action.finishedBy
      Object.keys(action.finishedBy).forEach((key) => {
        if (action.finishedBy[key] === 'validated') {
          const parentObjectId = new Mongo.ObjectID(action.parentId);
          const orgOne = Organizations.findOne({ _id: parentObjectId });
          let orgId;
          if (orgOne) {
            orgId = orgOne._id._str;
          } else {
            const eventId = Events.findOne({ _id: parentObjectId }) ? Events.findOne({ _id: parentObjectId })._id._str : null;
            const event = eventId ? `links.events.${eventId}` : null;

            const projectId = event ? Projects.findOne({ [event]: { $exists: 1 } })._id._str : null;
            const project = projectId ? `links.projects.${projectId}` : `links.projects.${Projects.findOne({ _id: parentObjectId })._id._str}`;

            orgId = Organizations.findOne({ [project]: { $exists: 1 } })._id._str;
          }

          const logInsert = {};
          logInsert.userId = key;
          logInsert.organizationId = orgId;
          logInsert.actionId = action._id._str;
          if (action.credits) {
            logInsert.createdAt = moment(action.endDate).format();
            logInsert.credits = action.credits;
            LogUserActions.insert(logInsert);
          }
          const userActions = `userWallet.${orgId}.userActions.${action._id._str}`;
          Citoyens.update({ _id: new Mongo.ObjectID(key) }, { $unset: { [userActions]: '' } });
        }
      });
    });
  }

  // correction de tools.chat.int vide
  /* const chatProject = Projects.find({ hasRC:{ $exists:true }, slug:{ $exists:true }, 'tools.chat.int':{ $exists:false } });
  if (chatProject.count() > 0) {
    chatProject.forEach((project) => {
      let path;
      if (project.preferences.private === true || project.preferences.private === 'true') {
        path = `/group/${project.slug}`;
      } else {
        path = `/channel/${project.slug}`;
      }
      Projects.update({ _id: project._id }, { $set: { hasRC: true }, $addToSet: { 'tools.chat.int': { name: project.slug, url: path } } });
    });
  }
  const chatOrga = Organizations.find({ hasRC: { $exists: true }, slug: { $exists: true }, 'tools.chat.int': { $exists: false } });
  if (chatOrga.count() > 0) {
    chatOrga.forEach((project) => {
      let path;
      if (project.preferences.private === true || project.preferences.private === 'true') {
        path = `/group/${project.slug}`;
      } else {
        path = `/channel/${project.slug}`;
      }
      Organizations.update({ _id: project._id }, { $set: { hasRC: true }, $addToSet: { 'tools.chat.int': { name: project.slug, url: path } } });
    });
  } */

  if (Meteor.isDevelopment) {
    const protocol = Meteor.settings.mailSetting.dev.protocol;
    const username = Meteor.settings.mailSetting.dev.username;
    const password = Meteor.settings.mailSetting.dev.password;
    const host = Meteor.settings.mailSetting.dev.host;
    const port = Meteor.settings.mailSetting.dev.port;
    process.env.MAIL_URL = `${protocol}://${username}:${password}@${host}:${port}/`;
  } else if (Meteor.isProduction) {
    const protocol = Meteor.settings.mailSetting.prod.protocol;
    const username = Meteor.settings.mailSetting.prod.username;
    const password = Meteor.settings.mailSetting.prod.password;
    const host = Meteor.settings.mailSetting.prod.host;
    const port = Meteor.settings.mailSetting.prod.port;
    process.env.MAIL_URL = `${protocol}://${username}:${password}@${host}:${port}/`;
  }
});
