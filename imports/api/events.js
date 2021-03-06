/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { Tracker } from 'meteor/tracker';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferences } from './schema.js';

// collection
import { Lists } from './lists.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
import { Rooms } from './rooms.js';
import { Actions } from './actions.js';
// SimpleSchema.debug = true;

import { News } from './news.js';
import { Documents } from './documents.js';
import { ActivityStream } from './activitystream.js';
import { searchQuery, searchQuerySort, queryLink, arrayLinkParent, arrayOrganizerParent, isAdminArray, queryLinkIsInviting, queryLinkAttendees, arrayLinkAttendees, queryOptions } from './helpers.js';

export const Events = new Mongo.Collection('events', { idGeneration: 'MONGO' });


export const SchemasEventsRest = new SimpleSchema(baseSchema, {
  tracker: Tracker,
});
SchemasEventsRest.extend(geoSchema);
SchemasEventsRest.extend({
  type: {
    type: String,
    autoform: {
      type: 'select',
      options() {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({
            name: 'eventTypes',
          });
          if (listSelect && listSelect.list) {
            return _.map(listSelect.list, function (value, key) {
              return {
                label: value,
                value: key,
              };
            });
          }
        }
        return undefined;
      },
    },
  },
  allDay: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  email: {
    type: String,
    optional: true,
  },
  fixe: {
    type: String,
    optional: true,
  },
  mobile: {
    type: String,
    optional: true,
  },
  fax: {
    type: String,
    optional: true,
  },
  organizerId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  organizerType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    optional: true,
    autoform: {
      type: 'select',
    },
  },
});

/* export const SchemasEventsRest = new SimpleSchema([baseSchema, geoSchema, {
  type: {
    type: String,
    autoform: {
      type: 'select',
      options () {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({ name: 'eventTypes' });
          if (listSelect && listSelect.list) {
            return _.map(listSelect.list, function (value, key) {
              return { label: value, value: key };
            });
          }
        }
        return undefined;
      },
    },
  },
  allDay: {
    type: Boolean,
    defaultValue: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  email: {
    type: String,
    optional: true,
  },
  fixe: {
    type: String,
    optional: true,
  },
  mobile: {
    type: String,
    optional: true,
  },
  fax: {
    type: String,
    optional: true,
  },
  organizerId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  organizerType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    optional: true,
    autoform: {
      type: 'select',
    },
  },
}]); */

export const BlockEventsRest = {};

// BlockEventsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$)]');
BlockEventsRest.descriptions = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.descriptions.extend(baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$'));

// BlockEventsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick('name', 'url']), SchemasEventsRest.pick(['type)]');
BlockEventsRest.info = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.info.extend(baseSchema.pick('name', 'url'));
BlockEventsRest.info.extend(SchemasEventsRest.pick('type'));

BlockEventsRest.network = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.network.extend({
  github: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  instagram: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  skype: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  gpplus: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  twitter: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  facebook: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
});

/* BlockEventsRest.network = new SimpleSchema([blockBaseSchema, {
  github: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  instagram: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  skype: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  gpplus: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  twitter: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  facebook: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
}]); */

// BlockEventsRest.when = new SimpleSchema([blockBaseSchema, SchemasEventsRest.pick('allDay', 'startDate', 'endDate)]');
BlockEventsRest.when = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.when.extend(SchemasEventsRest.pick('startDate', 'endDate'));

// BlockEventsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockEventsRest.locality = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.locality.extend(geoSchema);

/* BlockEventsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]); */
BlockEventsRest.preferences = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockEventsRest.preferences.extend({
  preferences: {
    type: preferences,
    optional: true,
  },
});

// if(Meteor.isClient){
// collection

if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Projects = Projects;
  window.Citoyens = Citoyens;
}


if (Meteor.isClient) {
  import { Chronos } from './client/chronos.js';

  Events.helpers({

    isStartDate() {
      if (this.startDate) {
        const start = moment(this.startDate).toDate();
        return Chronos.moment(start).isBefore(); // True
      }
      return false;
    },
    isNotStartDate() {
      if (this.startDate) {
        const start = moment(this.startDate).toDate();
        return Chronos.moment().isBefore(start); // True
      }
      return false;
    },
    isEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return Chronos.moment(end).isBefore(); // True
      }
      return false;
    },
    isNotEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return Chronos.moment().isBefore(end); // True
      }
      return false;
    },
    timeSpentStart() {
      if (this.startDate) {
        return Chronos.moment(this.startDate).fromNow();
      }
      return false;
    },
    timeSpentEnd() {
      if (this.endDate) {
        return Chronos.moment(this.endDate).fromNow();
      }
      return false;
    },
  });
} else {
  Events.helpers({
    isEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return moment(end).isBefore(); // True
      }
      return false;
    },
    isNotEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return moment().isBefore(end); // True
      }
      return false;
    },
  });
}

Events.helpers({
  isVisibleFields () {
    /* if(this.isMe()){
        return true;
      }else{
        if(this.isPublicFields(field)){
          return true;
        }else{
          if(this.isFollowersMe() && this.isPrivateFields(field)){
            return true;
          }else{
            return false;
          }
        }
      } */
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  rolesLinks(scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  roles(scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  organizerEvent () {
    if (this.organizer) {
      const childrenParent = arrayOrganizerParent(this.organizer, ['events', 'projects', 'organizations', 'citoyens']);
      if (childrenParent) {
        return childrenParent;
      }
    }
    return undefined;
  },
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('events', this._id._str);
  },
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();

    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) });
    const organizerEvent = this.organizerEvent();

    if (bothUserId && this.parent) {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!((this.links && this.links.attendees && this.links.attendees[bothUserId] && this.links.attendees[bothUserId].isAdmin && this.isIsInviting('attendees', bothUserId)))) {
        return true;
      }
      if (this.parent[bothUserId] && this.parent[bothUserId].type === 'citoyens') {
        return true;
      }
    }

    if (bothUserId && this.organizer && isAdminArray(organizerEvent, citoyen)) {
      return true;
    }

    return !!((this.links && this.links.attendees && this.links.attendees[bothUserId] && this.links.attendees[bothUserId].isAdmin && this.isIsInviting('attendees', bothUserId)));
  },
  isScope (scope, scopeId) {
    return !!((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].type && this.isIsInviting(scope, scopeId)));
  },
  isScopeMe() {
    return this.isAdmin();
  },
  isIsInviting (scope, scopeId) {
    return !((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  isInviting (scope, scopeId) {
    return !!((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  InvitingUser (scope, scopeId) {
    return this.links && this.links[scope] && this.links[scope][scopeId];
  },
  listAttendeesIsInviting (search) {
    if (this.links && this.links.attendees) {
      const query = queryLinkIsInviting(this.links.attendees, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countAttendeesIsInviting (search) {
    return this.listAttendeesIsInviting(search) && this.listAttendeesIsInviting(search).count();
  },
  listAttendeesValidate (search) {
    if (this.links && this.links.attendees) {
      const query = queryLinkAttendees(this.links.attendees, search, 'citoyens');
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countAttendeesValidate (search) {
    return this.listAttendeesValidate(search) && this.listAttendeesValidate(search).count();
  },
  listAttendeesOrgaValidate (search) {
    if (this.links && this.links.attendees) {
      const query = queryLinkAttendees(this.links.attendees, search, 'organizations');
      return Organizations.find(query, queryOptions);
    }
    return false;
  },
  countAttendeesOrgaValidate (search) {
    return this.listAttendeesOrgaValidate(search) && this.listAttendeesOrgaValidate(search).count();
  },
  toBeisInviting (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.attendees && this.links.attendees[bothUserId] && this.links.attendees[bothUserId].isInviting));
  },
  scopeVar () {
    return 'events';
  },
  scopeEdit () {
    return 'eventsEdit';
  },
  listScope () {
    return 'listEvents';
  },
  isAttendees (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    // return !!((this.links && this.links.attendees && this.links.attendees[bothUserId]));
    return !!((this.links && this.links.attendees && this.links.attendees[bothUserId] && this.isIsInviting('attendees', bothUserId)));
  },
  listAttendees (search) {
    if (this.links && this.links.attendees) {
      const query = queryLink(this.links.attendees, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countAttendees (search) {
    return this.listAttendees(search) && this.listAttendees(search).count();
  },
  countAttendeesSimple () {
    return this.links && this.links.attendees && arrayLinkAttendees(this.links.attendees, 'citoyens').length + arrayLinkAttendees(this.links.attendees, 'organizations').length;
  },
  listNotifications (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseen(bothUserId, this._id._str, 'events');
  },
  countListNotifications(userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return this.listNotifications(bothUserId).count();
  },
  listNotificationsAsk (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseenAsk(bothUserId, this._id._str, 'events');
  },
  countPopMap () {
    return this.links && this.links.attendees && _.size(this.links.attendees);
  },
  isStart () {
    const start = moment(this.startDate).toDate();
    return moment(start).isBefore(); // True
  },
  formatStartDate() {
    return moment(this.startDate).format('DD/MM/YYYY HH:mm');
  },
  formatEndDate() {
    return moment(this.endDate).format('DD/MM/YYYY HH:mm');
  },
  typeValue () {
    const eventTypes = Lists.findOne({ name: 'eventTypes' });
    return this.type && eventTypes && eventTypes.list && eventTypes.list[this.type];
  },
  listEventTypes () {
    return Lists.find({ name: 'eventTypes' });
  },
  listEventsCreator () {
    if (this.links && this.links.subEvents) {
      const eventsIds = arrayLinkParent(this.links.subEvents, 'events');
      const query = {};
      query._id = {
        $in: eventsIds,
      };
      query.status = { $exists: false };
      queryOptions.fields.startDate = 1;
      queryOptions.fields.startDate = 1;
      queryOptions.fields.geo = 1;
      return Events.find(query, queryOptions);
    }
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
  },
  eventsParent () {
    if (this.parent) {
      const childrenParent = arrayOrganizerParent(this.parent, ['events']);
      if (childrenParent) {
        return childrenParent;
      }
    }
  },
  listRooms (search) {
    // if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {
    const query = {};

    if (this.isAdmin()) {
      if (Meteor.isClient && search) {
        query.parentId = this._id._str;
        query.name = { $regex: search, $options: 'i' };
        query.status = 'open';
      } else {
        query.parentId = this._id._str;
        query.status = 'open';
      }
    } else {
      query.$or = [];
      const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str) ? Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str).split(',') : null;
      if (roles) {
        if (Meteor.isClient && search) {
          query.$or.push({ parentId: this._id._str, name: { $regex: search, $options: 'i' }, status: 'open', roles: { $exists: true, $in: roles } });
        } else {
          query.$or.push({ parentId: this._id._str, status: 'open', roles: { $exists: true, $in: roles } });
        }
      }
      if (Meteor.isClient && search) {
        query.$or.push({ parentId: this._id._str, name: { $regex: search, $options: 'i' }, status: 'open', roles: { $exists: false } });
      } else {
        query.$or.push({ parentId: this._id._str, status: 'open', roles: { $exists: false } });
      }
    }

    queryOptions.fields.parentId = 1;
    queryOptions.fields.parentType = 1;
    queryOptions.fields.status = 1;
    queryOptions.fields.roles = 1;
    return Rooms.find(query, queryOptions);
    // }
  },
  detailRooms (roomId) {
    // if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {
    const query = {};
    if (this.isAdmin()) {
      query._id = new Mongo.ObjectID(roomId);
      query.status = 'open';
    } else {
      query.$or = [];
      const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str) ? Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str).split(',') : null;
      if (roles) {
        query.$or.push({ _id: new Mongo.ObjectID(roomId), status: 'open', roles: { $exists: true, $in: roles } });
      }
      query.$or.push({ _id: new Mongo.ObjectID(roomId), status: 'open', roles: { $exists: false } });
    }
    return Rooms.find(query);
    // }
  },
  countRooms (search) {
    return this.listRooms(search) && this.listRooms(search).count();
  },
  room () {
    return Rooms.findOne({ parentId: this._id._str });
  },
  listActionsCreator(type = 'all', status = 'todo', search, searchSort) {
    const query = {};
    const inputDate = new Date();

    let queryone = {};
    // si admin
    if (!this.isAdmin()) {
      queryone.endDate = { $exists: true, $gte: inputDate };
      queryone.status = status;
    }
    queryone.parentId = { $in: [this._id._str] };

    if (Meteor.isClient) {
      if (search) {
        queryone = searchQuery(queryone, search);
      }
    }

    let querytwo = {};
    if (!this.isAdmin()) {
      querytwo.status = status;
    }
    querytwo.endDate = { $exists: false };
    querytwo.parentId = { $in: [this._id._str] };

    if (Meteor.isClient) {
      if (search) {
        querytwo = searchQuery(querytwo, search);
      }
    }

    if (type === 'aFaire') {
      queryone.$or = [
        { credits: { $gt: 0 } }, { 'options.creditAddPorteur': { $exists: true } },
      ];
      querytwo.$or = [
        { credits: { $gt: 0 } }, { 'options.creditAddPorteur': { $exists: true } },
      ];
      // queryone.credits = { $gt: 0 };
      // querytwo.credits = { $gt: 0 };
    } else if (type === 'depenses') {
      queryone.credits = { $lt: 0 };
      querytwo.credits = { $lt: 0 };
    }

    const queryoneAnd = {};
    queryoneAnd.$and = [];
    Object.keys(queryone).forEach((key) => {
      queryoneAnd.$and.push({ [key]: queryone[key] });
    });

    const querytwoAnd = {};
    querytwoAnd.$and = [];
    Object.keys(querytwo).forEach((key) => {
      querytwoAnd.$and.push({ [key]: querytwo[key] });
    });

    query.$or = [];
    query.$or.push(queryoneAnd);
    query.$or.push(querytwoAnd);

    const options = {};
    if (Meteor.isClient) {
      if (searchSort) {
        const arraySort = searchQuerySort('actions', searchSort);
        if (arraySort) {
          options.sort = arraySort;
        }
      }
    } else {
      options.sort = {
        startDate: 1,
      };
    }
    // console.log(query);
    return Actions.find(query, options);
  },
  countActionsCreator(type = 'all', status = 'todo', search) {
    return this.listActionsCreator(type, status, search) && this.listActionsCreator(type, status, search).count();
  },
  actionIndicatorCount(status) {
    const query = {};
    query.parentId = this._id._str;
    query.parentType = 'events';
    if (status !== 'all' && status !== 'contributors' && status !== 'finished' && status !== 'toValidated') {
      query.status = status;
    }
    if (status === 'contributors') {
      query['links.contributors'] = { $exists: true };
    }
    if (status === 'finished') {
      query.finishedBy = { $exists: true };
    }
    if (status === 'toValidated') {
      query.status = 'todo';
      query.finishedBy = { $exists: true };
    }
    return Actions.find(query);
  },
  userActionIndicatorCount(status, userId) {
    const query = {};
    query.parentId = this._id._str;
    query.parentType = 'events';

    // inProgress , validated , novalidated , toModerate

    // en cours
    if (status === 'inProgress') {
      query.status = 'todo';
      query[`links.contributors.${userId}`] = { $exists: true };
      query[`finishedBy.${userId}`] = { $exists: false };
    }

    // a valider
    if (status === 'toModerate') {
      query.status = 'todo';
      query[`links.contributors.${userId}`] = { $exists: true };
      query[`finishedBy.${userId}`] = 'toModerate';
    }

    // valider
    if (status === 'validated') {
      query[`links.contributors.${userId}`] = { $exists: true };
      query[`finishedBy.${userId}`] = 'validated';
    }

    // no valider
    if (status === 'novalidated') {
      query[`links.contributors.${userId}`] = { $exists: true };
      query[`finishedBy.${userId}`] = 'novalidated';
    }

    // all
    if (status === 'all') {
      const queryInProgress = {};
      queryInProgress.status = 'todo';
      queryInProgress[`links.contributors.${userId}`] = { $exists: true };
      queryInProgress[`finishedBy.${userId}`] = { $exists: false };

      const queryToModerate = {};
      queryToModerate.status = 'todo';
      queryToModerate[`links.contributors.${userId}`] = { $exists: true };
      queryToModerate[`finishedBy.${userId}`] = 'toModerate';

      const queryValidated = {};
      queryValidated[`links.contributors.${userId}`] = { $exists: true };
      queryValidated[`finishedBy.${userId}`] = 'validated';

      const queryNovalidated = {};
      queryNovalidated[`links.contributors.${userId}`] = { $exists: true };
      queryNovalidated[`finishedBy.${userId}`] = 'novalidated';

      query.$or = [];
      query.$or.push(queryInProgress);
      query.$or.push(queryToModerate);
      query.$or.push(queryValidated);
      query.$or.push(queryNovalidated);
    }
    return Actions.find(query);
  },
  newsJournal (target, userId, limit) {
    const query = {};
    const options = {};
    options.sort = { created: -1 };
    query.$or = [];
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const targetId = (typeof target !== 'undefined') ? target : Router.current().params._id;
    if (Meteor.isClient) {
      // const bothLimit = Session.get('limit');
      // options.limit = bothLimit;
    } else if (typeof limit !== 'undefined') {
      options.limit = limit;
    }
    const scopeTypeArray = ['public', 'restricted'];
    if (this.isAdmin(bothUserId)) {
      scopeTypeArray.push('private');
    }
    query.$or.push({ 'target.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    query.$or.push({ 'mentions.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    if (bothUserId) {
      // query['$or'].push({'author':bothUserId});
    }
    return News.find(query, options);
  },
  new () {
    return Router.current().params.newsId && News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});

// }
