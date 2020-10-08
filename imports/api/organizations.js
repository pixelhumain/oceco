/* eslint-disable meteor/no-session */
/* eslint-disable consistent-return */
/* global Session */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { Router } from 'meteor/iron:router';
import { Tracker } from 'meteor/tracker';
import { moment } from 'meteor/momentjs:moment';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferences, SchemasOceco } from './schema.js';

// collection
import { Lists } from './lists.js';
import { News } from './news.js';
import { Citoyens } from './citoyens.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Projects } from './projects.js';
import { Rooms } from './rooms.js';
import { Actions } from './actions.js';
import { ActivityStream } from './activitystream.js';
import { searchQuery, searchQuerySort, queryLink, queryLinkType, queryLinkIsAdmin, arrayLinkParent, arrayLinkParentNoObject, queryLinkToBeValidated, queryOptions, applyDiacritics } from './helpers.js';

export const Organizations = new Mongo.Collection('organizations', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

export const SchemasOrganizationsOcecoRest = new SimpleSchema(SchemasOceco, {
  tracker: Tracker,
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});

export const SchemasOrganizationsRest = new SimpleSchema(baseSchema, {
  tracker: Tracker,
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});
SchemasOrganizationsRest.extend(geoSchema);
SchemasOrganizationsRest.extend({
  type: {
    type: String,
    autoform: {
      type: 'select',
      options() {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({
            name: 'organisationTypes',
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
  role: {
    type: String,
    min: 1,
    denyUpdate: true,
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
});

/* export const SchemasOrganizationsRest = new SimpleSchema([baseSchema, geoSchema, {
  type: {
    type: String,
    autoform: {
      type: 'select',
      options () {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({ name: 'organisationTypes' });
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
  role: {
    type: String,
    min: 1,
    denyUpdate: true,
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
}]); */

export const BlockOrganizationsRest = {};
// BlockOrganizationsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$)]');
BlockOrganizationsRest.descriptions = new SimpleSchema(blockBaseSchema);
BlockOrganizationsRest.descriptions.extend(baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$'));

// BlockOrganizationsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick('name', 'url']), SchemasOrganizationsRest.pick(['type', 'email', 'fixe', 'mobile', 'fax)]');
BlockOrganizationsRest.info = new SimpleSchema(blockBaseSchema);
BlockOrganizationsRest.info.extend(baseSchema.pick('name', 'url'));
BlockOrganizationsRest.info.extend(SchemasOrganizationsRest.pick('type', 'email', 'fixe', 'mobile', 'fax'));

/* BlockOrganizationsRest.network = new SimpleSchema([blockBaseSchema, {
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
BlockOrganizationsRest.network = new SimpleSchema(blockBaseSchema);
BlockOrganizationsRest.network.extend({
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

// BlockOrganizationsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockOrganizationsRest.locality = new SimpleSchema(blockBaseSchema);
BlockOrganizationsRest.locality.extend(geoSchema);

/* BlockOrganizationsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]); */
BlockOrganizationsRest.preferences = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});
BlockOrganizationsRest.preferences.extend({
  preferences: {
    type: preferences,
    optional: true,
  },
});


Organizations.helpers({
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
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  rolesLinks (scope, scopeId) {
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
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('organizations', this._id._str);
  },
  isScopeMe () {
    return this.isMembers();
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
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isAdmin && this.isToBeValidated(bothUserId) && this.isAdminPending(bothUserId) && this.isIsInviting('members', bothUserId)));
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated));
  },
  isAdminPending (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isAdminPending));
  },
  toBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated));
  },
  toBeisInviting (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isInviting));
  },
  listMembersToBeValidated () {
    if (this.links && this.links.members) {
      const query = queryLinkToBeValidated(this.links.members);
      // console.log(query);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  scopeVar () {
    return 'organizations';
  },
  scopeEdit () {
    return 'organizationsEdit';
  },
  listScope () {
    return 'listOrganizations';
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
  isMembers (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.isToBeValidated(bothUserId) && this.isIsInviting('members', bothUserId)));
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
  listProjects (search) {
    if (this.links && this.links.projects) {
      const query = queryLink(this.links.projects, search);
      return Projects.find(query, queryOptions);
    }
    return false;
  },
  countProjects (search) {
    // return this.links && this.links.projects && _.size(this.links.projects);
    return this.listProjects(search) && this.listProjects(search).count();
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
    // eslint-disable-next-line no-empty
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {

    }
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
    // console.log(query);
    return Rooms.find(query);
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
  listMembers (search) {
    if (this.links && this.links.members) {
      const query = queryLinkType(this.links.members, search, 'citoyens');
      const options = {};
      options.sort = {};
      options.sort.name = 1;
      options.fields = {};
      options.fields[`links.memberOf.${this._id._str}`] = 1;
      options.fields.name = 1;
      options.fields[`userWallet.${this._id._str}.userCredits`] = 1;
      options.fields.profilThumbImageUrl = 1;
      return Citoyens.find(query, options);
    }
    return false;
  },
  listMembersActions(actionId, search) {
    if (this.links && this.links.members) {
      const actionOne = Actions.findOne({ _id: new Mongo.ObjectID(actionId) });
      const query = queryLinkType(this.links.members, search, 'citoyens');
      const options = {};
      options.transform = (item) => {
        item.assign = actionOne && actionOne.isContributors(item._id._str) ? 1 : 0;
        return item;
      };
      options.sort = {};
      options.sort.assign = -1;
      options.sort.name = 1;
      options.fields = {};
      options.fields[`links.memberOf.${this._id._str}`] = 1;
      options.fields.name = 1;
      options.fields.assign = 1;
      options.fields.profilThumbImageUrl = 1;
      return Citoyens.find(query, options);
    }
    return false;
  },
  countMembers (search) {
    /* if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'citoyens');
      return members && _.size(members);
      } */
    return this.listMembers(search) && this.listMembers(search).count();
  },
  listMembersOrganizations (search, selectorga) {
    if (this.links && this.links.members) {
      const query = queryLinkType(this.links.members, search, 'organizations', selectorga);
      return Organizations.find(query, queryOptions);
    }
    return false;
  },
  countMembersOrganizations (search, selectorga) {
    /* if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'organizations');
      return members && _.size(members);} */
    return this.listMembersOrganizations(search, selectorga) && this.listMembersOrganizations(search, selectorga).count();
  },
  listProjectsCreatorAdmin(search) {
    if (this.links && this.links.projects) {
      const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
      const query = queryLinkIsAdmin(userC.links.projects, this.links.projects, search);
      return Projects.find(query, queryOptions);
    }
  },
  countProjectsCreatorAdmin(search) {
    return this.listProjectsCreatorAdmin(search) && this.listProjectsCreatorAdmin(search).count();
  },
  listProjectsCreator(search) {
    if (this.links && this.links.projects) {
      /* const projectIds = arrayLinkParent(this.links.projects, 'projects');
      const query = {};
      query._id = {
        $in: projectIds,
      }; */
      const query = queryLink(this.links.projects, search);
      queryOptions.fields.modified = 1;
      return Projects.find(query, queryOptions);
    }
  },
  countProjectsCreator(search) {
    return this.listProjectsCreator(search) && this.listProjectsCreator(search).count();
  },
  listEventsCreator () {
    if (this.links && this.links.events) {
      const eventsIds = arrayLinkParent(this.links.events, 'events');
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
  listProjectsEventsCreator(querySearch, inputDate) {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParentNoObject(this.links.projects, 'projects');
      const query = querySearch || {};
      query.$or = [];
      projectIds.forEach((id) => {
        const queryCo = {};
        queryCo[`organizer.${id}`] = { $exists: true };
        query.$or.push(queryCo);
      });
      // queryOptions.fields.parentId = 1;

      // eslint-disable-next-line no-param-reassign
      inputDate = inputDate || new Date();
      // query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
      query.status = { $exists: false };
      const options = {};
      options.sort = {
        startDate: 1,
      };
      return Events.find(query, options);
    }
  },
  listProjectsEventsCreatorAdmin(querySearch) {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParentNoObject(this.links.projects, 'projects');
      const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
      const query = querySearch || {};
      query.$or = [];
      projectIds.forEach((id) => {
        const queryCo = {};
        if (userC && userC.links && userC.links.projects && userC.links.projects[id] && userC.links.projects[id].isAdmin && !userC.links.projects[id].toBeValidated && !userC.links.projects[id].isAdminPending && !userC.links.projects[id].isInviting) {
          queryCo[`organizer.${id}`] = { $exists: true };
          query.$or.push(queryCo);
        }
      });
      if (query.$or.length === 0) {
        delete query.$or;
      }
      // queryOptions.fields.parentId = 1;
      const inputDate = new Date();
      // query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
      const options = {};
      options.sort = {
        startDate: 1,
      };
      return Events.find(query, options);
    }
  },
  countProjectsEventsCreatorAdmin() {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listProjectsEventsCreatorAdmin() && this.listProjectsEventsCreatorAdmin().count();
  },


  /*
  WARNING j'ai du créer listProjectsEventsCreator1M pour rajouter un delai de visibiliter 15 jours
  des actions lier au evenement pour pouvoir valider apres la fin
  */
  listProjectsEventsCreator1M(querySearch) {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParentNoObject(this.links.projects, 'projects');
      // const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
      const query = querySearch || {};
      query.$or = [];

      projectIds.forEach((id) => {
        const queryCo = {};
        // if (userC && userC.links && userC.links.projects && userC.links.projects[id] && userC.links.projects[id].isAdmin && !userC.links.projects[id].toBeValidated && !userC.links.projects[id].isAdminPending && !userC.links.projects[id].isInviting) {
        queryCo[`organizer.${id}`] = { $exists: true };
        query.$or.push(queryCo);
        // }
      });
      if (query.$or.length === 0) {
        delete query.$or;
      }

      // queryOptions.fields.parentId = 1;
      // const inputDate = new Date();
      const inputDate = moment(new Date()).subtract(15, 'day').toDate();
      // query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };

      const options = {};
      options.sort = {
        startDate: -1,
      };
      // console.log(query);
      return Events.find(query, options);
    }
  },
  countProjectsEventsCreator() {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listProjectsEventsCreator() && this.listProjectsEventsCreator().count();
  },

  listProjectsEventsCreatorAdmin1M(querySearch) {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParentNoObject(this.links.projects, 'projects');
      const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
      const query = querySearch || {};
      query.$or = [];

      projectIds.forEach((id) => {
        const queryCo = {};
        if (userC && userC.links && userC.links.projects && userC.links.projects[id] && userC.links.projects[id].isAdmin && !userC.links.projects[id].toBeValidated && !userC.links.projects[id].isAdminPending && !userC.links.projects[id].isInviting) {
          queryCo[`organizer.${id}`] = { $exists: true };
          query.$or.push(queryCo);
        }
      });
      if (query.$or.length === 0) {
        delete query.$or;
      }

      // queryOptions.fields.parentId = 1;
      // const inputDate = new Date();
      const inputDate = moment(new Date()).subtract(15, 'day').toDate();
      // query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
      query.status = { $exists: false };

      const options = {};
      options.sort = {
        startDate: -1,
      };
      // console.log(query);
      return Events.find(query, options);
    }
  },
  countProjectsEventsCreatorAdmin1M() {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listProjectsEventsCreatorAdmin1M() && this.listProjectsEventsCreatorAdmin1M().count();
  },
  listProjectsEventsActionsCreator(status = 'todo', limit) {
    const query = {};
    const listEvents = this.listProjectsEventsCreator1M();

    if (Meteor.isClient) {
      if (Session.get(`isAdminOrga${Session.get('orgaCibleId')}`)) {
        const listProjects = this.listProjects();

        const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
        const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
        const mergeArray = [...eventIds, ...projectIds, this._id._str];

        query.parentId = {
          $in: mergeArray,
        };
      } else {
        const listProjects = this.listProjectsCreatorAdmin();
        const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
        const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
        const mergeArray = [...eventIds, ...projectIds];

        query.parentId = {
          $in: mergeArray,
        };
      }
    } else if (this.isAdmin()) {
      const listProjects = this.listProjects();
      const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
      const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
      const mergeArray = [...eventIds, ...projectIds, this._id._str];
      query.parentId = {
        $in: mergeArray,
      };
    } else {
      const listProjects = this.listProjectsCreatorAdmin();
      const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
      const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
      const mergeArray = [...eventIds, ...projectIds];
      query.parentId = {
        $in: mergeArray,
      };
    }

    if (status === 'todo') {
      query.status = 'todo';
    } else if (status === 'done') {
      query.status = 'done';
    }

    const options = {};
    options.sort = {
      created: -1,
    };

    if (limit) {
      options.limit = limit;
    }
    return Actions.find(query, options);
  },
  countProjectsEventsActionsCreator() {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listProjectsEventsActionsCreator() && this.listProjectsEventsActionsCreator().count();
  },
  listProjectsEventsActionsCreatorAdmin(status = 'todo', limit) {
    const query = {};
    const listEvents = this.listProjectsEventsCreatorAdmin1M();
    if (Meteor.isClient) {
      if (Session.get(`isAdminOrga${Session.get('orgaCibleId')}`)) {
        const listProjects = this.listProjects();
        const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
        const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
        const mergeArray = [...eventIds, ...projectIds, this._id._str];

        query.parentId = {
          $in: mergeArray,
        };
      } else {
        const listProjects = this.listProjectsCreatorAdmin();
        const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
        const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
        const mergeArray = [...eventIds, ...projectIds];

        query.parentId = {
          $in: mergeArray,
        };
      }
    } else if (this.isAdmin()) {
      const listProjects = this.listProjects();
      const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
      const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
      const mergeArray = [...eventIds, ...projectIds, this._id._str];
      query.parentId = {
        $in: mergeArray,
      };
    } else {
      const listProjects = this.listProjectsCreatorAdmin();
      const eventIds = listEvents ? listEvents.map(event => event._id._str) : [];
      const projectIds = listProjects ? listProjects.map(project => project._id._str) : [];
      const mergeArray = [...eventIds, ...projectIds];
      query.parentId = {
        $in: mergeArray,
      };
    }

    if (status === 'todo') {
      query.status = 'todo';
    } else if (status === 'done') {
      query.status = 'done';
    }

    const options = {};
    options.sort = {
      created: -1,
    };

    if (limit) {
      options.limit = limit;
    }
    return Actions.find(query, options);
  },
  countProjectsEventsActionsCreatorAdmin() {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listProjectsEventsActionsCreatorAdmin() && this.listProjectsEventsActionsCreatorAdmin().count();
  },
  actionsInWaiting(search, searchSort) {
    const finished = `finishedBy.${Meteor.userId()}`;
    const UserId = `links.contributors.${Meteor.userId()}`;
    const raffEventsArray = this.listProjectsEventsCreator1M() ? this.listProjectsEventsCreator1M().map(event => event._id._str) : [];

    let raffProjectsArray;
    if (search && search.charAt(0) === ':' && search.length > 1) {
      raffProjectsArray = this.listProjects(search) ? this.listProjects(search).map(project => project._id._str) : [];
    } else {
      raffProjectsArray = this.listProjects() ? this.listProjects().map(project => project._id._str) : [];
    }

    const mergeArray = [...raffEventsArray, ...raffProjectsArray, this._id._str];

    let query = { [UserId]: { $exists: 1 }, [finished]: { $exists: false }, parentId: { $in: mergeArray }, status: 'todo' };
    if (Meteor.isClient) {
      if (search && search.charAt(0) !== ':') {
        if (search) {
          query = searchQuery(query, search);
        }
      }
    }

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
  actionsToValidate() {
    const finished = `finishedBy.${Meteor.userId()}`;
    const UserId = `links.contributors.${Meteor.userId()}`;
    const raffEventsArray = this.listProjectsEventsCreator1M() ? this.listProjectsEventsCreator1M().map(event => event._id._str) : [];
    const raffProjectsArray = this.listProjects() ? this.listProjects().map(project => project._id._str) : [];
    const mergeArray = [...raffEventsArray, ...raffProjectsArray, this._id._str];
    return Actions.find({ [UserId]: { $exists: 1 }, [finished]: 'toModerate', parentId: { $in: mergeArray }, status: 'todo' });
  },
  actionsValidate() {
    const finished = `finishedBy.${Meteor.userId()}`;
    const UserId = `links.contributors.${Meteor.userId()}`;
    const raffEventsArray = this.listProjectsEventsCreator1M() ? this.listProjectsEventsCreator1M().map(event => event._id._str) : [];
    const raffProjectsArray = this.listProjects() ? this.listProjects().map(project => project._id._str) : [];
    const mergeArray = [...raffEventsArray, ...raffProjectsArray, this._id._str];
    return Actions.find({ [UserId]: { $exists: 1 }, [finished]: 'validated', credits: { $gt: 0 }, parentId: { $in: mergeArray } });
  },
  actionsSpend() {
    const finished = `finishedBy.${Meteor.userId()}`;
    const UserId = `links.contributors.${Meteor.userId()}`;
    const raffEventsArray = this.listProjectsEventsCreator1M() ? this.listProjectsEventsCreator1M().map(event => event._id._str) : [];
    const raffProjectsArray = this.listProjects() ? this.listProjects().map(project => project._id._str) : [];
    const mergeArray = [...raffEventsArray, ...raffProjectsArray, this._id._str];
    return Actions.find({ [UserId]: { $exists: 1 }, [finished]: 'validated', credits: { $lt: 0 }, parentId: { $in: mergeArray } });
  },
  actionsValidateSpend() {
    const finished = `finishedBy.${Meteor.userId()}`;
    const UserId = `links.contributors.${Meteor.userId()}`;
    // const raffProjectsArray = this.listProjectsEventsCreator1M().map(event => event._id._str);
    // return Actions.find({ [UserId]: { $exists: 1 }, [finished]: 'validated', parentId: { $in: raffProjectsArray } }, { sort: { endDate: -1 } });
    return Actions.find({ [UserId]: { $exists: 1 }, [finished]: 'validated' }, { sort: { endDate: -1 } });
  },
  actionsAll() {
    const queryProjectId = `parent.${this._id._str}`;
    const poleProjects = Projects.find({ [queryProjectId]: { $exists: 1 } }).fetch();
    const poleProjectsId = [];
    poleProjects.forEach((element) => {
      poleProjectsId.push(element._id._str);
    });

    const queryEventsArray = {};
    queryEventsArray.$or = [];
    poleProjects.forEach((element) => {
      const queryCo = {};
      queryCo[`organizer.${element._id._str}`] = { $exists: true };
      queryEventsArray.$or.push(queryCo);
    });

    const eventsArrayId = [];
    Events.find(queryEventsArray).forEach(function (event) { eventsArrayId.push(event._id._str); });

    // faire un ou si date pas remplie
    const query = {};
    const inputDate = new Date();
    // query.endDate = { $gte: inputDate };
    query.$or = [];
    query.$or.push({ endDate: { $exists: true, $gte: inputDate }, parentId: { $in: [...eventsArrayId, ...poleProjectsId, this._id._str] }, status: 'todo' });
    query.$or.push({ endDate: { $exists: false }, parentId: { $in: [...eventsArrayId, ...poleProjectsId, this._id._str] }, status: 'todo' });

    const options = {};
    options.sort = {
      startDate: 1,
    };

    return Actions.find(query);
  },
  actionsUserAll(userId, etat, search) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();

    const queryProjectId = `parent.${this._id._str}`;
    const poleProjects = Projects.find({ [queryProjectId]: { $exists: 1 } }).fetch();
    const poleProjectsId = [];
    poleProjects.forEach((element) => {
      poleProjectsId.push(element._id._str);
    });

    const queryEventsArray = {};
    queryEventsArray.$or = [];
    poleProjects.forEach((element) => {
      const queryCo = {};
      queryCo[`organizer.${element._id._str}`] = { $exists: true };
      queryEventsArray.$or.push(queryCo);
    });

    const eventsArrayId = [];
    Events.find(queryEventsArray).forEach(function (event) { eventsArrayId.push(event._id._str); });

    // faire un ou si date pas remplie
    const query = {};
    const inputDate = new Date();
    // query.endDate = { $gte: inputDate };
    const linkUserID = `links.contributors.${bothUserId}`;

    const fields = {};
    if (search) {
      // regex qui marche coté serveur parcontre seulement sur un mot
      const searchApplyDiacritics = applyDiacritics(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'regex');
      const pattern = new RegExp(`.*${searchApplyDiacritics.replace(/\\/g, '\\\\')}.*`, 'i');
      fields.name = { $regex: pattern };
    }

    const finishedObj = {};
    const finished = `finishedBy.${bothUserId}`;
    if (etat === 'aFaire') {
      finishedObj[finished] = { $exists: false };
    } else if (etat === 'enAttente') {
      finishedObj[finished] = 'toModerate';
    }

    query.$or = [];
    query.$or.push({ [linkUserID]: { $exists: true }, endDate: { $exists: true, $gte: inputDate }, parentId: { $in: [...eventsArrayId, ...poleProjectsId, this._id._str] }, status: 'todo', ...fields, ...finishedObj });
    query.$or.push({ [linkUserID]: { $exists: true }, endDate: { $exists: false }, parentId: { $in: [...eventsArrayId, ...poleProjectsId, this._id._str] }, status: 'todo', ...fields, ...finishedObj });
    query.$or.push({ endDate: { $exists: true, $gte: inputDate }, parentId: { $in: [bothUserId] }, status: 'todo', ...fields, ...finishedObj });
    query.$or.push({ endDate: { $exists: false }, parentId: { $in: [bothUserId] }, status: 'todo', ...fields, ...finishedObj });

    const options = {};
    options.sort = {
      startDate: 1,
    };

    return Actions.find(query);
  },
  settingOceco() {
    /* {
      pole: true,
      organizations: true
      projectAction: true,
      eventAction: true,
      memberAuto: true,
    } */
    return this.oceco;
  },
  listNotifications (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseen(bothUserId, this._id._str, 'organizations');
  },
  countListNotifications (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return this.listNotifications(bothUserId).count();
  },
  listNotificationsAsk (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseenAsk(bothUserId, this._id._str, 'organizations');
  },
  countPopMap () {
    return this.links && this.links.members && _.size(this.links.members);
  },
  membersPopMap() {
    if (this.links && this.links.members) {
      const membersIds = arrayLinkParentNoObject(this.links.members, 'citoyens');
      return membersIds;
    }
  },
  actionIndicatorCount(status) {
    const query = {};
    query.parentId = this._id._str;
    query.parentType = 'organizations';
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
    query.parentType = 'organizations';

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
  typeValue () {
    const organisationTypes = Lists.findOne({ name: 'organisationTypes' });
    return this.type && organisationTypes && organisationTypes.list && organisationTypes.list[this.type];
  },
  listOrganisationTypes () {
    return Lists.find({ name: 'organisationTypes' });
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
    if (this.isMembers(bothUserId)) {
      scopeTypeArray.push('private');
      query.$or.push({ 'target.id': targetId, 'scope.type': { $in: scopeTypeArray } });
      query.$or.push({ 'mentions.id': targetId });
    } else {
      query.$or.push({ 'target.id': targetId, $or: [{ 'scope.type': { $in: scopeTypeArray } }, { author: bothUserId }] });
      query.$or.push({ 'mentions.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    }
    return News.find(query, options);
  },
  new () {
    return News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});

// }
