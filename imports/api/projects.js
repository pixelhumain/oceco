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
import { News } from './news.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Rooms } from './rooms.js';
import { Actions } from './actions.js';
import { ActivityStream } from './activitystream.js';
import { searchQuery, searchQuerySort, queryLink, queryLinkType, arrayLinkParent, arrayOrganizerParent, isAdminArray, queryLinkToBeValidated, queryOptions } from './helpers.js';

export const Projects = new Mongo.Collection('projects', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;
export const SchemasProjectsRest = new SimpleSchema(baseSchema, {
  tracker: Tracker,
});
SchemasProjectsRest.extend(geoSchema);
SchemasProjectsRest.extend({
  avancement: {
    type: String,
    optional: true,
  },
  startDate: {
    type: Date,
    optional: true,
  },
  endDate: {
    type: Date,
    optional: true,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
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
  parentType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  public: {
    type: Boolean,
    defaultValue: true,
  },
});

/* export const SchemasProjectsRest = new SimpleSchema([baseSchema, geoSchema, {
  avancement: {
    type: String,
    optional: true,
  },
  startDate: {
    type: Date,
    optional: true,
  },
  endDate: {
    type: Date,
    optional: true,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
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
  parentType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  public: {
    type: Boolean,
    defaultValue: true,
  },
}]); */

export const BlockProjectsRest = {};
// BlockProjectsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$)]');
BlockProjectsRest.descriptions = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.descriptions.extend(baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$'));

// BlockProjectsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick('name', 'url']), SchemasProjectsRest.pick(['avancement)]');
BlockProjectsRest.info = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.info.extend(baseSchema.pick('name', 'url'));
BlockProjectsRest.info.extend(SchemasProjectsRest.pick('avancement'));

/* BlockProjectsRest.network = new SimpleSchema([blockBaseSchema, {
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
BlockProjectsRest.network = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.network.extend({
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

// BlockProjectsRest.when = new SimpleSchema([blockBaseSchema, SchemasProjectsRest.pick('startDate', 'endDate)]');
BlockProjectsRest.when = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.when.extend(SchemasProjectsRest.pick('startDate', 'endDate'));

// BlockProjectsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockProjectsRest.locality = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.locality.extend(geoSchema);

/* BlockProjectsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]); */
BlockProjectsRest.preferences = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockProjectsRest.preferences.extend({
  preferences: {
    type: preferences,
    optional: true,
  },
});

if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Citoyens = Citoyens;
}

Projects.helpers({
  // eslint-disable-next-line no-unused-vars
  isVisibleFields (field) {
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
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  organizerProject () {
    if (this.parent) {
      const childrenParent = arrayOrganizerParent(this.parent, ['citoyens', 'organizations', 'projects']);
      if (childrenParent) {
        return childrenParent;
      }
    }
    return undefined;
  },
  rolesLinks (scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  roles (scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('projects', this._id._str);
  },
  isScopeMe () {
    return this.isContributors();
  },
  isScope (scope, scopeId) {
    return !!((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].type && this.isIsInviting(scope, scopeId)));
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
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) });
    const organizerProject = this.organizerProject();

    if (bothUserId && this.parent) {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isAdmin && this.isToBeValidated(bothUserId) && this.isAdminPending(bothUserId) && this.isIsInviting('contributors', bothUserId)))) {
        return true;
      }
      if (this.parent[bothUserId] && this.parent[bothUserId].type === 'citoyens') {
        return true;
      }
      return isAdminArray(organizerProject, citoyen);
    }
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isAdmin && this.isToBeValidated(bothUserId) && this.isAdminPending(bothUserId) && this.isIsInviting('contributors', bothUserId)));
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  isAdminPending(userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isAdminPending));
  },
  toBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  toBeisInviting (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isInviting));
  },
  listMembersToBeValidated () {
    if (this.links && this.links.contributors) {
      const query = queryLinkToBeValidated(this.links.contributors);
      if (Citoyens.find(query, queryOptions).count() > 0) {
        return Citoyens.find(query, queryOptions);
      }
    }
    return false;
  },
  scopeVar () {
    return 'projects';
  },
  scopeEdit () {
    return 'projectsEdit';
  },
  listScope () {
    return 'listProjects';
  },
  isFollows (followId) {
    return !!((this.links && this.links.follows && this.links.follows[followId]));
  },
  isFollowsMe () {
    return !!((this.links && this.links.follows && this.links.follows[Meteor.userId()]));
  },
  listFollows (search) {
    if (this.links && this.links.follows) {
      const query = queryLink(this.links.follows, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countFollows (search) {
    // return this.links && this.links.follows && _.size(this.links.follows);
    return this.listFollows(search) && this.listFollows(search).count();
  },
  isFollowers (followId) {
    return !!((this.links && this.links.followers && this.links.followers[followId]));
  },
  isFollowersMe () {
    return !!((this.links && this.links.followers && this.links.followers[Meteor.userId()]));
  },
  listFollowers (search) {
    if (this.links && this.links.followers) {
      const query = queryLink(this.links.followers, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countFollowers (search) {
    // return this.links && this.links.followers && _.size(this.links.followers);
    return this.listFollowers(search) && this.listFollowers(search).count();
  },
  isContributors (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.isToBeValidated(bothUserId) && this.isIsInviting('contributors', bothUserId)));
  },
  listContributors (search) {
    if (this.links && this.links.contributors) {
      const query = queryLink(this.links.contributors, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  listContributorsActions(actionId, search) {
    if (this.links && this.links.contributors) {
      const actionOne = Actions.findOne({ _id: new Mongo.ObjectID(actionId) });
      const query = queryLinkType(this.links.contributors, search, 'citoyens');
      const options = {};
      options.transform = (item) => {
        item.assign = actionOne && actionOne.isContributors(item._id._str) ? 1 : 0;
        return item;
      };
      options.sort = {};
      options.sort.assign = -1;
      options.sort.name = 1;
      options.fields = {};
      options.fields[`links.projects.${this._id._str}`] = 1;
      options.fields.name = 1;
      options.fields.assign = 1;
      options.fields.profilThumbImageUrl = 1;
      return Citoyens.find(query, options);
    }
    return false;
  },
  isStart () {
    const start = moment(this.startDate).toDate();
    const now = moment().toDate();
    return moment(start).isBefore(now); // True
  },
  countContributors (search) {
    // return this.links && this.links.contributors && _.size(this.links.contributors);
    return this.listContributors(search) && this.listContributors(search).count();
  },
  listEvents (search) {
    if (this.links && this.links.events) {
      const query = queryLink(this.links.events, search);
      return Events.find(query, queryOptions);
    }
    return false;
  },
  countEvents (search) {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEvents(search) && this.listEvents(search).count();
  },
  listEventsCreator () {
    if (this.links && this.links.events) {
      const eventIds = arrayLinkParent(this.links.events, 'events');
      const query = {};
      query._id = {
        $in: eventIds,
      };
      const inputDate = new Date();
      // query.startDate = { $lte: inputDate };
      query.endDate = {
        $gte: inputDate,
      };
      const options = {};
      options.sort = {
        startDate: 1,
      };
      return Events.find(query, options);
    }
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
  },
  listProjectsCreator() {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParent(this.links.projects, 'projects');
      const query = {};
      query._id = {
        $in: projectIds,
      };
      return Projects.find(query, queryOptions);
    }
  },
  countProjectsCreator() {
    return this.listProjectsCreator() && this.listProjectsCreator().count();
  },
  projectsParent() {
    if (this.parent) {
      const childrenParent = arrayOrganizerParent(this.parent, ['projects']);
      if (childrenParent) {
        return childrenParent;
      }
    }
  },
  listRooms (search) {
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {
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
    }
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
    return Rooms.findOne({ _id: new Mongo.ObjectID(Router.current().params.roomId) });
  },
  listActionsCreator(type = 'all', status = 'todo', search, searchSort) {
    const query = {};
    const inputDate = new Date();

    /* {
      "$or": [
        {
          "$and": [
            { "endDate": { "$exists": true, "$gte": "2020-07-20T07:41:09.093Z" } },
            { "parentId": { "$in": ["5bd2bcfb40bb4e4509f7eabe"] } },
            { "status": "todo" },
            {
              "$or": [
                { "credits": { "$gt": 0 } }, { "options.creditAddPorteur": { "$exists": true } }
              ]
            }]
        },
        {
          "$and": [
            { "endDate": { "$exists": false } },
            { "parentId": { "$in": ["5bd2bcfb40bb4e4509f7eabe"] } },
            { "status": "todo" },
            {
              "$or": [
                { "credits": { "$gt": 0 } }, { "options.creditAddPorteur": { "$exists": true } }
              ]
            }]
        }
      ]
    } */

    let queryone = {};
    queryone.endDate = { $exists: true, $gte: inputDate };
    queryone.parentId = { $in: [this._id._str] };
    queryone.status = status;
    if (Meteor.isClient) {
      if (search) {
        queryone = searchQuery(queryone, search);
      }
    }

    let querytwo = {};
    querytwo.endDate = { $exists: false };
    querytwo.parentId = { $in: [this._id._str] };
    querytwo.status = status;

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

    return Actions.find(query, options);
  },
  countActionsCreator(type = 'all', status = 'todo', search) {
    return this.listActionsCreator(type, status, search) && this.listActionsCreator(type, status, search).count();
  },
  listNotifications (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseen(bothUserId, this._id._str, 'projects');
  },
  countListNotifications(userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return this.listNotifications(bothUserId).count();
  },
  listNotificationsAsk (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseenAsk(bothUserId, this._id._str, 'projects');
  },
  countPopMap () {
    return this.links && this.links.contributors && _.size(this.links.contributors);
  },
  actionIndicatorCount(status) {
    const query = {};
    query.parentId = this._id._str;
    query.parentType = 'projects';
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
    query.parentType = 'projects';

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
    } else if (typeof limit !== 'undefined') {
      options.limit = limit;
    }
    const scopeTypeArray = ['public', 'restricted'];
    if (this.isContributors(bothUserId)) {
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
    return News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});
