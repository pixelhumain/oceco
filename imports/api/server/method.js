/* eslint-disable no-undef */
/* eslint-disable no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable no-empty */
/* eslint-disable meteor/audit-argument-checks */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { HTTP } from 'meteor/http';
import { URL } from 'meteor/url';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { ValidEmail, IsValidEmail } from 'meteor/froatsnook:valid-email';
import { Email } from 'meteor/email';
import { Jobs } from 'meteor/wildhart:jobs';
import MJML from 'meteor/djabatav:mjml';

import log from '../../startup/server/logger.js';

// collection et schemas
// import { NotificationHistory } from '../notification_history.js';
import { ActivityStream } from '../activitystream.js';
import { Citoyens, BlockCitoyensRest, SchemasCitoyensRest, SchemasInvitationsRest, SchemasFollowRest, SchemasInviteAttendeesEventRest, SchemasCitoyensOcecoRest } from '../citoyens.js';
import { News, SchemasNewsRest, SchemasNewsRestBase } from '../news.js';
import { Cities } from '../cities.js';
import { Tags } from '../lists.js';
import { Events, SchemasEventsRest, BlockEventsRest } from '../events.js';
import { Organizations, SchemasOrganizationsRest, BlockOrganizationsRest, SchemasOrganizationsOcecoRest } from '../organizations.js';
import { Projects, SchemasProjectsRest, BlockProjectsRest } from '../projects.js';
import { Comments, SchemasCommentsRest, SchemasCommentsEditRest } from '../comments.js';
import { LogEmailOceco, SchemasMessagesRest } from '../logemailsend.js';
import { SchemasShareRest, SchemasRolesRest } from '../schema.js';
// DDA
import { Actions, SchemasActionsRest } from '../actions.js';
import { LogUserActions } from '../loguseractions.js';
import { Resolutions } from '../resolutions.js';
import { Rooms, SchemasRoomsRest } from '../rooms.js';
import { Proposals, SchemasProposalsRest, BlockProposalsRest } from '../proposals.js';

// function api
import { apiCommunecter } from './api.js';

// helpers
import { encodeString, nameToCollection, arrayLinkToModerate, matchTags } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Citoyens = Citoyens;
global.Actions = Actions;
global.Resolutions = Resolutions;
global.Rooms = Rooms;
global.Proposals = Proposals;

SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = 'validation-error';
  ddpError.details = error.details;
  return ddpError;
});

function typeOfNaN(x) {
  if (Number.isNaN(x)) {
    return true;
  }
  if (isNaN(x)) {
    return true;
  }
  return false;
}

const baseDocRetour = (docRetour, doc, scope) => {
  if (scope === 'block') {
    if (doc.typeElement === 'citoyens') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.telegram = doc.telegram ? doc.telegram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.email = doc.email;
        docRetour.url = doc.url ? doc.url : '';
        docRetour.fixe = doc.fixe ? doc.fixe : '';
        docRetour.mobile = doc.mobile ? doc.mobile : '';
        docRetour.fax = doc.fax ? doc.fax : '';
        docRetour.birthDate = doc.birthDate ? moment(doc.birthDate).format() : '';
      }
      if (doc.block === 'preferences') {
        // preferences
      }
    } else if (doc.typeElement === 'events') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.type = doc.type;
        docRetour.url = doc.url ? doc.url : '';
      }
      if (doc.block === 'when') {
        // docRetour.allDay = doc.allDay;
        docRetour.startDate = moment(doc.startDate).format();
        docRetour.endDate = moment(doc.endDate).format();
      }
    } else if (doc.typeElement === 'projects') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.avancement = doc.avancement ? doc.avancement : '';
        docRetour.url = doc.url ? doc.url : '';
      }
      if (doc.block === 'when') {
        docRetour.startDate = moment(doc.startDate).format();
        docRetour.endDate = moment(doc.endDate).format();
      }
    } else if (doc.typeElement === 'poi') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
      }
    } else if (doc.typeElement === 'organizations') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.type = doc.type;
        docRetour.email = doc.email ? doc.email : null;
        docRetour.url = doc.url ? doc.url : '';
        docRetour.fixe = doc.fixe ? doc.fixe : '';
        docRetour.mobile = doc.mobile ? doc.mobile : '';
        docRetour.fax = doc.fax ? doc.fax : '';
      }
    }
  } else if (scope === 'events') {
    docRetour.name = doc.name;
    // docRetour.description = doc.description ? doc.description : '';
    if (doc.description) {
      docRetour.description = doc.description;
    }
    if (doc.shortDescription) {
      docRetour.shortDescription = doc.shortDescription;
    }
    docRetour.type = doc.type;
    // docRetour.allDay = doc.allDay;
    docRetour.startDate = moment(doc.startDate).format();
    docRetour.endDate = moment(doc.endDate).format();
    docRetour.organizerId = doc.organizerId;
    docRetour.organizerType = doc.organizerType;
    docRetour.organizer = {};
    docRetour.organizer[doc.organizerId] = { type: doc.organizerType };
    docRetour.tags = doc.tags ? doc.tags : '';
    if (doc.parentId) {
      docRetour.parentId = doc.parentId;
    }
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
  } else if (scope === 'organizations') {
    docRetour.name = doc.name;
    // docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.type = doc.type;
    docRetour.role = doc.role;
    docRetour.email = doc.email ? doc.email : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'projects') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.startDate = doc.startDate ? moment(doc.startDate).format() : '';
    docRetour.endDate = doc.endDate ? moment(doc.endDate).format() : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    docRetour.parent = {};
    docRetour.parent[doc.parentId] = { type: doc.parentType };
    docRetour.public = doc.public;
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'poi') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.urls = doc.urls ? doc.urls : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    docRetour.parent = {};
    docRetour.parent[doc.parentId] = { type: doc.parentType };
    docRetour.type = doc.type;
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'classified') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.section = doc.section;
    docRetour.type = doc.type;
    docRetour.subtype = doc.subtype ? doc.subtype : '';
    docRetour.contactInfo = doc.contactInfo ? doc.contactInfo : '';
    docRetour.price = doc.price ? doc.price : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    docRetour.parent = {};
    docRetour.parent[doc.parentId] = { type: doc.parentType };
    docRetour.tags = doc.tags ? doc.tags : '';
  } else {
    if (doc.name) {
      docRetour.name = doc.name;
    }
    if (doc.description) {
      docRetour.description = doc.description;
    }
    if (doc.shortDescription) {
      docRetour.shortDescription = doc.shortDescription;
    }
    if (doc.startDate) {
      docRetour.startDate = moment(doc.startDate).format();
    }
    if (doc.endDate) {
      docRetour.endDate = moment(doc.endDate).format();
    }
    if (doc.allDay) {
      docRetour.allDay = doc.allDay;
    }
    if (doc.organizerId) {
      docRetour.organizerId = doc.organizerId;
    }
    if (doc.organizerType) {
      docRetour.organizerType = doc.organizerType;
    }
    if (doc.type) {
      docRetour.type = doc.type;
    }
    if (doc.role) {
      docRetour.role = doc.role;
    }
    if (doc.email) {
      docRetour.email = doc.email;
    }
    if (doc.url) {
      docRetour.url = doc.url;
    }
    if (doc.tags) {
      docRetour.tags = doc.tags;
    }
  }

  /* if(doc.preferences){
  docRetour.preferences = doc.preferences;
  } else {
    if(doc['preferences.isOpenData']){
      if(!docRetour.preferences){
        docRetour.preferences={};
      }
        docRetour.preferences['isOpenData'] = doc['preferences.isOpenData'];
    }
    if(doc['preferences.isOpenEdition']){
      if(!docRetour.preferences){
        docRetour.preferences={};
      }
        docRetour.preferences['isOpenEdition'] = doc['preferences.isOpenEdition'];
    }
  } */

  if (doc.block === 'locality') {
    docRetour.name = 'locality';
    docRetour.value = {};
    docRetour.value.unikey = `${doc.country}_${doc.city}-${doc.postalCode}`;
    docRetour.value.address = {};
    docRetour.value.address['@type'] = 'PostalAddress';
    docRetour.value.address.addressCountry = doc.country;
    docRetour.value.address.postalCode = doc.postalCode;
    docRetour.value.address.codeInsee = doc.city;
    docRetour.value.address.addressLocality = doc.cityName;
    if (doc.localityId) {
      docRetour.value.address.localityId = doc.localityId;
      const locality = Cities.findOne({ _id: new Mongo.ObjectID(doc.localityId) });
      docRetour.value.address.level1 = locality.level1;
      docRetour.value.address.level1Name = locality.level1Name;
      if (locality.level2) {
        docRetour.value.address.level2 = locality.level2;
        docRetour.value.address.level2Name = locality.level2Name;
      }
      docRetour.value.address.level3 = locality.level3;
      docRetour.value.address.level3Name = locality.level3Name;
      docRetour.value.address.level4 = locality.level4;
      docRetour.value.address.level4Name = locality.level4Name;
    }
    docRetour.value.address.regionName = doc.regionName;
    docRetour.value.address.depName = doc.depName;
    if (doc.streetAddress) {
      docRetour.value.address.streetAddress = doc.streetAddress;
    }
    if (doc.geoPosLatitude && doc.geoPosLongitude) {
      docRetour.value.geo = {};
      docRetour.value.geo.latitude = doc.geoPosLatitude;
      docRetour.value.geo.longitude = doc.geoPosLongitude;
      docRetour.value.geo['@type'] = 'GeoCoordinates';
      docRetour.value.geoPosition = {};
      docRetour.value.geoPosition.type = 'Point';
      docRetour.value.geoPosition.coordinates = [parseFloat(doc.geoPosLongitude), parseFloat(doc.geoPosLatitude)];
    }
  } else {
    if (doc.country || doc.postalCode || doc.city || doc.cityName || doc.regionName || doc.depName || doc.streetAddress) {
      docRetour.address = {};
      docRetour.address['@type'] = 'PostalAddress';
      docRetour.address.addressCountry = doc.country;
      docRetour.address.postalCode = doc.postalCode;
      docRetour.address.codeInsee = doc.city;
      docRetour.address.addressLocality = doc.cityName;
      if (doc.localityId) {
        docRetour.address.localityId = doc.localityId;
        const locality = Cities.findOne({ _id: new Mongo.ObjectID(doc.localityId) });
        docRetour.address.level1 = locality.level1;
        docRetour.address.level1Name = locality.level1Name;
        if (locality.level2) {
          docRetour.address.level2 = locality.level2;
          docRetour.address.level2Name = locality.level2Name;
        }
        docRetour.address.level3 = locality.level3;
        docRetour.address.level3Name = locality.level3Name;
        docRetour.address.level4 = locality.level4;
        docRetour.address.level4Name = locality.level4Name;
      }
      docRetour.address.regionName = doc.regionName;
      docRetour.address.depName = doc.depName;

      if (doc.streetAddress) {
        docRetour.address.streetAddress = doc.streetAddress;
      }
      /*
address[level1]:58be4af494ef47df1d0ddbcc
address[level1Name]:
address[localityId]:54c0965cf6b95c141800a517
address[level3]:58be4af494ef47df1d0ddbcc
address[level3Name]:
address[level4]:58be4af494ef47df1d0ddbcc
address[level4Name]:
*/
    }
    if (doc.geoPosLatitude && doc.geoPosLongitude) {
      docRetour.geo = {};
      docRetour.geo.latitude = doc.geoPosLatitude;
      docRetour.geo.longitude = doc.geoPosLongitude;
      docRetour.geo['@type'] = 'GeoCoordinates';
      docRetour.geoPosition = {};
      docRetour.geoPosition.type = 'Point';
      docRetour.geoPosition.coordinates = [parseFloat(doc.geoPosLongitude), parseFloat(doc.geoPosLatitude)];
    }
  }

  return docRetour;
};

URL._encodeParams = function(params, prefix) {
  const str = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const p in params) {
    // eslint-disable-next-line no-prototype-builtins
    if (params.hasOwnProperty(p)) {
      const k = prefix ? `${prefix}[${p}]` : p;
      const v = params[p];
      if (typeof v === 'object') {
        str.push(this._encodeParams(v, k));
      } else {
        const encodedKey = encodeString(k).replace('%5B', '[').replace('%5D', ']');
        str.push(`${encodedKey}=${encodeString(v)}`);
      }
    }
  }
  return str.join('&').replace(/%20/g, '+');
};

const countActionScope = (parentType, parentId, status) => {
  // ajouter
  /* actionsCount {
      todo : 1,
      done : 0,
      disabled: 0,
    } */
  const actionsCount = `actionsCount.${status}`;
  const collection = nameToCollection(parentType);
  if (!collection.findOne({ _id: new Mongo.ObjectID(parentId), [actionsCount]: { $exists: 1 } })) {
    // console.log('existe pas');
    collection.update({ _id: new Mongo.ObjectID(parentId) }, { $set: { [actionsCount]: 1 } });
    if (status === 'done' || status === 'disabled') {
      collection.update({ _id: new Mongo.ObjectID(parentId) }, { $inc: { 'actionsCount.todo': -1 } });
    }
  } else {
    collection.update({ _id: new Mongo.ObjectID(parentId) }, { $inc: { [actionsCount]: 1 } });
    // console.log('existe');
    if (status === 'done' || status === 'disabled') {
      collection.update({ _id: new Mongo.ObjectID(parentId) }, { $inc: { 'actionsCount.todo': -1 } });
    }
  }
  //
};

Meteor.methods({
  'testSendRC'({ userId, parentType, parentId, msg }) {
    new SimpleSchema({
      userId: { type: String },
      parentType: { type: String },
      parentId: { type: String },
      msg: { type: String },
    }).validate({ userId, parentType, parentId, msg });
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!Meteor.isDevelopment) {
      throw new Meteor.Error('not-authorized');
    }

    const collectionScope = nameToCollection(parentType);
    const scopeOne = collectionScope.findOne({
      _id: new Mongo.ObjectID(parentId), 'tools.chat': { $exists: true }, slug: { $exists: true },
    });

    /*
    version simple avec un chat par element en utilisant le slug
    mais si ça change coté communecter il faudra adapter

    oceco.notificationChat
    */

    if (!scopeOne) {
      throw new Meteor.Error('not-chat-room-co');
    }

    /*
    il faut que l'user ce soit deja connecter au chat une fois pour ecrire à ça place
    */

    const params = {};
    params.text = msg;
    const retour = apiCommunecter.callRCPostMessage(scopeOne.slug, params, userId);
    return retour;
  },
  'testNotif'({ idOrganization, idAction, idAuthor, verb }) {
    new SimpleSchema({
      idAction: { type: String },
      idOrganization: { type: String },
      idAuthor: { type: String },
      verb: { type: String },
    }).validate({ idAction, idOrganization, idAuthor, verb });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!Meteor.isDevelopment) {
      throw new Meteor.Error('not-authorized');
    }

    const actionOne = Actions.findOne({
      _id: new Mongo.ObjectID(idAction),
    });
    if (!actionOne) {
      throw new Meteor.Error('not-action');
    }

    const organizationOne = Organizations.findOne({
      _id: new Mongo.ObjectID(idOrganization),
    });

    if (!organizationOne) {
      throw new Meteor.Error('not-action');
    }

    const notif = {};
    // author
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(idAuthor) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });

    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };

    // target
    notif.target = { id: organizationOne._id._str, name: organizationOne.name, type: 'organizations', links: organizationOne.links };

    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };

    // ActivityStream.api.add(notif, verb, 'isUser', '5e736fd6b6ebaf0d008b4579');
    ActivityStream.api.add(notif, verb, 'isAdmin');
  },
  'testConnectAdmin'({ id }) {
    new SimpleSchema({
      id: { type: String },
    }).validate({ id });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(id) });

    const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { pwd: 0 } });
    // setting user oceco
    if (userC && !userC.oceco) {
      Citoyens.update({
        _id: new Mongo.ObjectID(userC._id._str),
      }, {
        $set: {
          oceco: {
            notificationPush: true,
            notificationEmail: false,
            notificationAllOrga: true,
          },
        },
      });
    }

    // membre auto true
    if (orgaOne && orgaOne.oceco && orgaOne.oceco.memberAuto) {
      if (!userC.isScope('organizations', id)) {
        Meteor.call('connectEntity', id, 'organizations', userC._id._str, 'member');
      }
    }

    // admin
    if (orgaOne && orgaOne.isAdmin()) {
      if (orgaOne.links && orgaOne.links.projects) {
        if (userC) {
          // eslint-disable-next-line no-unused-vars
          const arrayIds = Object.keys(orgaOne.links.projects)
            .filter(k => !(userC.links && userC.links.projects && userC.links.projects[k] && userC.links.projects[k].isAdmin && !userC.links.projects[k].isInviting))
            // eslint-disable-next-line array-callback-return
            .map((k) => {
              // console.log(k);
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
    }
    return true;
  },
  'finishAction'({ id }) {
    new SimpleSchema({
      id: { type: String },
    }).validate({ id });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const actionOne = Actions.findOne({ _id: new Mongo.ObjectID(id) });
    if (!actionOne) {
      throw new Meteor.Error('not-action');
    }

    if (!actionOne.isContributors()) {
      throw new Meteor.Error('is-not-contributor');
    }

    const actionId = new Mongo.ObjectID(id);
    const parent = `finishedBy.${Meteor.userId()}`;
    Actions.update({ _id: actionId }, { $set: { [parent]: 'toModerate' } });

    // notification

    if (actionOne && actionOne.max === 1 && actionOne.min === 1 && !actionOne.endDate) {
      Actions.update({ _id: actionId }, { $set: { endDate: new Date() } });
    }

    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
    ActivityStream.api.add(notif, 'finish', 'isAdmin');

    return true;
  },
  'finishActionAdmin'({ actId, usrId, orgId }) {
    new SimpleSchema({
      actId: { type: String },
      usrId: { type: String },
      orgId: { type: String },
    }).validate({ actId, usrId, orgId });


    // je valide pas un user dans etat je le met
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!Organizations.findOne({
      _id: new Mongo.ObjectID(orgId),
    })) {
      throw new Meteor.Error('not-orga');
    }

    const action = Actions.findOne({ _id: new Mongo.ObjectID(actId) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }
    const collection = nameToCollection(action.parentType);

    if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const actionId = new Mongo.ObjectID(actId);
    const parent = `finishedBy.${usrId}`;
    Actions.update({ _id: actionId }, { $set: { [parent]: 'toModerate' } });

    // notification
    const actionOne = Actions.findOne({
      _id: actionId,
    });

    if (actionOne && actionOne.max === 1 && actionOne.min === 1 && !actionOne.endDate) {
      Actions.update({ _id: actionId }, { $set: { endDate: new Date() } });
    }

    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
    ActivityStream.api.add(notif, 'finish', 'isAdmin');

    return true;
  },
  'exitAction'({
    id, orgId, memberId,
  }) {
    new SimpleSchema({
      id: {
        type: String,
      },
      orgId: {
        type: String,
      },
      memberId: {
        type: String,
        optional: true,
      },
    }).validate({
      id, orgId, memberId,
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const action = Actions.findOne({ _id: new Mongo.ObjectID(id) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }

    if (!Organizations.findOne({
      _id: new Mongo.ObjectID(orgId),
    })) {
      throw new Meteor.Error('not-orga');
    }

    if (memberId) {
      // verifier admin
      const collection = nameToCollection(action.parentType);

      if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-admin');
      }
    }

    const actionId = new Mongo.ObjectID(id);
    const parent = memberId ? `links.contributors.${memberId}` : `links.contributors.${Meteor.userId()}`;
    Actions.update({
      _id: actionId,
    }, {
      $unset: {
        [parent]: '',
      },
    });


    // notification
    const actionOne = Actions.findOne({
      _id: new Mongo.ObjectID(id),
    });

    if (actionOne && actionOne.max === 1 && actionOne.min === 1 && actionOne.startDate && actionOne.noStartDate) {
      Actions.update({ _id: actionId }, { $unset: { startDate: '' } });
    }

    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };

    if (memberId) {
      // mention
      const mentionOne = Citoyens.findOne({ _id: new Mongo.ObjectID(memberId) });
      notif.mention = { id: mentionOne._id._str, name: mentionOne.name, type: 'citoyens', username: mentionOne.username };
      ActivityStream.api.add(notif, 'leaveAssign', 'isAdmin');
      ActivityStream.api.add(notif, 'leaveAssign', 'isUser', memberId);
    } else {
      ActivityStream.api.add(notif, 'leave', 'isAdmin');
    }

    return true;
  },
  'refundAdminAction'({
    id, orgId, memberId,
  }) {
    new SimpleSchema({
      id: {
        type: String,
      },
      orgId: {
        type: String,
      },
      memberId: {
        type: String,
        optional: true,
      },
    }).validate({
      id, orgId, memberId,
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const action = Actions.findOne({ _id: new Mongo.ObjectID(id) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }

    if (!Organizations.findOne({
      _id: new Mongo.ObjectID(orgId),
    })) {
      throw new Meteor.Error('not-orga');
    }

    if (memberId) {
      // verifier admin
      const collection = nameToCollection(action.parentType);

      if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-admin');
      }
    }

    const logOne = LogUserActions.findOne({ actionId: id, userId: memberId });
    if (!logOne) {
      throw new Meteor.Error('not-log_credit');
    }

    // efface user de l'action
    const actionId = new Mongo.ObjectID(id);
    memberId = memberId || Meteor.userId();
    const parent = memberId ? `links.contributors.${memberId}` : `links.contributors.${Meteor.userId()}`;
    const parentFinishedBy = memberId ? `finishedBy.${memberId}` : `finishedBy.${Meteor.userId()}`;
    Actions.update({
      _id: actionId,
    }, {
      $unset: {
        [parent]: '',
        [parentFinishedBy]: '',
      },
    });


    // remboursement user
    const creditsReverse = -(logOne.credits);
    const userCredit = `userWallet.${orgId}.userCredits`;
    const userObjectId = new Mongo.ObjectID(memberId);
    Citoyens.update({ _id: userObjectId }, { $inc: { [userCredit]: creditsReverse } });

    // log remboursement
    const logInsert = {};
    logInsert.userId = memberId;
    logInsert.organizationId = orgId;
    logInsert.actionId = id;
    logInsert.commentaire = 'Remboursement';
    logInsert.credits = creditsReverse;
    logInsert.createdAt = moment().format();
    LogUserActions.insert(logInsert);


    // notification
    const actionOne = Actions.findOne({
      _id: new Mongo.ObjectID(id),
    });

    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };

    if (memberId) {
      // mention
      const mentionOne = Citoyens.findOne({ _id: new Mongo.ObjectID(memberId) });
      notif.mention = { id: mentionOne._id._str, name: mentionOne.name, type: 'citoyens', username: mentionOne.username };
      ActivityStream.api.add(notif, 'refundUser', 'isAdmin');
      ActivityStream.api.add(notif, 'refundUser', 'isUser', memberId);
    } else {
      ActivityStream.api.add(notif, 'refund', 'isAdmin');
    }

    return true;
  },
  'ValidateAction'({ actId, usrId, orgId }) {
    new SimpleSchema({
      actId: { type: String },
      usrId: { type: String },
      orgId: { type: String },
    }).validate({ actId, usrId, orgId });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const action = Actions.findOne({ _id: new Mongo.ObjectID(actId) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }
    const collection = nameToCollection(action.parentType);

    if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const actionId = new Mongo.ObjectID(actId);
    const userNeed = new Mongo.ObjectID(usrId);
    const parent = `finishedBy.${usrId}`;
    const credit = Actions.findOne({ _id: actionId }) && Actions.findOne({ _id: actionId }).credits && !typeOfNaN(Actions.findOne({ _id: actionId }).credits) ? parseInt(Actions.findOne({ _id: actionId }).credits) : 0;
    // const credit = parseInt(Actions.findOne({ _id: actionId }).credits);
    // const userActions = `userWallet.${orgId}.userActions.${actId}`;
    const userCredits = `userWallet.${orgId}.userCredits`;
    if (!Citoyens.findOne({ _id: userNeed, [userCredits]: { $exists: 1 } })) {
      Citoyens.update({ _id: userNeed }, { $set: { [userCredits]: 0 } });
    }
    Actions.update({ _id: actionId }, { $set: { [parent]: 'validated' } });

    // log user action credit
    const logInsert = {};
    logInsert.userId = usrId;
    logInsert.organizationId = orgId;
    logInsert.actionId = actId;
    if (credit) {
      logInsert.credits = credit;
      logInsert.createdAt = moment().format();
      LogUserActions.insert(logInsert);
    }

    // Citoyens.update({ _id: userNeed }, { $set: { [userActions]: credit } });

    //

    Citoyens.update({ _id: userNeed }, { $inc: { [userCredits]: credit } });

    // verifier si tout les users sont valider
    const actionOne = Actions.findOne({ _id: actionId });
    if (actionOne.finishedBy && actionOne.countContributors() === Object.keys(actionOne.finishedBy).map(id => id).length && arrayLinkToModerate(actionOne.finishedBy).length === 0) {
      Actions.update({ _id: actionId }, { $set: { status: 'done' } });
      countActionScope(actionOne.parentType, actionOne.parentId, 'done');
    }
    //

    // notification
    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
    // ActivityStream.api.add(notif, verb, 'isUser', '5e736fd6b6ebaf0d008b4579');
    ActivityStream.api.add(notif, 'validate', 'isUser', usrId);

    return true;
  },
  'noValidateAction'({ actId, usrId, orgId }) {
    new SimpleSchema({
      actId: { type: String },
      usrId: { type: String },
      orgId: { type: String },
    }).validate({ actId, usrId, orgId });


    // je valide pas un user dans etat je le met
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const action = Actions.findOne({ _id: new Mongo.ObjectID(actId) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }
    const collection = nameToCollection(action.parentType);

    if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const actionId = new Mongo.ObjectID(actId);
    // const userNeed = new Mongo.ObjectID(usrId);
    const parent = `finishedBy.${usrId}`;

    // récuperation du credit que l'on peut ganer pour une action
    // const credit = Actions.findOne({ _id: actionId }) && Actions.findOne({ _id: actionId }).credits && !typeOfNaN(Actions.findOne({ _id: actionId }).credits) ? parseInt(Actions.findOne({ _id: actionId }).credits) : 0;

    // const userActions = `userWallet.${orgId}.userActions.${actId}`;
    // const userCredits = `userWallet.${orgId}.userCredits`;

    // changement d'etat de l'user sur l'action
    Actions.update({ _id: actionId }, { $set: { [parent]: 'novalidated' } });

    // est ce utile de loguer l'action avce credit sur l'user une valider ou non valider pas trop scallable
    // voir pur le novalidate si elle présente ou pas
    // Citoyens.update({ _id: userNeed }, { $set: { [userActions]: credit } });

    // verifier si tout les users sont valider
    const actionOne = Actions.findOne({ _id: actionId });
    if (actionOne.finishedBy && actionOne.countContributors() === Object.keys(actionOne.finishedBy).map(id => id).length && arrayLinkToModerate(actionOne.finishedBy).length === 0) {
      Actions.update({ _id: actionId }, { $set: { status: 'done' } });
      countActionScope(actionOne.parentType, actionOne.parentId, 'done');
    }
    //

    // notification
    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
    // ActivityStream.api.add(notif, verb, 'isUser', '5e736fd6b6ebaf0d008b4579');

    ActivityStream.api.add(notif, 'noValidate', 'isUser', usrId);

    return true;
  },
  userup (geo) {
    check(geo, { longitude: Number, latitude: Number });
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    this.unblock();
    if (Citoyens.update({
      _id: new Mongo.ObjectID(this.userId),
    }, {
      $set: {
        geoPosition: {
          type: 'Point',
          coordinates: [parseFloat(geo.longitude), parseFloat(geo.latitude)],
        },
      },
    })) {
      return true;
    }
    return false;
  },
  validateEmail(url) {
    check(url, String);
    // console.log(url);
    const retour = HTTP.get(url);
    // console.log(JSON.stringify(retour));
    if (retour) {
      return true;
    }
    throw new Meteor.Error('error-validateEmail');
  },
  likeScope (newsId, scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.id = newsId;
    doc.collection = scope;
    doc.action = 'voteUp';
    const voteQuery = {};
    voteQuery._id = new Mongo.ObjectID(newsId);
    voteQuery[`voteUp.${this.userId}`] = { $exists: true };

    if (News.findOne(voteQuery)) {
      doc.unset = 'true';
      Meteor.call('addAction', doc);
    } else {
      const voteQuery = {};
      voteQuery._id = new Mongo.ObjectID(newsId);
      voteQuery[`voteDown.${this.userId}`] = { $exists: true };

      if (News.findOne(voteQuery)) {
        const rem = {};
        rem.id = newsId;
        rem.collection = 'news';
        rem.action = 'voteDown';
        rem.unset = 'true';
        Meteor.call('addAction', rem);
      }
      Meteor.call('addAction', doc);
    }
  },
  dislikeScope (newsId, scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.id = newsId;
    doc.collection = scope;
    doc.action = 'voteDown';
    const voteQuery = {};
    voteQuery._id = new Mongo.ObjectID(newsId);
    voteQuery[`voteDown.${this.userId}`] = { $exists: true };

    if (News.findOne(voteQuery)) {
      doc.unset = 'true';
      Meteor.call('addAction', doc);
    } else {
      const voteQuery = {};
      voteQuery._id = new Mongo.ObjectID(newsId);
      voteQuery[`voteUp.${this.userId}`] = { $exists: true };

      if (News.findOne(voteQuery)) {
        const rem = {};
        rem.id = newsId;
        rem.collection = 'news';
        rem.action = 'voteUp';
        rem.unset = 'true';
        Meteor.call('addAction', rem);
      }
      Meteor.call('addAction', doc);
    }
  },
  addAction (doc) {
    check(doc, Object);
    check(doc.id, String);
    check(doc.collection, String);
    check(doc.action, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.status) {
      doc.details = {};
      doc.details.status = status;
    }

    const retour = apiCommunecter.postPixel('co2/action', 'addaction', doc);
    return retour;
  },
  followPersonExist (connectUserId) {
    // type : person / follows
    // connectUserId
    check(connectUserId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.connectUserId = connectUserId;
    const retour = apiCommunecter.postPixel('co2/person', 'follows', doc);
    return retour;
  },
  followPerson (doc) {
    // type : person / follows
    // invitedUserName
    // invitedUserEmail
    SchemasFollowRest.validate(doc);
    const docClean = SchemasFollowRest.clean(doc);
    // check(doc, SchemasFollowRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const retour = apiCommunecter.postPixel('co2/person', 'follows', docClean);
    return retour;
  },
  saveattendeesEvent (eventId, email, inviteUserId) {
    check(eventId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = eventId;
    doc.parentType = 'events';
    doc.childType = 'citoyens';
    if (typeof email !== 'undefined') {
      doc.childId = Citoyens.findOne({ email: email.toLowerCase() })._id._str;
    } else if (typeof inviteUserId !== 'undefined' && inviteUserId) {
      doc.childId = inviteUserId;
    } else {
      doc.childId = this.userId;
    }
    const retour = apiCommunecter.postPixel('co2/link', 'connect', doc);
    return retour;
  },
  followEntity (connectId, parentType, childId) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};

    doc.parentId = connectId;
    doc.childType = 'citoyens';

    /* if(parentType=="organizations"){
  doc.connectType="member";
  }else if(parentType=="projects"){
  doc.connectType="contributor";
  }else if(parentType=="citoyens"){
  doc.connectType="followers";
} */

    doc.childId = (typeof childId !== 'undefined') ? childId : this.userId;
    doc.parentType = parentType;
    const retour = apiCommunecter.postPixel('co2/link', 'follow', doc);
    return retour;
  },
  shareEntity (doc) {
  // console.log(doc);
    const docClean = SchemasShareRest.clean(doc);
    SchemasShareRest.validate(docClean);
    // check(doc, SchemasShareRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    docClean.childType = 'citoyens';
    docClean.connectType = 'share';
    docClean.childId = this.userId;
    const retour = apiCommunecter.postPixel('news/co', 'share?json=1', docClean);
    return retour;
  },
  collectionsAdd (id, type) {
    check(id, String);
    check(type, String);
    check(type, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.id = id;
    doc.type = type;
    doc.collection = 'favorites';
    const retour = apiCommunecter.postPixel('co2/collections', 'add', doc);
    return retour;
  },
  connectEntity(connectId, parentType, childId, connectType, orgId) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'actions'], name);
    }));
    check(orgId, Match.Maybe(String));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = connectId;
    doc.childType = 'citoyens';
    doc.connectType = connectType;
    if (connectType === 'admin' && childId) {
      check(childId, String);
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(connectId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
      doc.connectType = 'admin';
    } else if (parentType === 'organizations' && connectType !== 'admin') {
      doc.connectType = 'member';
    } else if (parentType === 'projects' && connectType !== 'admin') {
      doc.connectType = 'contributor';
    } else if (parentType === 'citoyens' && connectType !== 'admin') {
      doc.connectType = 'followers';
    } else if (parentType === 'events' && connectType !== 'admin') {
      doc.connectType = 'attendee';
    } else if (parentType === 'actions' && connectType !== 'admin') {
      doc.connectType = 'contributor';
    }

    doc.childId = (typeof childId !== 'undefined' && childId !== null) ? childId : this.userId;
    doc.parentType = parentType;
    const retour = apiCommunecter.postPixel('co2/link', 'connect', doc);

    // WARNING passe l'user en member
    // si auto member true
    

    if (parentType === 'organizations' && connectType !== 'admin') {
      const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(connectId) });
      if (orgaOne && orgaOne.oceco && orgaOne.oceco.memberAuto) {
        Citoyens.update({
          _id: new Mongo.ObjectID(doc.childId),
        }, {
          $unset: {
            [`links.memberOf.${connectId}.toBeValidated`]: '',
          },
        });

        Organizations.update({
          _id: new Mongo.ObjectID(connectId),
        }, {
          $unset: {
            [`links.members.${doc.childId}.toBeValidated`]: '',
          },
        });
      }
    }

    /* if (parentType === 'projects' && connectType !== 'admin') {
      const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) });
      if (orgaOne && orgaOne.oceco && orgaOne.oceco.contributorAuto) {
        Citoyens.update({
          _id: new Mongo.ObjectID(doc.childId),
        }, {
          $unset: {
            [`links.projects.${connectId}.toBeValidated`]: '',
            [`links.projects.${connectId}.isInviting`]: '',
          },
        });

        Projects.update({
          _id: new Mongo.ObjectID(connectId),
        }, {
          $unset: {
            [`links.contributors.${doc.childId}.toBeValidated`]: '',
            [`links.contributors.${doc.childId}.isInviting`]: '',
          },
        });
      }
    }

    if (parentType === 'events' && connectType !== 'admin') {
      const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) });
      if (orgaOne && orgaOne.oceco && orgaOne.oceco.attendeAuto) {
        Citoyens.update({
          _id: new Mongo.ObjectID(doc.childId),
        }, {
          $unset: {
            [`links.events.${connectId}.toBeValidated`]: '',
            [`links.events.${connectId}.isInviting`]: '',
          },
        });

        Events.update({
          _id: new Mongo.ObjectID(connectId),
        }, {
          $unset: {
            [`links.attendees.${doc.childId}.toBeValidated`]: '',
            [`links.attendees.${doc.childId}.isInviting`]: '',
          },
        });
      }
    } */

    return retour;
  },
  disconnectEntity (connectId, parentType, connectType, childId, childType) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* childId:5534fd9da1aa14201b0041cb
    childType:citoyens
    parentType:projects
    parentId:590c5877dd0452330ca1fa1f
    connectType:followers */

    const doc = {};
    doc.parentId = connectId;
    doc.childType = (typeof childType !== 'undefined' && childType !== null) ? childType : 'citoyens';
    if (parentType === 'organizations') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'members';
    } else if (parentType === 'projects') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'contributors';
    } else if (parentType === 'citoyens') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'followers';
    } else if (parentType === 'events') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'attendees';
    }
    doc.childId = (typeof childId !== 'undefined' && childId !== null) ? childId : this.userId;

    if (doc.childId !== this.userId) {
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(connectId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
    }
    doc.parentType = parentType;
    // console.log(doc);
    const retour = apiCommunecter.postPixel('co2/link', 'disconnect', doc);
    return retour;
  },
  validateEntity (parentId, parentType, childId, childType, linkOption) {
    check(parentId, String);
    check(childId, String);
    check(childType, String);
    check(linkOption, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    check(childType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (_.contains(['events', 'projects', 'organizations', 'citoyens'], parentType) && this.userId === childId && linkOption === 'isInviting') {

    } else {
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(parentId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const doc = {};
    doc.parentId = parentId;
    doc.parentType = parentType;
    doc.childId = childId;
    doc.childType = childType;
    doc.linkOption = linkOption;
    // console.log(doc);
    const retour = apiCommunecter.postPixel('co2/link', 'validate', doc);
    return retour;
  },
  multiConnectEntity (parentId, parentType, connectType, childs) {
    check(parentId, String);
    check(parentType, String);
    check(connectType, String);
    check(childs, Array);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = parentId;
    doc.connectType = connectType;
    doc.parentType = parentType;
    doc.childs = childs;
    const retour = apiCommunecter.postPixel('co2/link', 'multiconnect', doc);
    return retour;
  },
  inviteattendeesEvent (doc) {
    const docClean = SchemasInviteAttendeesEventRest.clean(doc);
    SchemasInviteAttendeesEventRest.validate(docClean);
    // check(doc, SchemasInviteAttendeesEventRest);
    check(docClean.invitedUserEmail, ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* if (!Meteor.call('isEmailValid', doc.invitedUserEmail)) {
      throw new Meteor.Error('Email not valid');
    } */
    const insertDoc = {};
    insertDoc.parentId = docClean.eventId;
    insertDoc.parentType = 'events';
    insertDoc.childType = 'citoyens';
    insertDoc.childEmail = docClean.invitedUserEmail;
    insertDoc.childName = docClean.invitedUserName;
    insertDoc.connectType = 'attendees';
    insertDoc.childId = '';
    const retour = apiCommunecter.postPixel('co2/link', 'connect', insertDoc);
    return retour;
  },
  invitationScopeForm(docNoClean) {
    const doc = SchemasInvitationsRest.clean(docNoClean);
    SchemasInvitationsRest.validate(doc);
    // check(doc, SchemasInvitationsRest);
    check(doc.childEmail, ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* if (!Meteor.call('isEmailValid', doc.childEmail)) {
      throw new Meteor.Error('Email not valid');
    } */
    const insertDoc = {};
    insertDoc.parentId = doc.parentId;
    insertDoc.parentType = doc.parentType;
    insertDoc.childType = doc.childType;
    if (doc.parentType === 'organizations') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'members';
    } else if (doc.parentType === 'projects') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'contributors';
    } else if (doc.parentType === 'citoyens') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'followers';
    } else if (doc.parentType === 'events') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'attendees';
    }
    if (doc.childType === 'citoyens') {
      insertDoc.childEmail = doc.childEmail;
      insertDoc.childName = doc.childName;
      insertDoc.childId = '';
    } else if (doc.childType === 'organizations') {
      insertDoc.organizationType = doc.organizationType;
      insertDoc.childEmail = doc.childEmail;
      insertDoc.childName = doc.childName;
      insertDoc.childId = '';
    }
    // console.log(insertDoc);
    const retour = apiCommunecter.postPixel('co2/link', 'connect', insertDoc);
    return retour;
  },
  invitationScope (parentId, parentType, connectType, childType, childEmail, childName, childId) {
    // console.log(`${parentId}, ${parentType}, ${connectType}, ${childType}, ${childEmail}, ${childName}, ${childId}`);
    check(parentId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'actions'], name);
    }));
    check(childType, String);
    check(childType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.parentId = parentId;
    doc.parentType = parentType;
    doc.childType = childType;
    if (parentType === 'organizations') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'members';
    } else if (parentType === 'projects') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'contributors';
    } else if (parentType === 'citoyens') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'followers';
    } else if (parentType === 'events') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'attendees';
    }
    if (childType === 'citoyens') {
      if (childId) {
        check(childId, String);
        doc.childId = childId;
        const invite = Citoyens.findOne({ _id: new Mongo.ObjectID(childId) });
        if (invite) {
          doc.childEmail = invite.email;
          doc.childName = invite.name;
        } else {
          throw new Meteor.Error('Citizen not exist');
        }
      } else {
        check(childName, String);
        check(childEmail, String);
        /* if (!Meteor.call('isEmailValid', childEmail)) {
          throw new Meteor.Error('Email not valid');
        } */
        doc.childEmail = childEmail;
        doc.childName = childName;
      }
    } else if (childType === 'organizations') {
      check(childId, String);
      const invite = Organizations.findOne({ _id: new Mongo.ObjectID(childId) });
      if (invite) {
        doc.childName = invite.name;
      } else {
        throw new Meteor.Error('Citizen not exist');
      }
      doc.childId = childId;
    }
    const retour = apiCommunecter.postPixel('co2/link', 'connect', doc);
    return retour;
  },
  checkUsername (username) {
    check(username, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).username !== username) {
      const responsePost = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/checkusername`, {
        params: { username },
      });
      // console.log(responsePost.data);
      return responsePost.data;
    }
    return true;
  },
  getUser (callerId) {
    check(callerId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const user = Citoyens.findOne({ _id: new Mongo.ObjectID(callerId) }, {
      fields: {
        _id: 1,
        name: 1,
        profilThumbImageUrl: 1,
      },
    });

    if (user && user._id) {
      return user;
    }
    throw new Meteor.Error('not user');
  },
  searchTagautocomplete (query, options) {
    check(query, String);
    if (!query) return [];

    options = options || {};

    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }
    const tagsArray = Tags.find({ tag: { $regex: query, $options: 'i' } }, options).fetch();
    return tagsArray.map(tag => ({ name: tag.tag }));
  },
  searchMemberautocomplete (search) {
    check(search, Object);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const retour = apiCommunecter.postPixelMethod('co2/search', 'searchmemberautocomplete', search);
    // console.log(retour);
    return retour.data;
  },
  searchGlobalautocomplete (search) {
    check(search, Object);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    /* name:syl
locality:
searchType[]:persons
searchType[]:organizations
searchType[]:projects
searchType[]:events
searchType[]:cities
searchBy:ALL
indexMin:0
indexMax:20 */
    search.indexMin = 0;
    search.indexMax = 20;
    const retour = apiCommunecter.postPixelMethod('co2/search', 'globalautocomplete', search);
    return retour.data;
  },
  updateSettings (type, value, typeEntity, idEntity) {
    check(type, String);
    check(typeEntity, String);
    check(idEntity, String);
    check(typeEntity, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (typeEntity === 'organizations' || typeEntity === 'projects' || typeEntity === 'events') {
      const collection = nameToCollection(typeEntity);
      if (!collection.findOne({ _id: new Mongo.ObjectID(idEntity) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
      check(type, Match.Where(function(name) {
        return _.contains(['isOpenData', 'isOpenEdition'], name);
      }));
      check(value, Boolean);
    } else if (typeEntity === 'citoyens') {
      if (this.userId !== idEntity) {
        throw new Meteor.Error('not-authorized');
      }
      check(type, Match.Where(function(name) {
        return _.contains(['directory', 'birthDate', 'email', 'locality', 'phone', 'isOpenData'], name);
      }));
      if (type === 'isOpenData') {
        check(value, Boolean);
      } else {
        check(value, Match.Where(function(name) {
          return _.contains(['public', 'private', 'hide'], name);
        }));
      }
    }

    const doc = {};
    doc.typeEntity = typeEntity;
    doc.type = type;
    doc.idEntity = idEntity;
    doc.value = value;

    const retour = apiCommunecter.postPixel('co2/element', 'updatesettings', doc);
    return retour;
  },
  'deleteElementAdmin'({ scope, scopeId }) {
    check(scopeId, String);
    check(scope, String);
    check(scope, Match.Where(function (name) {
      return _.contains(['events'], name);
    }));

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const collection = nameToCollection(scope);

    if (!collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const retour = apiCommunecter.postPixel('co2/element', `delete/type/${scope}/id/${scopeId}`, {});

    return retour;
  },
  insertComment (docNoClean) {
    const doc = SchemasCommentsRest.clean(docNoClean);
    SchemasCommentsRest.validate(doc);
    // console.log(doc);
    // check(doc, SchemasCommentsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (doc.contextType === 'actions') {
      if (!Actions.findOne({
        _id: new Mongo.ObjectID(doc.contextId),
      })) {
        throw new Meteor.Error('not-authorized');
      }
    }

    if (!doc.parentCommentId) {
      doc.parentCommentId = '';
    }
    const retour = apiCommunecter.postPixel('co2/comment', 'save', doc);

    // console.log(retour);

    if (doc.contextType === 'actions') {
      // notif
      const actionOne = Actions.findOne({
        _id: new Mongo.ObjectID(doc.contextId),
      });

      // au participant
      // au admin

      const notif = {};
      const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
      // author
      notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
      // object
      notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', links: actionOne.links, parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom, comment: doc.text };

      ActivityStream.api.add(notif, 'addComment', 'isActionMembers');
      ActivityStream.api.add(notif, 'addComment', 'isAdmin');
    }
    return retour;
  },
  updateComment ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    const cleanModifierSet = SchemasCommentsEditRest.clean(modifier.$set);
    SchemasCommentsEditRest.validate(cleanModifierSet);
    // check(modifier.$set, SchemasCommentsEditRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Comments.findOne({ _id: new Mongo.ObjectID(documentId) }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }
    // const doc = {};

    /* doc.id = documentId;
    doc.content = modifier["$set"].text;
    doc.contextId = modifier["$set"].contextId;
    doc.contextType = modifier["$set"].contextType;
    if(modifier["$set"].parentCommentId){
      doc.parentCommentId = modifier["$set"].parentCommentId;
    }else{
      doc.parentCommentId = "";
    } */

    /* doc.name = 'text';
    doc.value = modifier.$set.text;
    doc.pk = documentId._str; */

    /* if (!modifier.$set.parentCommentId) {
      modifier.$set.parentCommentId = '';
    }
    modifier.$set.id = documentId; */
    const doc = {};
    doc.id = documentId;
    doc.params = {};
    doc.params.text = modifier.$set.text;
    if (modifier.$set.mentions) {
      doc.params.mentions = modifier.$set.mentions;
    }
    // console.log(modifier.$set);
    // const retour = apiCommunecter.postPixel('co2/comment', 'updatefield', doc);
    const retour = apiCommunecter.postPixel('co2/comment', 'update', doc);
    return retour;
  },
  deleteComment (commentId) {
    check(commentId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!Comments.findOne({ _id: new Mongo.ObjectID(commentId) }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }

    const retour = apiCommunecter.postPixel('co2/comment', `delete/id/${commentId}`, {});
    return retour;
  },
  updateBlock ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    check(modifier.$set.typeElement, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'poi', 'organizations', 'citoyens'], name);
    }));

    if (modifier.$set.typeElement === 'organizations' || modifier.$set.typeElement === 'projects' || modifier.$set.typeElement === 'poi' || modifier.$set.typeElement === 'events') {
      const collection = nameToCollection(modifier.$set.typeElement);
      if (!collection.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.typeElement === 'citoyens') {
      if (this.userId !== documentId) {
        throw new Meteor.Error('not-authorized');
      }
    }

    if (modifier.$set.typeElement === 'citoyens') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info
      const cleanModifierSet = BlockCitoyensRest[modifier.$set.block].clean(modifier.$set);
      // check(modifier.$set, BlockCitoyensRest[modifier.$set.block]);
      BlockCitoyensRest[modifier.$set.block].validate(cleanModifierSet);
    } else if (modifier.$set.typeElement === 'events') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'when', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      const cleanModifierSet = BlockEventsRest[modifier.$set.block].clean(modifier.$set);
      // check(modifier.$set, BlockEventsRest[modifier.$set.block]);
      BlockEventsRest[modifier.$set.block].validate(cleanModifierSet);
    } else if (modifier.$set.typeElement === 'organizations') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      const cleanModifierSet = BlockOrganizationsRest[modifier.$set.block].clean(modifier.$set);
      // check(modifier.$set, BlockOrganizationsRest[modifier.$set.block]);
      BlockOrganizationsRest[modifier.$set.block].validate(cleanModifierSet);
    } else if (modifier.$set.typeElement === 'projects') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'when', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      const cleanModifierSet = BlockProjectsRest[modifier.$set.block].clean(modifier.$set);
      // check(modifier.$set, BlockProjectsRest[modifier.$set.block]);
      BlockProjectsRest[modifier.$set.block].validate(cleanModifierSet);
    } else if (modifier.$set.typeElement === 'poi') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      const cleanModifierSet = BlockProjectsRest[modifier.$set.block].clean(modifier.$set);
      // check(modifier.$set, BlockProjectsRest[modifier.$set.block]);
      BlockProjectsRest[modifier.$set.block].validate(cleanModifierSet);
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'block');
    if (modifier.$set.typeElement === 'citoyens' && modifier.$set.block === 'info') {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).username !== modifier.$set.username) {
        docRetour.username = modifier.$set.username;
      }
    }
    if (modifier.$set.block === 'locality') {
      docRetour.pk = documentId;
      docRetour.type = modifier.$set.typeElement;
      // console.log(docRetour);
      const retour = apiCommunecter.postPixel('co2/element', `updatefields/type/${modifier.$set.typeElement}`, docRetour);
      return retour;
    } else if (modifier.$set.block === 'preferences') {
    // console.log('preferences');
      if (modifier.$set.typeElement === 'citoyens') {
        const fieldsArray = ['email', 'locality', 'phone', 'directory', 'birthDate', 'isOpenData'];
        _.each(fieldsArray, (field) => {
          // console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings', field, modifier.$set[`preferences.${field}`], modifier.$set.typeElement, documentId);
        });
      } else if (modifier.$set.typeElement === 'organizations' || modifier.$set.typeElement === 'projects' || modifier.$set.typeElement === 'events') {
        const fieldsArray = ['isOpenEdition', 'isOpenData'];
        _.each(fieldsArray, (field) => {
          // console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings', field, modifier.$set[`preferences.${field}`], modifier.$set.typeElement, documentId);
        });
      }
      return true;
    }
    docRetour.id = documentId;
    docRetour.block = modifier.$set.block;
    docRetour.typeElement = modifier.$set.typeElement;
    // console.log(docRetour);
    const retour = apiCommunecter.postPixel('co2/element', 'updateblock', docRetour);
    return retour;
  },
  updateCitoyen ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    const cleanModifierSet = SchemasCitoyensRest.clean(modifier.$set);
    SchemasCitoyensRest.validate(cleanModifierSet);
    // check(modifier.$set, SchemasCitoyensRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (this.userId !== documentId) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'citoyens');
    docRetour.id = documentId;
    docRetour.key = 'citoyen';
    docRetour.collection = 'citoyens';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
  insertNew(docNoClean) {
    check(docNoClean.parentType, Match.Where(function (name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    // const doc = SchemasNewsRestBase[docNoClean.parentType].clean(docNoClean);
    SchemasNewsRestBase[docNoClean.parentType].validate(docNoClean);
    // check(doc, SchemasNewsRestBase[doc.parentType]);
    const doc = docNoClean;
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'organizations') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isMembers(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'projects') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isContributors(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'events') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isAttendees(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    }

    doc.type = 'news';

    const retour = apiCommunecter.postPixel('news/co', 'save?json=1', doc);
    return retour;
  },
  updateNew ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    // check(modifier["$set"], SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const newsOne = News.findOne({ _id: new Mongo.ObjectID(documentId) });
    if (newsOne.target.type === 'organizations' || newsOne.target.type === 'projects' || newsOne.target.type === 'poi' || newsOne.target.type === 'events') {
      const collection = nameToCollection(newsOne.target.type);
      if (!newsOne.isAuthor()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(newsOne.target.id) }).isAdmin()) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (newsOne.target.type === 'citoyens') {
      if (!newsOne.isAuthor()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const doc = modifier.$set;
    doc.idNews = documentId;
    const retour = apiCommunecter.postPixel('news/co', 'update?json=1', doc);
    return retour;
  },
  updateNewOld (modifier, documentId) {
    check(modifier.$set, SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!News.findOne({ _id: documentId }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }

    const updateNew = {};
    updateNew.name = `newsContent${documentId._str}`;
    updateNew.value = modifier.$set.text;
    updateNew.pk = documentId._str;

    const retour = apiCommunecter.postPixel('news/co', 'updatefield?json=1', updateNew);
    return retour;
  },
  deleteNew (newsId) {
    check(newsId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const newsOne = News.findOne({ _id: new Mongo.ObjectID(newsId) });
    if (newsOne.target.type === 'organizations' || newsOne.target.type === 'projects' || newsOne.target.type === 'poi' || newsOne.target.type === 'events') {
      const collection = nameToCollection(newsOne.target.type);
      if (!newsOne.isAuthor()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(newsOne.target.id) }).isAdmin()) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (newsOne.target.type === 'citoyens') {
      if (!newsOne.isAuthor()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    /* if (newsOne && newsOne.media && newsOne.media.images) {
      const arrayId = newsOne.media.images.map(_id => new Mongo.ObjectID(_id));
      const newsDocs = Documents.find({
        _id: { $in: arrayId },
      });
      newsDocs.forEach((newsDoc) => {
        const doc = {};
        doc.name = newsDoc.name;
        doc.parentId = newsOne.target.id;
        doc.parentType = newsOne.target.type;
        doc.path = newsDoc.path;
        doc.docId = newsDoc._id._str;
        apiCommunecter.postPixel('co2/document', `delete/dir/${Meteor.settings.module}/type/${newsOne.target.type}/parentId/${newsOne.target.id}`, doc);
      });
    } */

    const retour = apiCommunecter.postPixel('news/co', `delete/id/${newsId}?json=1`, {});
    return retour;
  },
  photoNews (photo, str, type, idType, newsId) {
    check(str, String);
    check(type, String);
    check(idType, String);
    check(newsId, Match.Maybe(String));
    check(type, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    const collection = nameToCollection(type);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (type === 'citoyens') {
      if (this.userId !== idType) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (type === 'projects') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isContributors(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (type === 'organizations') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isMembers(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (type === 'events') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAttendees(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = apiCommunecter.postUploadSavePixel(type, idType, 'newsImage', photo, str, 'image', 'slider');
    // const retourUpload = apiCommunecter.postUploadPixel(type, idType, 'newsImage', photo, str);
    if (doc) {
      // console.log(doc);
      /* const insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = type;
      insertDoc.folder = `${type}/${idType}/album`;
      insertDoc.moduleId = 'communecter';
      insertDoc.doctype = 'image';
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      insertDoc.contentKey = 'slider';
      insertDoc.formOrigin = 'news';
      const doc = apiCommunecter.postPixel('co2/document', 'save', insertDoc); */

      // if (doc) {
      // {"result":true,"msg":"Document bien enregistr\u00e9","id":{"$id":"58df810add04528643014012"},"name":"moon.png"}
      if (typeof newsId !== 'undefined') {
        const array = News.findOne({ _id: new Mongo.ObjectID(newsId) });
        if (array && array.media && array.media.images && array.media.images.length > 0) {
          // console.log(array.media.images.length);
          const countImages = array.media.images.length + 1;
          News.update({ _id: new Mongo.ObjectID(newsId) }, { $set: { 'media.countImages': countImages.toString() }, $push: { 'media.images': doc.id.$id } });
          return { photoret: doc.id.$id, newsId };
        }
        const media = {};
        media.type = 'gallery_images';
        media.countImages = '1';
        media.images = [doc.id.$id];
        News.update({ _id: new Mongo.ObjectID(newsId) }, { $set: { media } });
        return { photoret: doc.id.$id, newsId };
      }
      const insertNew = {};
      insertNew.parentId = idType;
      insertNew.parentType = type;
      insertNew.text = ' ';
      insertNew.media = {};
      insertNew.media.type = 'gallery_images';
      insertNew.media.countImages = '1';
      insertNew.media.images = [doc.id.$id];
      const newsIdRetour = Meteor.call('insertNew', insertNew);
      // console.log('retour newsIdRetour');
      // console.log(newsIdRetour);
      if (newsIdRetour) {
        return { photoret: doc.id.$id, newsId: newsIdRetour.data.id.$id };
      }
      throw new Meteor.Error('photoNews error');
      /* } else {
        throw new Meteor.Error('insertDocument error');
      } */
    } else {
      throw new Meteor.Error('postUploadPixel error');
    }
  },
  photoActions(photo, str, type, idType, actionId) {
    check(str, String);
    check(type, String);
    check(idType, String);
    check(actionId, String);
    check(type, Match.Where(function (name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));

    const collectionScope = nameToCollection(type);
    const scopeOne = collectionScope.findOne({
      _id: new Mongo.ObjectID(idType),
    });

    if (!scopeOne) {
      throw new Meteor.Error('scope-not-exist');
    }

    // verifier droit
    if (type === 'events') {
      // console.log('event is admin');

      if (!(scopeOne && scopeOne.isAdmin())) {
        throw new Meteor.Error('not-authorized event');
      }
    } else if (type === 'projects') {
      // console.log('project is admin');

      if (!(scopeOne && scopeOne.isAdmin())) {
        throw new Meteor.Error('not-authorized project');
      }
    } else if (type === 'organizations') {
      // console.log('organization is admin');

      if (!(scopeOne && scopeOne.isAdmin())) {
        throw new Meteor.Error('not-authorized organizations');
      }
    } else if (type === 'citoyens') {
      // console.log('citoyen is admin');
      if (!(scopeOne && scopeOne.isAdmin())) {
        throw new Meteor.Error('not-authorized citoyen');
      }
    } else {
      throw new Meteor.Error('not-authorized all');
    }

    const actionOne = Actions.findOne({ _id: new Mongo.ObjectID(actionId) });
    if (!actionOne) {
      throw new Meteor.Error('action-no-exit');
    }

    const doc = apiCommunecter.postUploadSavePixel(type, idType, 'newsImage', photo, str, 'image', 'slider');

    if (doc) {
      if (actionOne && actionOne.media && actionOne.media.images && actionOne.media.images.length > 0) {
        // console.log(actionOne.media.images.length);
        const countImages = actionOne.media.images.length + 1;
        Actions.update({ _id: new Mongo.ObjectID(actionId) }, { $set: { 'media.countImages': countImages.toString() }, $push: { 'media.images': doc.id.$id } });
        return { photoret: doc.id.$id, actionId };
      }
      const media = {};
      media.type = 'gallery_images';
      media.countImages = '1';
      media.images = [doc.id.$id];
      Actions.update({ _id: new Mongo.ObjectID(actionId) }, { $set: { media } });
      return { photoret: doc.id.$id, actionId };
    } else {
      throw new Meteor.Error('postUploadPixel error');
    }
  },
  insertEvent(docNoClean) {
    const doc = SchemasEventsRest.clean(docNoClean);
    SchemasEventsRest.validate(doc);
    // check(doc, SchemasEventsRest);
    check(doc.organizerType, Match.Where(function(name) {
      return _.contains(['projects', 'organizations', 'citoyens'], name);
    }));
    // console.log(doc);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.organizerType === 'citoyens') {
      if (this.userId !== doc.organizerId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (doc.organizerType === 'projects' || doc.organizerType === 'organizations') {
      const collection = nameToCollection(doc.organizerType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.organizerId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'events');
    docRetour.key = 'event';
    docRetour.collection = 'events';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);

    // create room
    const docRoom = {};
    docRoom.name = docRetour.name;
    docRoom.description = 'action bénévolat';
    docRoom.parentType = 'events';
    docRoom.parentId = retour.data.id;
    docRoom.status = 'open';
    docRoom.key = 'room';
    docRoom.collection = 'rooms';
    // eslint-disable-next-line no-unused-vars
    const retourRoom = apiCommunecter.postPixel('co2/element', 'save', docRoom);
    //

    return retour;
  },
  updateEvent ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    const cleanModifierSet = SchemasEventsRest.clean(modifier.$set);
    SchemasEventsRest.validate(cleanModifierSet);
    // check(modifier.$set, SchemasEventsRest);
    check(modifier.$set.organizerType, Match.Where(function(name) {
      return _.contains(['projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.organizerType === 'citoyens') {
      if (this.userId !== modifier.$set.organizerId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.organizerType === 'projects' || modifier.$set.organizerType === 'organizations') {
      const collection = nameToCollection(modifier.$set.organizerType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.organizerId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Events.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'events');
    docRetour.id = documentId;
    docRetour.key = 'event';
    docRetour.collection = 'events';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
  insertProject (docNoClean) {
    const doc = SchemasProjectsRest.clean(docNoClean);
    SchemasProjectsRest.validate(doc);
    // check(doc, SchemasProjectsRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (doc.parentType === 'organizations') {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'projects');
    docRetour.key = 'project';
    docRetour.collection = 'projects';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);

    // create room sur project auto
    const docRoom = {};
    docRoom.name = docRetour.name;
    docRoom.description = 'action bénévolat';
    docRoom.parentType = 'projects';
    docRoom.parentId = retour.data.id;
    docRoom.status = 'open';
    docRoom.key = 'room';
    docRoom.collection = 'rooms';
    // eslint-disable-next-line no-unused-vars
    const retourRoom = apiCommunecter.postPixel('co2/element', 'save', docRoom);
    //

    return retour;
  },
  updateProject ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    const cleanModifierSet = SchemasProjectsRest.clean(modifier.$set);
    SchemasProjectsRest.validate(cleanModifierSet);
    // check(modifier.$set, SchemasProjectsRest);
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.parentType === 'citoyens') {
      if (this.userId !== modifier.$set.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.parentType === 'organizations') {
      const collection = nameToCollection(modifier.$set.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Projects.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'projects');
    docRetour.id = documentId;
    docRetour.key = 'project';
    docRetour.collection = 'projects';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
  photoScope (scope, photo, str, idType) {
    check(str, String);
    check(idType, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    const collection = nameToCollection(scope);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    // const retourUpload = apiCommunecter.postUploadPixel(scope, idType, 'avatar', photo, str);
    const doc = apiCommunecter.postUploadSavePixel(scope, idType, 'avatar', photo, str, 'image', 'profil');
    if (doc) {
      /* const insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = scope;
      insertDoc.folder = `${scope}/${idType}`;
      insertDoc.moduleId = 'communecter';
      insertDoc.author = this.userId;
      insertDoc.doctype = 'image';
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      insertDoc.contentKey = 'profil';
      const doc = apiCommunecter.postPixel('co2/document', 'save', insertDoc); */
      // console.log(doc);
      // if (doc) {
      /* collection.update({ _id: new Mongo.ObjectID(idType) }, { $set: {
          profilImageUrl: `/upload/communecter/${scope}/${idType}/${retourUpload.name}`,
          profilThumbImageUrl: `/upload/communecter/${scope}/${idType}/thumb/profil-resized.png?=${new Date()}${Math.floor((Math.random() * 100) + 1)}`,
          profilMarkerImageUrl: `/upload/communecter/${scope}/${idType}/thumb/profil-marker.png?=${new Date()}${Math.floor((Math.random() * 100) + 1)}`,
        } }); */
      return doc.id.$id;
      // }
      // throw new Meteor.Error('insertDocument error');
    }
    throw new Meteor.Error('postUploadPixel error');
  },
  insertOrganization (docClean) {
    const doc = SchemasOrganizationsRest.clean(docClean);
    SchemasOrganizationsRest.validate(doc);
    // check(doc, SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, doc, 'organizations');
    docRetour.key = 'organization';
    docRetour.collection = 'organizations';

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
  updateOrganization ({ modifier, _id }) {
    check(_id, String);
    const documentId = _id;
    const cleanModifierSet = SchemasOrganizationsRest.clean(modifier.$set);
    SchemasOrganizationsRest.validate(cleanModifierSet);
    // check(modifier.$set, SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Organizations.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'organizations');
    docRetour.id = documentId;
    docRetour.key = 'organization';
    docRetour.collection = 'organizations';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
  createUserAccountRest (user) {
    // //console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.username, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, Match.Maybe(String));
    check(user.city, Match.Maybe(String));

    const passwordTest = new RegExp('(?=.{8,}).*', 'g');
    if (passwordTest.test(user.password) === false) {
      throw new Meteor.Error('Password is Too short');
    }

    if (!IsValidEmail(user.email)) {
      throw new Meteor.Error('Email not valid');
    }

    if (Citoyens.find({ email: user.email }).count() !== 0) {
      throw new Meteor.Error('Email not unique');
    }

    if (Citoyens.find({ username: user.username }).count() !== 0) {
      throw new Meteor.Error('Username not unique');
    }

    const urlRegEx = new RegExp(/^[a-z0-9-]+$/, 'i');
    if (urlRegEx.test(user.username) !== true) {
      throw new Meteor.Error('The-username-is-incorrect');
    }

    const params = {
      name: user.name,
      email: user.email,
      username: user.username,
      pwd: user.password,
    };

    if (user.city) {
      const locality = Cities.findOne({
        insee: user.city,
      });

      if (locality && locality.insee) {
        params.addressCountry = locality.country;
        params.postalCode = user.codepostal;
        params.codeInsee = locality.insee;
        params.addressLocality = locality.postalCodes[0].name;
      }
    }

    // console.log(params);

    try {
      const response = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/register`, {
        params,
      });
      // console.log(response);
      if (response.data.result && response.data.id) {
        const userId = response.data.id;
        return userId;
      }
      throw new Meteor.Error(response.data.msg);
    } catch (e) {
      // console.log(e);
      throw new Meteor.Error('Error server');
    }
  },
  getcitiesbylatlng (latlng) {
    check(latlng, { latitude: Number, longitude: Number });
    Cities._ensureIndex({
      geoShape: '2dsphere',
    });
    return Cities.findOne({ geoShape:
  { $geoIntersects:
    { $geometry: { type: 'Point',
      coordinates: [latlng.longitude, latlng.latitude] },
    },
  },
    }, { _disableOplog: true });
  },
  getcitiesbypostalcode (cp) {
    check(cp, String);
    return Cities.find({ 'postalCodes.postalCode': cp }).fetch();
  },
  searchCities (query, options) {
    check(query, String);
    if (!query) return [];

    options = options || {};

    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }

    // TODO fix regexp to support multiple tokens
    const regex = new RegExp(`^${query}`);
    return Cities.find({ $or: [{ name: { $regex: regex, $options: 'i' } }, { 'postalCodes.postalCode': { $regex: regex } }] }, options).fetch();
  },
  markRead (notifId) {
    check(notifId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.id = notifId;
    const retour = apiCommunecter.postPixel('co2/notification', 'marknotificationasread', notif);
    return retour;
  },
  markSeen (notifId) {
    check(notifId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.id = notifId;
    const retour = apiCommunecter.postPixel('co2/notification', 'update', notif);
    return retour;
  },
  alertCount () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    return ActivityStream.api.queryUnseen().count();
  },
  registerClick () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
  },
  allRead () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    /* const notif = {};
    notif.action = 'read';
    notif.all = true;
    const retour = apiCommunecter.postPixel('co2/notification', 'update', notif);
    return retour; */

    // update que les notification oceco
    const query = {};
    query[`notify.id.${this.userId}.isUnread`] = { $exists: true };
    query.type = 'oceco';
    const set = {};
    set.$unset = {};
    set.$unset[`notify.id.${this.userId}.isUnread`] = '';
    const update = ActivityStream.update(query, set, { multi: true });
    return update;
  },
  allSeen () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    /* const notif = {};
    notif.action = 'seen';
    notif.all = true;
    const retour = apiCommunecter.postPixel('co2/notification', 'update', notif);
    return retour; */

    // update que les notification oceco
    const query = {};
    query[`notify.id.${this.userId}.isUnseen`] = { $exists: true };
    query.type = 'oceco';
    const set = {};
    set.$unset = {};
    set.$unset[`notify.id.${this.userId}.isUnseen`] = '';
    const update = ActivityStream.update(query, set, { multi: true });
    return update;
  },
  isEmailValid(address) {
    check(address, String);

    // modify this with your key
    const result = HTTP.get('https://api.mailgun.net/v2/address/validate', {
      auth: `api:${Meteor.settings.mailgunpubkey}`,
      params: { address: address.trim() },
    });

    if (result.statusCode === 200) {
    // is_valid is the boolean we are looking for
      return result.data.is_valid;
    }
    // the api request failed (maybe the service is down)
    // consider giving the user the benefit of the doubt and return true
    return true;
  },

});

export const userLocale = new ValidatedMethod({
  name: 'userLocale',
  validate: new SimpleSchema({
    language: { type: String },
  }).validator(),
  run({ language }) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // console.log(language);
    if (Meteor.users.update({
      _id: this.userId,
    }, {
      $set: {
        'profile.language': language,
      },
    })) {
      return true;
    }

    return false;
  },
});

export const userDevice = new ValidatedMethod({
  name: 'userDevice',
  validate: new SimpleSchema({
    available: { type: Boolean },
    cordova: { type: String },
    model: { type: String },
    platform: { type: String },
    uuid: { type: String },
    version: { type: String },
    manufacturer: { type: String },
    isVirtual: { type: Boolean },
    serial: { type: String },
  }).validator(),
  run(device) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // console.log(device);
    if (Meteor.users.update({
      _id: this.userId,
    }, {
      $addToSet: {
        'profile.device': device,
      },
    })) {
      return true;
    }

    return false;
  },
});

export const updateRoles = new ValidatedMethod({
  name: 'updateRoles',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier }) {
    SchemasRolesRest.clean(modifier);
    SchemasRolesRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const collection = nameToCollection(modifier.$set.contextType);
    if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.contextId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    const docRetour = modifier.$set;
    if (modifier && modifier.$set && modifier.$set.roles) {
      docRetour.roles = modifier.$set.roles.join(',');
    }

    const retour = apiCommunecter.postPixel('co2/link', 'removerole', docRetour);
    return retour;
  },
});

export const updateOceco = new ValidatedMethod({
  name: 'updateOceco',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasOrganizationsOcecoRest.clean(modifier);
    SchemasOrganizationsOcecoRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // console.log(_id);
    // console.log(modifier);

    if (!Organizations.findOne({ _id: new Mongo.ObjectID(_id) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const retour = Organizations.update({ _id: new Mongo.ObjectID(_id) }, modifier);
    // console.log(retour);
    if (retour) {
      return _id;
    }
    throw new Meteor.Error('error');
  },
});

export const updateCitoyenOceco = new ValidatedMethod({
  name: 'updateCitoyenOceco',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasCitoyensOcecoRest.clean(modifier);
    SchemasCitoyensOcecoRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // console.log(_id);
    // console.log(modifier);

    if (_id !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const retour = Citoyens.update({ _id: new Mongo.ObjectID(this.userId) }, modifier);
    // console.log(retour);
    if (retour) {
      return _id;
    }
    throw new Meteor.Error('error');
  },
});

export const insertRoom = new ValidatedMethod({
  name: 'insertRoom',
  validate: SchemasRoomsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // admin ou membre
    const collection = nameToCollection(doc.parentType);
    const scopeOne = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });

    if (!(scopeOne.isAdmin() || Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(doc.parentType, doc.parentId))) {
      throw new Meteor.Error('not-authorized isAdmin');
    }

    const docRetour = doc;
    docRetour.status = 'open';
    if (doc && doc.roles) {
      docRetour.roles = doc.roles.join(',');
    }
    docRetour.key = 'room';
    docRetour.collection = 'rooms';

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
});

export const updateRoom = new ValidatedMethod({
  name: 'updateRoom',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasRoomsRest.clean(modifier);
    SchemasRoomsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // admin ou creator
    const collection = nameToCollection(modifier.$set.parentType);
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin() || Rooms.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = modifier.$set;
    if (modifier && modifier.$set && modifier.$set.roles) {
      docRetour.roles = modifier.$set.roles.join(',');
    }
    docRetour.status = 'open';
    docRetour.key = 'room';
    docRetour.collection = 'rooms';
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
});

export const insertProposal = new ValidatedMethod({
  name: 'insertProposal',
  validate: SchemasProposalsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // membre ou membre avec roles si room à des roles
    const room = Rooms.findOne({ _id: new Mongo.ObjectID(doc.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
      if (room.roles && room.roles.length > 0) {
        const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
        if (roles && room.roles.some(role => roles.includes(role))) {
          // true
        } else {
          // false
          throw new Meteor.Error('not-authorized');
        }
      }
    } else {
      throw new Meteor.Error('not-authorized');
    }
    const docRetour = doc;
    docRetour.majority = doc.majority.toString();
    if (doc.amendementDateEnd) {
      docRetour.amendementDateEnd = moment(doc.amendementDateEnd).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (doc.voteDateEnd) {
      docRetour.voteDateEnd = moment(doc.voteDateEnd).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    docRetour.key = 'proposal';
    docRetour.collection = 'proposals';
    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
});

export const updateProposal = new ValidatedMethod({
  name: 'updateProposal',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasProposalsRest.clean(modifier);
    SchemasProposalsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Proposals.findOne({ _id: new Mongo.ObjectID(_id) })) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(modifier.$set.parentType);
    // admin ou creator
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin() || Proposals.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    /* const room = Rooms.findOne({ _id: new Mongo.ObjectID(modifier.$set.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    } */

    const docRetour = modifier.$set;
    docRetour.majority = modifier.$set.majority.toString();
    if (modifier.$set.amendementDateEnd) {
      docRetour.amendementDateEnd = moment(modifier.$set.amendementDateEnd).format();
    }
    if (modifier.$set.voteDateEnd) {
      docRetour.voteDateEnd = moment(modifier.$set.voteDateEnd).format();
    }
    docRetour.key = 'proposal';
    docRetour.collection = 'proposals';
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
});


export const insertAction = new ValidatedMethod({
  name: 'insertAction',
  validate: SchemasActionsRest.validator(),
  run(doc) {
    const docClean = SchemasActionsRest.clean(doc);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const collectionScope = nameToCollection(doc.parentType);
    const scopeOne = collectionScope.findOne({
      _id: new Mongo.ObjectID(doc.parentId),
    });

    if (!scopeOne) {
      throw new Meteor.Error('scope-not-exist');
    }

    let orgaOne = null;
    let orgaId;
    // doit tester si oceco ou pas
    if (doc.parentType === 'citoyens') {
      // test citoyens
      orgaId = false;
    } else if (doc.parentType === 'organizations') {
      // test organizations > verifie oceco exists
      if (!scopeOne.oceco) {
        throw new Meteor.Error('not-authorized organizations oceco');
      }
      orgaOne = scopeOne;
      orgaId = scopeOne._id._str;
    } else if (doc.parentType === 'projects') {
      // projects > organizations > verifie oceco exists
      const project = `links.projects.${scopeOne._id._str}`;
      const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } }, { fields: { _id: 1, oceco: 1 } });
      if (!organizationOne) {
        throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
      }
      orgaOne = organizationOne;
      orgaId = organizationOne._id._str;
    } else if (doc.parentType === 'events') {
      // events > projects > organizations > verifie oceco exists
      const event = `links.events.${scopeOne._id._str}`;
      const projectOne = Projects.findOne({ [event]: { $exists: 1 } }, { fields: { _id: 1 } });
      if (projectOne) {
        const project = `links.projects.${projectOne._id._str}`;
        const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } }, { fields: { _id: 1, oceco: 1 } });
        if (!organizationOne) {
          throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
        }
        orgaOne = organizationOne;
        orgaId = organizationOne._id._str;
      } else {
        throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
      }
    }

    // membre ou membre avec roles si room à des roles
    let room = Rooms.findOne({ parentId: doc.parentId }, { fields: { _id: 1 } });
    if (!room) {
      // create room sur project auto
      const docRoom = {};
      docRoom.name = scopeOne.name;
      docRoom.description = 'action bénévolat';
      docRoom.parentType = doc.parentType;
      docRoom.parentId = doc.parentId;
      docRoom.status = 'open';
      docRoom.key = 'room';
      docRoom.collection = 'rooms';
      // eslint-disable-next-line no-unused-vars
      const retourRoom = apiCommunecter.postPixel('co2/element', 'save', docRoom);
    //
    }
    room = room || Rooms.findOne({ parentId: doc.parentId }, { fields: { _id: 1 } });

    /* if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(doc.parentType, doc.parentId)) {
      console.log('citoyen is scope');
      if (room.roles && room.roles.length > 0) {
        const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(doc.parentType, doc.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(doc.parentType, doc.parentId).split(',') : null;
        if (roles && room.roles.some(role => roles.includes(role))) {
          // true

        } else {
          // false
          throw new Meteor.Error('not-authorized role');
        }
      }
    } else { */

    // si event difficile de voir le lien admin docn je remonte
    // eslint-disable-next-line no-lonely-if
    if (['events', 'projects', 'organizations', 'citoyens'].includes(doc.parentType)) {
      // console.log('event is admin');
      if (!(orgaOne && orgaOne.oceco && orgaOne.oceco.memberAddAction === true && orgaOne.isMembers())) {
        if (!(scopeOne && scopeOne.isAdmin())) {
          throw new Meteor.Error(`not-authorized admin ${doc.parentType}`);
        }
      }
    } else {
      throw new Meteor.Error('not-authorized all');
    }
    // }

    let docRetour = docClean;

    if (doc.startDate) {
      docRetour.startDate = moment(doc.startDate).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (doc.endDate) {
      docRetour.endDate = moment(doc.endDate).format('YYYY-MM-DDTHH:mm:ssZ');
    }

    if (doc.tagsText) {
      docRetour = matchTags(docRetour);
      if (orgaId && docRetour.tags && docRetour.tags.length > 0) {
        Organizations.update({ _id: new Mongo.ObjectID(orgaId) }, { $addToSet: { 'oceco.tags': { $each: docRetour.tags } } });
      }
      delete docRetour.tagsText;
    }

    docRetour.status = 'todo';
    docRetour.idUserAuthor = this.userId;
    docRetour.key = 'action';
    docRetour.collection = 'actions';
    docRetour.idParentRoom = room._id._str;

    const docUpdate = { ...docRetour.options };
    if (docRetour.options) {
      if (docRetour.options.creditAddPorteur) {
        // credit ajouté par le participant
        delete docRetour.credits;
        delete docRetour.options.creditAddPorteur;
      }
      if (docRetour.options.creditSharePorteur) {
        delete docRetour.options.creditSharePorteur;
      }
      if (docRetour.options.possibleStartActionBeforeStartDate) {
        delete docRetour.options.possibleStartActionBeforeStartDate;
      }
      delete docRetour.options;
    }

    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);

    // count
    if (doc.parentType !== 'citoyens') {
      countActionScope(doc.parentType, doc.parentId, 'todo');
    }
    //

    // notification
    if (retour && retour.data && retour.data.id) {
      if (docUpdate) {
        Actions.update({ _id: new Mongo.ObjectID(retour.data.id) }, { $set: { options: docUpdate } });
      }

      if (doc.parentType !== 'citoyens') {
        const actionOne = Actions.findOne({
          _id: new Mongo.ObjectID(retour.data.id),
        });

        const notif = {};
        const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
        // author
        notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
        // object
        notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
        if (actionOne.isActionDepense()) {
          ActivityStream.api.add(notif, 'addSpent', 'isMember');
          ActivityStream.api.add(notif, 'addSpent', 'isAdmin');
        } else {
          ActivityStream.api.add(notif, 'add', 'isMember');
          ActivityStream.api.add(notif, 'add', 'isAdmin');
        }
      }
    }
    return retour;
  },
});


export const updateAction = new ValidatedMethod({
  name: 'updateAction',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    const modifierClean = SchemasActionsRest.clean(modifier.$set);
    SchemasActionsRest.validate(modifier, { modifier: true });
    const collectionScope = nameToCollection(modifierClean.parentType);
    const scopeOne = collectionScope.findOne({
      _id: new Mongo.ObjectID(modifierClean.parentId),
    });

    if (!scopeOne) {
      throw new Meteor.Error('not-authorized');
    }

    let orgaId;
    // doit tester si oceco ou pas
    if (modifierClean.parentType === 'organizations') {
      // test organizations > verifie oceco exists
      if (!scopeOne.oceco) {
        throw new Meteor.Error('not-authorized organizations oceco');
      }
      orgaId = scopeOne._id._str;
    } else if (modifierClean.parentType === 'projects') {
      // projects > organizations > verifie oceco exists
      const project = `links.projects.${scopeOne._id._str}`;
      const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } });
      if (!organizationOne) {
        throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
      }
      orgaId = organizationOne._id._str;
    } else if (modifierClean.parentType === 'events') {
      // events > projects > organizations > verifie oceco exists
      const event = `links.events.${scopeOne._id._str}`;
      const projectOne = Projects.findOne({ [event]: { $exists: 1 } });
      if (projectOne) {
        const project = `links.projects.${projectOne._id._str}`;
        const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } });
        if (!organizationOne) {
          throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
        }
        orgaId = organizationOne._id._str;
      } else {
        throw new Meteor.Error('not-authorized-organizations-oceco', 'not authorized organizations oceco');
      }
    }

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Actions.findOne({ _id: new Mongo.ObjectID(_id) })) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(modifierClean.parentType);
    // admin ou creator
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifierClean.parentId) }).isAdmin() || Actions.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    let docRetour = {};

    if (modifier.$unset) {
      docRetour = { ...modifier.$unset, ...modifierClean };
    } else {
      docRetour = { ...modifierClean };
    }

    if (modifierClean.startDate) {
      docRetour.startDate = moment(modifierClean.startDate).format();
    }
    if (modifierClean.endDate) {
      docRetour.endDate = moment(modifierClean.endDate).format();
    }
    if (modifierClean.min) {
      docRetour.min = modifierClean.min;
    }
    if (modifierClean.max) {
      docRetour.max = modifierClean.max;
    }
    if (modifierClean.participants) {
      docRetour.participants = modifierClean.participants;
    }

    // console.log(modifier);
    // console.log(docRetour);
    if (modifierClean.tagsText) {
      docRetour = matchTags(docRetour);
      if (docRetour.tags && docRetour.tags.length > 0) {
        Organizations.update({ _id: new Mongo.ObjectID(orgaId) }, { $addToSet: { 'oceco.tags': { $each: docRetour.tags } } });
      }
      delete docRetour.tagsText;
    }
    
    if (modifier && modifier.$unset && 'tagsText' in modifier.$unset) {
      docRetour.tags = '';
      delete docRetour.tagsText;
    }

    docRetour['options.creditAddPorteur'] = docRetour['options.creditAddPorteur'] || false;
    docRetour['options.creditSharePorteur'] = docRetour['options.creditSharePorteur'] || false;
    docRetour['options.possibleStartActionBeforeStartDate'] = docRetour['options.possibleStartActionBeforeStartDate'] || false;

    Actions.update({ _id: new Mongo.ObjectID(_id) }, { $set: { 'options.creditAddPorteur': docRetour['options.creditAddPorteur'], 'options.creditSharePorteur': docRetour['options.creditSharePorteur'], 'options.possibleStartActionBeforeStartDate': docRetour['options.possibleStartActionBeforeStartDate'] } });

    if (docRetour['options.creditAddPorteur']) {
      // credit ajouté par le participant
      delete docRetour.credits;
      delete docRetour['options.creditAddPorteur'];
    } else {
      delete docRetour['options.creditAddPorteur'];
    }
    delete docRetour['options.creditSharePorteur'];
    delete docRetour['options.possibleStartActionBeforeStartDate'];


    docRetour.status = 'todo';
    docRetour.idUserAuthor = this.userId;
    docRetour.key = 'action';
    docRetour.collection = 'actions';
    docRetour.id = _id;

    // console.log(docRetour);
    const retour = apiCommunecter.postPixel('co2/element', 'save', docRetour);
    return retour;
  },
});

  // finishUserAction(id){
  //   check(id, String);

  //


export const insertAmendement = new ValidatedMethod({
  name: 'insertAmendement',
  validate: BlockProposalsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // membre ou membre avec roles si room à des roles
    const query = {};
    query._id = new Mongo.ObjectID(doc.id);
    const proposal = Proposals.findOne(query);
    if (!proposal) {
      throw new Meteor.Error('not-authorized');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(proposal.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized');
      } else if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
          const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
          if (roles && room.roles.some(role => roles.includes(role))) {
            // true
          } else {
            // false
            throw new Meteor.Error('not-authorized');
          }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }
    const docRetour = doc;

    /* block:amendement
    typeElement:proposals
    id:59d7450d40bb4e926fdcd10b
    txtAmdt:proposition amendement
    typeAmdt:add */

    const retour = apiCommunecter.postPixel('co2/element', 'updateblock', docRetour);
    return retour;
  },
});

export const updateAmendement = new ValidatedMethod({
  name: 'updateAmendement',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    BlockProposalsRest.clean(modifier);
    BlockProposalsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    let docRetour = {};

    if (modifier.$unset) {
      docRetour = { ...modifier.$set, ...modifier.$unset };
    } else {
      docRetour = { ...modifier.$set };
    }

    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('co2/element', 'updateblock', docRetour);
    return retour;
  },
});

export const saveVote = new ValidatedMethod({
  name: 'saveVote',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['amendement', 'proposal'] },
    parentId: { type: String },
    voteValue: { type: String, allowedValues: ['up', 'down', 'white', 'uncomplet'] },
    idAmdt: { type: String, optional: true },
  }).validator(),
  run({ parentType, parentId, voteValue, idAmdt }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // TODO verifier si user à droit de voter
    if (parentType === 'amendement' && !idAmdt) {
      throw new Meteor.Error('not-authorized');
    }

    const query = {};
    query._id = new Mongo.ObjectID(parentId);
    if (parentType === 'amendement' && idAmdt) {
      query[`amendements.${idAmdt}`] = { $exists: true };
    }
    const proposal = Proposals.findOne(query);
    if (!proposal) {
      throw new Meteor.Error('not-authorized');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(proposal.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized');
      } else if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
          const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
          if (roles && room.roles.some(role => roles.includes(role))) {
            // true
          } else {
            // false
            throw new Meteor.Error('not-authorized');
          }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = {};
    docRetour.parentType = parentType;
    docRetour.parentId = parentId;
    docRetour.voteValue = voteValue;
    if (parentType === 'amendement') {
      if (idAmdt) {
        docRetour.idAmdt = idAmdt;
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }

    const retour = apiCommunecter.postPixel('dda/co', 'savevote', docRetour);
    return retour;
  },
});


export const assignmeActionRooms = new ValidatedMethod({
  name: 'assignmeActionRooms',
  validate: new SimpleSchema({
    id: { type: String },
    startDate: {
      type: String,
      optional: true },
    endDate: {
      type: String,
      optional: true },
    credits: {
      type: Number,
      optional: true },
  }).validator(),
  run({ id, startDate, endDate, credits }) {
    const actionObjectId = new Mongo.ObjectID(id);
    const actionOne = Actions.findOne({ _id: actionObjectId });
    const parentObjectId = new Mongo.ObjectID(actionOne.parentId);
    const orgOne = Organizations.findOne({ _id: parentObjectId }, { fields: { _id: 1 } });
    let orgId;
    if (orgOne) {
      orgId = orgOne._id._str;
    } else {
      if (actionOne && actionOne.parentType !== 'citoyens') {
        const eventId = Events.findOne({ _id: parentObjectId }) ? Events.findOne({ _id: parentObjectId })._id._str : null;
        const event = eventId ? `links.events.${eventId}` : null;

        const projectId = event ? Projects.findOne({ [event]: { $exists: 1 } })._id._str : null;
        const project = projectId ? `links.projects.${projectId}` : `links.projects.${Projects.findOne({ _id: parentObjectId })._id._str}`;

        orgId = Organizations.findOne({ [project]: { $exists: 1 } })._id._str;
      } else {
        orgId = false;
      }
    }

    const parent = `finishedBy.${Meteor.userId()}`;

    const orgaSetting = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) });

    function userCredits() {
      const userObjId = new Mongo.ObjectID(Meteor.userId());
      const credits = Citoyens.findOne({ _id: userObjId }).userWallet[`${orgId}`].userCredits;
      return credits;
    }

    function walletIsOk(id) {
      const cost = Actions.findOne({ _id: new Mongo.ObjectID(id) }) && Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits && !typeOfNaN(Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits) ? parseInt(Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits) : 0;
      if (cost >= 0) {
        return true;
      } else if (userCredits() >= (cost * -1)) {
        const userCredit = `userWallet.${orgId}.userCredits`;
        const userObjectId = new Mongo.ObjectID(Meteor.userId());
        if (!Citoyens.findOne({ _id: userObjectId, [userCredit]: { $exists: 1 } })) {
          Citoyens.update({ _id: userObjectId }, { $set: { [userCredit]: 0 } });
        }
        Actions.update({ _id: actionObjectId }, { $set: { [parent]: 'validated' } });
        Citoyens.update({ _id: userObjectId }, { $inc: { [userCredit]: cost } });
        return true;
      } else if (orgaSetting && orgaSetting.oceco && orgaSetting.oceco.spendNegative === true && ((orgaSetting.oceco.spendNegativeMax - userCredits()) * -1) >= (cost * -1)) {
        const userCredit = `userWallet.${orgId}.userCredits`;
        const userObjectId = new Mongo.ObjectID(Meteor.userId());
        if (!Citoyens.findOne({ _id: userObjectId, [userCredit]: { $exists: 1 } })) {
          Citoyens.update({ _id: userObjectId }, { $set: { [userCredit]: 0 } });
        }
        Actions.update({ _id: actionObjectId }, { $set: { [parent]: 'validated' } });
        Citoyens.update({ _id: userObjectId }, { $inc: { [userCredit]: cost } });
        // log user action credit
        const logInsert = {};
        logInsert.userId = Meteor.userId();
        logInsert.organizationId = orgId;
        logInsert.actionId = id;
        if (cost) {
          logInsert.credits = cost;
          logInsert.createdAt = moment().format();
          LogUserActions.insert(logInsert);
        }
        return true;
      }

      return false;
    }

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }


    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) });
    // projects auto true
    const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
    if (userC && actionOne.parentType === 'projects') {
      if (!userC.isScope('projects', actionOne.parentId)) {
        if (orgaOne && orgaOne.oceco && orgaOne.oceco.contributorAuto) {
          console.log(actionOne.parentType);
          if (userC.isInviting('projects', actionOne.parentId)) {
            console.log('isInviting');

            if (orgaOne && orgaOne.oceco && orgaOne.oceco.contributorAuto) {
              Citoyens.update({
                _id: new Mongo.ObjectID(userC._id._str),
              }, {
                $unset: {
                  [`links.projects.${actionOne.parentId}.toBeValidated`]: '',
                  [`links.projects.${actionOne.parentId}.isInviting`]: '',
                },
              });

              Projects.update({
                _id: new Mongo.ObjectID(actionOne.parentId),
              }, {
                $unset: {
                  [`links.contributors.${userC._id._str}.toBeValidated`]: '',
                  [`links.contributors.${userC._id._str}.isInviting`]: '',
                },
              });
            }
          } else {
            const retour = Meteor.call('connectEntity', actionOne.parentId, 'projects', userC._id._str, 'contributor', orgId);
            if (orgaOne && orgaOne.oceco && orgaOne.oceco.contributorAuto) {
              Citoyens.update({
                _id: new Mongo.ObjectID(userC._id._str),
              }, {
                $unset: {
                  [`links.projects.${actionOne.parentId}.toBeValidated`]: '',
                  [`links.projects.${actionOne.parentId}.isInviting`]: '',
                },
              });

              Projects.update({
                _id: new Mongo.ObjectID(actionOne.parentId),
              }, {
                $unset: {
                  [`links.contributors.${userC._id._str}.toBeValidated`]: '',
                  [`links.contributors.${userC._id._str}.isInviting`]: '',
                },
              });
            }
          }
        }
      }
    } else if (userC && actionOne.parentType === 'events') {
      if (!userC.isScope('events', actionOne.parentId)) {
        if (orgaOne && orgaOne.oceco && orgaOne.oceco.attendeAuto) {
          if (userC.isInviting('events', actionOne.parentId)) {
            if (orgaOne && orgaOne.oceco && orgaOne.oceco.attendeAuto) {
              Citoyens.update({
                _id: new Mongo.ObjectID(userC._id._str),
              }, {
                $unset: {
                  [`links.events.${actionOne.parentId}.toBeValidated`]: '',
                  [`links.events.${actionOne.parentId}.isInviting`]: '',
                },
              });

              Events.update({
                _id: new Mongo.ObjectID(actionOne.parentId),
              }, {
                $unset: {
                  [`links.attendees.${userC._id._str}.toBeValidated`]: '',
                  [`links.attendees.${userC._id._str}.isInviting`]: '',
                },
              });
            }
          } else {
            const retour = Meteor.call('connectEntity', actionOne.parentId, 'events', userC._id._str, 'attendee', orgId);
            if (orgaOne && orgaOne.oceco && orgaOne.oceco.attendeAuto) {
              Citoyens.update({
                _id: new Mongo.ObjectID(userC._id._str),
              }, {
                $unset: {
                  [`links.events.${actionOne.parentId}.toBeValidated`]: '',
                  [`links.events.${actionOne.parentId}.isInviting`]: '',
                },
              });

              Events.update({
                _id: new Mongo.ObjectID(actionOne.parentId),
              }, {
                $unset: {
                  [`links.attendees.${userC._id._str}.toBeValidated`]: '',
                  [`links.attendees.${userC._id._str}.isInviting`]: '',
                },
              });
            }
          }
        }
      }
    }

    // TODO verifier si id est une room existante et les droit pour ce l'assigner
    // id action > recupérer idParentRoom,parentType,parentId > puis roles dans room
    const action = Actions.findOne({ _id: new Mongo.ObjectID(id), status: 'todo' });
    if (!action) {
      throw new Meteor.Error('not-authorized action');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(action.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized room');
      }/* else if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
          const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
          if (roles && room.roles.some(role => roles.includes(role))) {
            // true
          } else {
            // false
            throw new Meteor.Error('not-authorized roles');
          }
        }
      } else {
        throw new Meteor.Error('not-authorized citoyen');
      } */
    }
    if (orgId && !walletIsOk(id)) {
      throw new Meteor.Error('Pas assé de');
    }
    const docRetour = {};
    docRetour.id = id;
    const retour = apiCommunecter.postPixel('co2/rooms', 'assignme', docRetour);


    if (!action.startDate) {
      if (startDate) {
        Actions.update({ _id: actionObjectId }, { $set: { startDate: new Date(startDate), noStartDate: true } });
      } else {
        Actions.update({ _id: actionObjectId }, { $set: { startDate: new Date(), noStartDate: true } });
      }
    }

    if (action.startDate && action.isPossibleStartActionBeforeStartDate()) {
      if (startDate) {
        Actions.update({ _id: actionObjectId }, { $set: { startDate: new Date(startDate), noStartDate: true } });
      }
    }

    if (!action.endDate) {
      if (endDate) {
        Actions.update({ _id: actionObjectId }, { $set: { endDate: new Date(endDate), noEndDate: true } });
      }
    }

    if (!action.min) {
      Actions.update({ _id: actionObjectId }, { $set: { min: 1 } });
    }
    if (!action.max) {
      Actions.update({ _id: actionObjectId }, { $set: { max: 1 } });
    }
    if (!action.credits) {
      if (credits && action.options && action.options.creditAddPorteur) {
        Actions.update({ _id: actionObjectId }, { $set: { credits } });
      } else {
        Actions.update({ _id: actionObjectId }, { $set: { credits: 0 } });
      }
    }

    // notification
    if (action.parentType !== 'citoyens') {
      const notif = {};
      const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
      // author
      notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
      // object
      notif.object = { id: action._id._str, name: action.name, type: 'actions', parentType: action.parentType, parentId: action.parentId, idParentRoom: action.idParentRoom };
      if (action.isActionDepense()) {
        ActivityStream.api.add(notif, 'joinSpent', 'isAdmin');
      } else {
        ActivityStream.api.add(notif, 'join', 'isAdmin');
      }
    }


    return retour;
  },
});

export const assignMemberActionRooms = new ValidatedMethod({
  name: 'assignMemberActionRooms',
  validate: new SimpleSchema({
    id: { type: String },
    memberId: { type: String },
    startDate: {
      type: String,
      optional: true,
    },
    endDate: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ id, memberId, startDate, endDate }) {
    const actionObjectId = new Mongo.ObjectID(id);
    const actionOne = Actions.findOne({ _id: actionObjectId });
    const parentObjectId = new Mongo.ObjectID(actionOne.parentId);
    const parentType = actionOne.parentType;
    const collection = nameToCollection(parentType);

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


    const parent = `finishedBy.${memberId}`;

    const orgaSetting = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) }, { fields: { _id: 1, oceco: 1 } });

    function userCredits() {
      const userObjId = new Mongo.ObjectID(memberId);
      const credits = Citoyens.findOne({ _id: userObjId }).userWallet[`${orgId}`].userCredits;
      return credits;
    }

    function walletIsOk(id) {
      const cost = Actions.findOne({ _id: new Mongo.ObjectID(id) }) && Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits && !typeOfNaN(Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits) ? parseInt(Actions.findOne({ _id: new Mongo.ObjectID(id) }).credits) : 0;
      if (cost >= 0) {
        return true;
      } else if (userCredits() >= (cost * -1)) {
        // const userActions = `userWallet.${orgId}.userActions.${id}`;
        const userCredit = `userWallet.${orgId}.userCredits`;
        const userObjectId = new Mongo.ObjectID(memberId);
        if (!Citoyens.findOne({ _id: userObjectId, [userCredit]: { $exists: 1 } })) {
          Citoyens.update({ _id: userObjectId }, { $set: { [userCredit]: 0 } });
        }
        Actions.update({ _id: actionObjectId }, { $set: { [parent]: 'validated' } });
        // Citoyens.update({ _id: userObjectId }, { $set: { [userActions]: cost } });
        Citoyens.update({ _id: userObjectId }, { $inc: { [userCredit]: cost } });
        return true;
      } else if (orgaSetting && orgaSetting.oceco && orgaSetting.oceco.spendNegative === true && ((orgaSetting.oceco.spendNegativeMax - userCredits()) * -1) >= (cost * -1)) {
        const userCredit = `userWallet.${orgId}.userCredits`;
        const userObjectId = new Mongo.ObjectID(memberId);
        if (!Citoyens.findOne({ _id: userObjectId, [userCredit]: { $exists: 1 } })) {
          Citoyens.update({ _id: userObjectId }, { $set: { [userCredit]: 0 } });
        }
        Actions.update({ _id: actionObjectId }, { $set: { [parent]: 'validated' } });
        Citoyens.update({ _id: userObjectId }, { $inc: { [userCredit]: cost } });
        // log user action credit
        const logInsert = {};
        logInsert.userId = memberId;
        logInsert.organizationId = orgId;
        logInsert.actionId = id;
        if (cost) {
          logInsert.credits = cost;
          logInsert.createdAt = moment().format();
          LogUserActions.insert(logInsert);
        }
        return true;
      }

      return false;
    }

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // verifier si admin
    if (!collection.findOne({ _id: parentObjectId }).isAdmin()) {
      if (!(orgaSetting.oceco && orgaSetting.oceco.memberAddAction && Actions.findOne({ _id: actionObjectId }).isCreator() && memberId === this.userId)) {
        throw new Meteor.Error('not-authorized-admin');
      }
    }

    // verifier si member existe
    if (!Citoyens.findOne({ _id: new Mongo.ObjectID(memberId) })) {
      throw new Meteor.Error('not-exist-member-id');
    }

    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(orgId) });
    // projects auto true
    const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(memberId) }, { fields: { pwd: 0 } });
    if (userC && parentType === 'projects') {
      // verifier si membre orga
      // testMembers
      if (!userC.isScope('organizations', orgId)) {memberId
        const retour = Meteor.call('connectEntity', orgId, 'organizations', userC._id._str, 'member');
        Citoyens.update({
          _id: new Mongo.ObjectID(userC._id._str),
        }, {
          $unset: {
            [`links.memberOf.${orgId}.toBeValidated`]: '',
            [`links.memberOf.${orgId}.isInviting`]: '',
          },
        });

        Organizations.update({
          _id: new Mongo.ObjectID(orgId),
        }, {
          $unset: {
            [`links.members.${userC._id._str}.toBeValidated`]: '',
            [`links.members.${userC._id._str}.isInviting`]: '',
          },
        });
        // todo faire email
      }
      //
      if (!userC.isScope('projects', actionOne.parentId)) {
        if (orgaOne && orgaOne.oceco && orgaOne.oceco.contributorAuto) {
          if (userC.isInviting('projects', actionOne.parentId)) {
            Citoyens.update({
              _id: new Mongo.ObjectID(userC._id._str),
            }, {
              $unset: {
                [`links.projects.${actionOne.parentId}.toBeValidated`]: '',
                [`links.projects.${actionOne.parentId}.isInviting`]: '',
              },
            });

            Projects.update({
              _id: new Mongo.ObjectID(actionOne.parentId),
            }, {
              $unset: {
                [`links.contributors.${userC._id._str}.toBeValidated`]: '',
                [`links.contributors.${userC._id._str}.isInviting`]: '',
              },
            });
          } else {
            const retour = Meteor.call('connectEntity', actionOne.parentId, 'projects', userC._id._str, 'contributor', orgId);
            Citoyens.update({
              _id: new Mongo.ObjectID(userC._id._str),
            }, {
              $unset: {
                [`links.projects.${actionOne.parentId}.toBeValidated`]: '',
                [`links.projects.${actionOne.parentId}.isInviting`]: '',
              },
            });

            Projects.update({
              _id: new Mongo.ObjectID(actionOne.parentId),
            }, {
              $unset: {
                [`links.contributors.${userC._id._str}.toBeValidated`]: '',
                [`links.contributors.${userC._id._str}.isInviting`]: '',
              },
            });
          }
        }
      }
    } else if (userC && parentType === 'events') {
      if (!userC.isScope('events', actionOne.parentId)) {
        if (orgaOne && orgaOne.oceco && orgaOne.oceco.attendeAuto) {
          if (userC.isInviting('events', actionOne.parentId)) {
            Citoyens.update({
              _id: new Mongo.ObjectID(userC._id._str),
            }, {
              $unset: {
                [`links.events.${actionOne.parentId}.toBeValidated`]: '',
                [`links.events.${actionOne.parentId}.isInviting`]: '',
              },
            });

            Events.update({
              _id: new Mongo.ObjectID(actionOne.parentId),
            }, {
              $unset: {
                [`links.attendees.${userC._id._str}.toBeValidated`]: '',
                [`links.attendees.${userC._id._str}.isInviting`]: '',
              },
            });
          } else {
            const retour = Meteor.call('connectEntity', actionOne.parentId, 'events', userC._id._str, 'attendee', orgId);
            Citoyens.update({
              _id: new Mongo.ObjectID(userC._id._str),
            }, {
              $unset: {
                [`links.events.${actionOne.parentId}.toBeValidated`]: '',
                [`links.events.${actionOne.parentId}.isInviting`]: '',
              },
            });

            Events.update({
              _id: new Mongo.ObjectID(actionOne.parentId),
            }, {
              $unset: {
                [`links.attendees.${userC._id._str}.toBeValidated`]: '',
                [`links.attendees.${userC._id._str}.isInviting`]: '',
              },
            });
          }
        }
      }
    }

    // TODO verifier si id est une room existante et les droit pour ce l'assigner
    // id action > recupérer idParentRoom,parentType,parentId > puis roles dans room
    const action = Actions.findOne({ _id: new Mongo.ObjectID(id), status: 'todo' });
    if (!action) {
      throw new Meteor.Error('not-authorized-action');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(action.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized-room');
      }/* else if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
          const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
          if (roles && room.roles.some(role => roles.includes(role))) {
            // true
          } else {
            // false
            throw new Meteor.Error('not-authorized roles');
          }
        }
      } else {
        throw new Meteor.Error('not-authorized citoyen');
      } */
    }
    if (!walletIsOk(id)) {
      throw new Meteor.Error('wallet-no-ok');
    }

    // invitationScope(parentId, parentType, connectType, childType, childEmail, childName, childId)
    // const retour = Meteor.call('invitationScope', id, 'actions', 'projects', 'citoyens', null, null, memberId);
    // const retour = apiCommunecter.postPixel('co2/rooms', 'assignpeople', docRetour);
    const contributor = `links.contributors.${memberId}`;
    const retour = Actions.update({ _id: new Mongo.ObjectID(id) }, { $set: { [contributor]: { type: 'citoyens' } } });


    if (!action.startDate) {
      if (startDate) {
        Actions.update({ _id: actionObjectId }, { $set: { startDate: new Date(startDate), noStartDate: true } });
      } else {
        Actions.update({ _id: actionObjectId }, { $set: { startDate: new Date(), noStartDate: true } });
      }
    }

    if (!action.endDate) {
      if (endDate) {
        Actions.update({ _id: actionObjectId }, { $set: { endDate: new Date(endDate), noEndDate: true } });
      }
    }

    if (!action.min) {
      Actions.update({ _id: actionObjectId }, { $set: { min: 1 } });
    }
    if (!action.max) {
      Actions.update({ _id: actionObjectId }, { $set: { max: 1 } });
    }
    if (!action.credits) {
      Actions.update({ _id: actionObjectId }, { $set: { credits: 0 } });
    }

    // si action max est plus petit que le nombre de contributor
    const countContrib = action.listContributors() ? action.listContributors().count() + 1 : 1;
    if (action.max < countContrib) {
      Actions.update({ _id: actionObjectId }, { $set: { max: countContrib } });
    }

    // notification
    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: action._id._str, name: action.name, type: 'actions', parentType: action.parentType, parentId: action.parentId, idParentRoom: action.idParentRoom };
    // mention
    const mentionOne = Citoyens.findOne({ _id: new Mongo.ObjectID(memberId) });
    notif.mention = { id: mentionOne._id._str, name: mentionOne.name, type: 'citoyens', username: mentionOne.username };

    if (action.isActionDepense()) {
      ActivityStream.api.add(notif, 'joinSpent', 'isAdmin');
    } else {
      ActivityStream.api.add(notif, 'joinAssign', 'isAdmin');
      ActivityStream.api.add(notif, 'joinAssign', 'isUser', memberId);
    }

    return retour;
  },
});

export const deleteAmendement = new ValidatedMethod({
  name: 'deleteAmendement',
  validate: new SimpleSchema({
    numAm: { type: String },
    idProposal: { type: String },
  }).validator(),
  run({ numAm, idProposal }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // TODO verifier si idProposal est une proposition existante et numAm l'amendement existe
    const query = {};
    query._id = new Mongo.ObjectID(idProposal);
    query[`amendements.${numAm}`] = { $exists: true };
    const amendement = Proposals.findOne(query);
    if (!amendement) {
      throw new Meteor.Error('not-authorized');
    }
    // ou admin ou creator
    const collection = nameToCollection(amendement.parentType);
    if (!collection.findOne({ _id: new Mongo.ObjectID(amendement.parentId) }).isAdmin()) {
      if (amendement.amendements[numAm].idUserAuthor !== this.userId) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = {};
    docRetour.numAm = numAm;
    docRetour.idProposal = idProposal;
    const retour = apiCommunecter.postPixel('dda/co', 'deleteamendement', docRetour);
    return retour;
  },
});

export const actionsType = new ValidatedMethod({
  name: 'actionsType',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['projects', 'organizations', 'events', 'citoyens'] },
    parentId: { type: String },
    type: { type: String, allowedValues: ['actions', 'proposals'] },
    id: { type: String },
    name: { type: String, allowedValues: ['status'] },
    value: { type: String, allowedValues: ['done', 'disabled', 'amendable', 'tovote', 'todo'] },
  }).validator(),
  run({ parentType, parentId, type, id, name, value }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(parentType);
    const collectionType = nameToCollection(type);
    const scopeOne = collection.findOne({ _id: new Mongo.ObjectID(parentId) });

    if (!collectionType.findOne({ _id: new Mongo.ObjectID(id) })) {
      throw new Meteor.Error('not-authorized');
    }

    if (parentType === 'citoyens') {
      if (!(scopeOne.isMe())) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (!(scopeOne.isAdmin() || collectionType.findOne({ _id: new Mongo.ObjectID(id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = {};
    docRetour.parentType = parentType;
    docRetour.parentId = parentId;
    docRetour.type = type;
    docRetour.id = id;
    docRetour.name = name;
    docRetour.value = value;
    const retour = apiCommunecter.postPixel('co2/element', 'updatefield', docRetour);

    if (type === 'actions' && value === 'done') {
      if (parentType !== 'citoyens') {
        countActionScope(parentType, parentId, 'done');
      // notifications : action terminé
      } else {
        // si done en citoyens alors terminer/valider auto
        const actionId = new Mongo.ObjectID(id);
        const parent = `finishedBy.${Meteor.userId()}`;
        Actions.update({ _id: actionId }, { $set: { [parent]: 'validated' } });

        // notification
        const actionOne = Actions.findOne({
          _id: new Mongo.ObjectID(id),
        });

        if (actionOne && actionOne.max === 1 && actionOne.min === 1 && !actionOne.endDate) {
          Actions.update({ _id: actionId }, { $set: { endDate: new Date() } });
        }
      }
    } else if (type === 'actions' && value === 'disabled') {
      if (parentType !== 'citoyens') {
        countActionScope(parentType, parentId, 'done');
        // notifications : action annulé
        // notifier les personnes qui devrait participer à l'action comme quoi elle est annulé
        // notif
        const actionOne = Actions.findOne({
          _id: new Mongo.ObjectID(id),
        });

        // au participant
        // au admin

        const notif = {};
        const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
        // author
        notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
        // object
        notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', links: actionOne.links, parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };

        ActivityStream.api.add(notif, 'actionDisabled', 'isActionMembers');
        ActivityStream.api.add(notif, 'actionDisabled', 'isAdmin');
      }
    }

    return retour;
  },
});


export const insertLogUserActions = new ValidatedMethod({
  name: 'insertLogUserActions',
  validate: new SimpleSchema({
    userId: { type: String },
    organizationId: { type: String },
    commentaire: { type: String },
    credits: { type: SimpleSchema.Integer },
  }).validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const query = {};
    query._id = new Mongo.ObjectID(doc.organizationId);
    const orgaOne = Organizations.findOne(query);

    let isAdminProject = false;
    const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
    if (orgaOne.links && orgaOne.links.projects && userC && userC.links && userC.links.projects) {
      // eslint-disable-next-line no-unused-vars
      const arrayIds = Object.keys(orgaOne.links.projects)
        .filter(k => userC.links.projects[k] && userC.links.projects[k].isAdmin && !userC.links.projects[k].toBeValidated && !userC.links.projects[k].isAdminPending && !userC.links.projects[k].isInviting)
        // eslint-disable-next-line array-callback-return
        .map(k => k);
      // console.log(arrayIds);
      isAdminProject = !!(arrayIds && arrayIds.length > 0);
    }

    if (!orgaOne) {
      throw new Meteor.Error('not-orga', 'not-orga');
    }
    if (!orgaOne.isAdmin()) {
      if (orgaOne && orgaOne.oceco && orgaOne.oceco.membersAdminProjectAdmin) {
        if (!isAdminProject) {
          throw new Meteor.Error('not-orga-admin', 'not-orga-admin');
        }
      } else {
        throw new Meteor.Error('not-orga-admin', 'not-orga-admin');
      }
    }

    const logInsert = {};
    logInsert.userId = doc.userId;
    logInsert.organizationId = doc.organizationId;
    logInsert.commentaire = doc.commentaire;
    logInsert.credits = doc.credits;
    logInsert.createdAt = moment().format();
    const retour = LogUserActions.insert(logInsert);

    const userNeed = new Mongo.ObjectID(doc.userId);
    const userCredits = `userWallet.${doc.organizationId}.userCredits`;
    Citoyens.update({ _id: userNeed }, { $inc: { [userCredits]: doc.credits } });

    // notification
    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: orgaOne._id._str, name: orgaOne.name, type: 'logusercredit', parentType: 'organizations', parentId: doc.organizationId, commentaire: doc.commentaire, credits: doc.credits };
    // mention
    const mentionOne = Citoyens.findOne({ _id: new Mongo.ObjectID(doc.userId) });
    notif.mention = { id: mentionOne._id._str, name: mentionOne.name, type: 'citoyens', username: mentionOne.username };

    ActivityStream.api.add(notif, 'logusercredit', 'isUser', doc.userId);

    return retour;
  },
});

export const validateUserActions = new ValidatedMethod({
  name: 'validateUserActions',
  validate: new SimpleSchema({
    userId: { type: String },
    actionId: { type: String },
    organizationId: { type: String },
    commentaire: { type: String },
    credits: { type: SimpleSchema.Integer, min: 1 },
  }).validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const action = Actions.findOne({ _id: new Mongo.ObjectID(doc.actionId) });

    if (!action) {
      throw new Meteor.Error('not-action');
    }
    const collection = nameToCollection(action.parentType);

    if (!collection.findOne({ _id: new Mongo.ObjectID(action.parentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const actionId = new Mongo.ObjectID(doc.actionId);
    const userNeed = new Mongo.ObjectID(doc.userId);
    const parent = `finishedBy.${doc.userId}`;
    let credit;
    if (doc.credits) {
      credit = doc.credits;
    } else {
      credit = Actions.findOne({ _id: actionId }) && Actions.findOne({ _id: actionId }).credits && !typeOfNaN(Actions.findOne({ _id: actionId }).credits) ? parseInt(Actions.findOne({ _id: actionId }).credits) : 0;
    }

    // const credit = parseInt(Actions.findOne({ _id: actionId }).credits);
    // const userActions = `userWallet.${doc.organizationId}.userActions.${doc.actionId}`;
    const userCredits = `userWallet.${doc.organizationId}.userCredits`;
    if (!Citoyens.findOne({ _id: userNeed, [userCredits]: { $exists: 1 } })) {
      Citoyens.update({ _id: userNeed }, { $set: { [userCredits]: 0 } });
    }
    Actions.update({ _id: actionId }, { $set: { [parent]: 'validated' } });

    // log user action credit
    const logInsert = {};
    logInsert.userId = doc.userId;
    logInsert.organizationId = doc.organizationId;
    logInsert.actionId = doc.actionId;
    if (doc.commentaire !== 'nocomment') {
      logInsert.commentaire = doc.commentaire;
    }
    if (credit) {
      logInsert.credits = credit;
      logInsert.createdAt = moment().format();
      LogUserActions.insert(logInsert);
    }

    // Citoyens.update({ _id: userNeed }, { $set: { [userActions]: credit } });

    //

    Citoyens.update({ _id: userNeed }, { $inc: { [userCredits]: credit } });

    // verifier si tout les users sont valider
    const actionOne = Actions.findOne({ _id: actionId });
    if (actionOne.finishedBy && actionOne.countContributors() === Object.keys(actionOne.finishedBy).map(id => id).length && arrayLinkToModerate(actionOne.finishedBy).length === 0) {
      Actions.update({ _id: actionId }, { $set: { status: 'done' } });
      countActionScope(actionOne.parentType, actionOne.parentId, 'done');
    }
    //

    // notification
    const notif = {};
    const authorOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1, email: 1, username: 1 } });
    // author
    notif.author = { id: authorOne._id._str, name: authorOne.name, type: 'citoyens', username: authorOne.username };
    // object
    notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
    // ActivityStream.api.add(notif, verb, 'isUser', '5e736fd6b6ebaf0d008b4579');
    ActivityStream.api.add(notif, 'validate', 'isUser', doc.userId);

    return true;
  },
});

export const dashboardType = new ValidatedMethod({
  name: 'dashboardType',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['projects', 'organizations', 'events', 'citoyens'] },
    parentId: { type: String },
  }).validator(),
  run({ parentType, parentId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(parentType);
    const scopeOne = collection.findOne({ _id: new Mongo.ObjectID(parentId) });

    if (!scopeOne) {
      throw new Meteor.Error('not-parent');
    }

    const statusObj = [
      { label: 'À faire', status: 'todo' },
      { label: 'Terminées', status: 'done' },
      { label: 'Désactivées', status: 'disabled' },
      { label: 'Assignées', status: 'contributors' },
      { label: 'En cours (à valider)', status: 'toValidated' },
      { label: 'Total', status: 'all' },
    ];
    const parentCounts = statusObj.map((obj) => {
      const count = {};
      count.status = obj.label;
      count.count = scopeOne.actionIndicatorCount(obj.status).count();
      return count;
    });

    return parentCounts;
  },
});

export const dashboardUserType = new ValidatedMethod({
  name: 'dashboardUserType',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['projects', 'organizations', 'events', 'citoyens'] },
    parentId: { type: String },
    userId: { type: String },
  }).validator(),
  run({ parentType, parentId, userId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(parentType);
    const scopeOne = collection.findOne({ _id: new Mongo.ObjectID(parentId) });

    if (!scopeOne) {
      throw new Meteor.Error('not-parent');
    }

    const statusObj = [
      { label: 'En cours', status: 'inProgress' },
      { label: 'A valider', status: 'toModerate' },
      { label: 'Valider', status: 'validated' },
      { label: 'Refuser', status: 'novalidated' },
      { label: 'Total', status: 'all' },
    ];
    const parentCounts = statusObj.map((obj) => {
      const count = {};
      count.status = obj.label;
      count.count = scopeOne.userActionIndicatorCount(obj.status, userId).count();
      return count;
    });

    return parentCounts;
  },
});

// Meteor.call('sendEmailScope', {parentType:'', parentId:'', subject:'', text:''})
export const sendEmailScope = new ValidatedMethod({
  name: 'sendEmailScope',
  validate: SchemasMessagesRest.validator(),
  run({ parentType, parentId, actionId, subject, text }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(parentType);
    const scopeOne = collection.findOne({ _id: new Mongo.ObjectID(parentId) });

    if (!scopeOne) {
      throw new Meteor.Error('not-parent');
    }

    const citoyenOne = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) });

    /* if (parentType === 'citoyens') {

      this.unblock();

      const msg = {};
      msg.to = scopeOne.email;
      msg.from = '';
      msg.subject = subject;
      msg.text = text;
      Email.send(msg);

    } else { */
    if (!scopeOne.isAdmin()) {
      throw new Meteor.Error('not-authorized isAdmin');
    }

    let citoyensList;
    let actionOne;
    if (actionId) {
      actionOne = Actions.findOne({ _id: new Mongo.ObjectID(actionId) });
    }

    if (parentType === 'organizations') {
      if (actionId) {
        citoyensList = actionOne.listContributors();
      } else {
        citoyensList = scopeOne.listMembers();
      }
    } else if (parentType === 'projects') {
      citoyensList = scopeOne.listContributors();
    } else if (parentType === 'events') {
      citoyensList = scopeOne.listAttendees();
    }

    
    // email history log
    const logEmailId = LogEmailOceco.insert({ parentType, parentId, actionId, subject, text, userId: this.userId });

    this.unblock();

    if (citoyensList.count() > 0) {
      const arrayIds = citoyensList.map(citoyen => citoyen._id);
      const citoyensListEmail = Citoyens.find({ _id: { $in: arrayIds } }, { fields: { email: 1, name: 1 } });
      citoyensListEmail.forEach((citoyen) => {
        // console.log(citoyen.email);
        if ((Meteor.isProduction && citoyen.email) || Meteor.isDevelopment) {
          let helpers;
          if (actionId && actionOne) {
            helpers = {
              message: text,
              name: citoyen.name,
              signature: citoyenOne.name,
              subject,
              scope: 'actions',
              scopeName: actionOne.name,
              scopeUrl: Meteor.absoluteUrl(`${actionOne.parentType}/rooms/${actionOne.parentId}/room/${actionOne.idParentRoom}/action/${actionOne._id._str}`),
              ocecoUrl: Meteor.absoluteUrl(),
            };
          } else {
            helpers = {
              message: text,
              name: citoyen.name,
              signature: citoyenOne.name,
              subject,
              scope: scopeOne.scopeVar(),
              scopeName: scopeOne.name,
              scopeUrl: Meteor.absoluteUrl(`${scopeOne.scopeVar()}/detail/${scopeOne._id._str}`),
              ocecoUrl: Meteor.absoluteUrl(),
            };
          }
          
          const options = {};
          if (actionId && actionOne) {
            options.subject = `${subject} - ${actionOne.name}`;
          } else {
            options.subject = `${subject} - ${scopeOne.name}`;
          }
          
          if (Meteor.isDevelopment) {
            options.from = Meteor.settings.mailSetting.dev.from;
            options.to = Meteor.settings.mailSetting.dev.to;
          } else {
            options.from = Meteor.settings.mailSetting.prod.from;
            options.to = citoyen.email;
          }

          Jobs.run('sendEmail', options, helpers, logEmailId._str);
          /* Meteor.defer(() => {
            try {
              email.send(options);
            } catch (e) {
              // console.error(`Problem sending email ${logEmailId} to ${options.to}`, e);
              throw log.error(`Problem sending email ${logEmailId._str} to ${options.to}`, e);
            }
          }); */
        }
      });
    }
    // }
    return true;
  },
});
