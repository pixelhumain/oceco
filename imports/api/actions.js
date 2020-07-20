/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { Tracker } from 'meteor/tracker';

// schemas
import { baseSchema } from './schema.js';
import { Citoyens } from './citoyens.js';
import { Comments } from './comments.js';
import { queryLink, queryLinkToBeValidated, queryOptions, arrayLinkProper, arrayLinkProperNoObject } from './helpers.js';

export const Actions = new Mongo.Collection('actions', { idGeneration: 'MONGO' });

/*
idParentRoom:59d64c0240bb4e2e4fdcd10b
name:test action
description:test action
startDate:2017-10-06T12:43:00+04:00
endDate:2017-10-28T12:43:00+04:00
status:todo
email:thomas.craipeau@gmail.com
idUserAuthor:55ed9107e41d75a41a558524
parentId:598ad7bc40bb4e3f11219447
parentType:organizations
key:action
collection:actions
*/

export const SchemasActionsRest = new SimpleSchema(baseSchema.pick('name', 'description', 'tags', 'tags.$'), {
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
SchemasActionsRest.extend({
  tagsText: {
    type: String,
    optional: true,
  },
  participants: {
    type: Array,
    optional: true,
  },
  'participants.$': {
    type: String,
  },
  finishedBy: {
    type: Array,
    optional: true,
  },
  'finishedBy.$': {
    type: String,
  },
  validated: {
    type: Array,
    optional: true,
  },
  'validated.$': {
    type: String,
  },
  credits: {
    type: Number,
    defaultValue: 1,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return 1;
    },
    optional: true,
  },
  max: {
    type: Number,
    optional: true,
  },
  min: {
    type: Number,
    optional: true,
  },
  idParentRoom: {
    type: String,
    optional: true,
  },
  startDate: {
    type: Date,
    optional: true,
    custom() {
      if (this.field('endDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      const startDate = moment(this.value).toDate();
      const endDate = moment(this.field('endDate').value).toDate();
      if (!this.field('options.possibleStartActionBeforeStartDate').value){
        if (moment(endDate).isBefore(startDate)) {
          return 'maxDateStart';
        }
      }
    },
  },
  endDate: {
    type: Date,
    optional: true,
    custom() {
      if (this.field('startDate').value && this.field('options.possibleStartActionBeforeStartDate').value) {

      } else {
        if (this.field('startDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
          return 'required';
        }
      }
      if (this.value) {
        const startDate = moment(this.field('startDate').value).toDate();
        const endDate = moment(this.value).toDate();
        if (moment(endDate).isBefore(startDate)) {
          return 'minDateEnd';
        }
      }
      
    },
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events', 'citoyens'],
  },
  urls: {
    type: Array,
    optional: true,
  },
  'urls.$': {
    type: String,
  },

  options: {
    type: Object,
    optional: true,
  },
  'options.creditAddPorteur': {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return false;
    },
    optional: true,
  },
  'options.creditSharePorteur': {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return false;
    },
    optional: false,
  },
  'options.possibleStartActionBeforeStartDate': {
    type: Boolean,
    defaultValue: false,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }
      return false;
    },
    optional: true,
  },
});

/* export const SchemasActionsRest = new SimpleSchema([baseSchema.pick('name', 'description', 'tags', 'tags.$'), {
  idParentRoom: {
    type: String,
  },
  startDate: {
    type: Date,
    optional: true,
    custom () {
      if (this.field('endDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      const startDate = moment(this.value).toDate();
      const endDate = moment(this.field('endDate').value).toDate();
      if (moment(endDate).isBefore(startDate)) {
        return 'maxDateStart';
      }
    },
  },
  endDate: {
    type: Date,
    optional: true,
    custom () {
      if (this.field('startDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      const startDate = moment(this.field('startDate').value).toDate();
      const endDate = moment(this.value).toDate();
      if (moment(endDate).isBefore(startDate)) {
        return 'minDateEnd';
      }
    },
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  urls: {
    type: Array,
    optional: true,
  },
  'urls.$': {
    type: String,
  },

}]); */

if (Meteor.isClient) {
  import { Chronos } from './client/chronos.js';

  Actions.helpers({

    isStartDate() {
      if (this.startDate) {
        const start = moment(this.startDate).toDate();
        return Chronos.moment(start).isBefore(); // True
      } else {
        return false;
      }
    },
    isNotStartDate() {
      if (this.startDate) {
        const start = moment(this.startDate).toDate();
        return Chronos.moment().isBefore(start); // True
      } else {
        return false;
      }
    },
    isEndDate() {
      if (this.endDate){
        const end = moment(this.endDate).toDate();
        return Chronos.moment(end).isBefore(); // True
      } else {
        return false;
      }
    },
    isNotEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return Chronos.moment().isBefore(end); // True
      } else {
        return false;
      }
    },
    timeSpentStart() {
      if (this.startDate) {
        return Chronos.moment(this.startDate).fromNow();
      } else {
        return false;
      }
    },
    timeSpentEnd() {
      if (this.endDate) {
        return Chronos.moment(this.endDate).fromNow();
      } else {
        return false;
      }
    },
  });
} else {
  Actions.helpers({
    isEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return moment(end).isBefore(); // True
      } else {
        return false;
      }
    },
    isNotEndDate() {
      if (this.endDate) {
        const end = moment(this.endDate).toDate();
        return moment().isBefore(end); // True
      } else {
        return false;
      }
    },
  });
}

Actions.helpers({
  isVisibleFields () {
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'actions';
  },
  scopeEdit () {
    return 'actionsEdit';
  },
  listScope () {
    return 'listActions';
  },
  creatorProfile () {
    return Citoyens.findOne({
      _id: new Mongo.ObjectID(this.creator),
    }, {
      fields: {
        name: 1,
        profilThumbImageUrl: 1,
      },
    });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  listMembersToBeValidated () {
    if (this.links && this.links.contributors) {
      const query = queryLinkToBeValidated(this.links.contributors);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  isContributors (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.isToBeValidated(bothUserId) && this.isIsInviting('contributors', bothUserId)));
  },
  userIsValidated(userId) {
    if (this.finishedBy && this.finishedBy[userId] && this.finishedBy[userId] === 'validated') {
      return true;
    }
    return false;
  },
  userIsNoValidated(userId) {
    if (this.finishedBy && this.finishedBy[userId] && this.finishedBy[userId] === 'novalidated') {
      return true;
    }
    return false;
  },
  userTovalidate(userId) {
    if (this.finishedBy && this.finishedBy[userId] && this.finishedBy[userId] === 'toModerate') {
      return true;
    }
    return false;
  },
  avatarOneUserAction() {
    // si une action à un participant min et max et qu'un user à pris la tache
    // avoir son avatar sur l'action
    if (this.max === 1 && this.links && this.links.contributors) {
      const query = queryLink(this.links.contributors);
      const citoyenOne = Citoyens.findOne(query);
      if (citoyenOne && citoyenOne.profilThumbImageUrl) {
        return citoyenOne.profilThumbImageUrl;
      }
      return false;
    }
    return false;
  },
  contributorsPlusOne() {
    if (this.links && this.links.contributors) {
      const arrayContributors = arrayLinkProperNoObject(this.links.contributors);
      return arrayContributors && arrayContributors.length > 1;
    }
    return false;
  },
  listContributors (search) {
    if (this.links && this.links.contributors) {
      const query = queryLink(this.links.contributors, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  userCredit() {
    const citoyenOne = Citoyens.findOne({
      _id: new Mongo.ObjectID(Meteor.userId()),
    });
    return citoyenOne && citoyenOne.userCredit();
  },
  isActionDepense() {
    return Math.sign(this.credits) === -1;
  },
  isDepense() {
    return this.credits < 0 && this.userCredit() && (this.userCredit() + this.credits) >= 0;
  },
  isAFaire() {
    return this.credits > 0 || (this.options && this.options.creditAddPorteur);
  },
  isCreditAddPorteur() {
    return !this.credits && this.options && this.options.creditAddPorteur;
  },
  isPossibleStartActionBeforeStartDate() {
    return this.options && this.options.possibleStartActionBeforeStartDate;
  },
  isNotMax() {
    return this.max ? (this.max > this.countContributors()) : true;
  },
  projectDayHour() {
    return moment(this.startDate).format(' ddd Do MMM à HH:mm ');
  },
  projectDay() {
    return moment(this.startDate).format(' ddd Do MMM ');
  },
  projectDuration() {
    const startDate = moment(this.startDate);
    const endDate = moment(this.endDate);
    return Math.round(endDate.diff(startDate, 'minutes') / 60);
  },
  actionStartFromEnd() {
    const startDate = moment(this.startDate);
    const endDate = moment(this.endDate);
    return startDate.from(endDate, true);
  },
  actionParticipantsNbr() {
    if (this.links) {
      const numberParticipant = arrayLinkProper(this.links.contributors).length;
      return numberParticipant;
    }
    return 'aucun';
  },
  creditPositive() {
    if (this.credits >= 0 || this.isCreditAddPorteur()) {
      return true;
    }
    return false;
  },
  creditNegative() {
    return -this.credits;
  },
  countContributors (search) {
    // return this.links && this.links.contributors && _.size(this.links.contributors);
    return this.listContributors(search) && this.listContributors(search).count() ? this.listContributors(search).count() : 0;
  },
  creditPartage() {
    if (this.options && this.options.creditSharePorteur) {
      if (this.countContributors() > 0) {
        return Math.round(this.credits / this.countContributors());
      }
    }
    return this.credits;
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  isIsInviting (scope, scopeId) {
    return !((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  momentStartDate() {
    return moment(this.startDate).toDate();
  },
  momentEndDate() {
    return moment(this.endDate).toDate();
  },
  formatStartDate() {
    return moment(this.startDate).format('DD/MM/YYYY HH:mm');
  },
  formatEndDate() {
    return moment(this.endDate).format('DD/MM/YYYY HH:mm');
  },
  listComments () {
    // console.log('listComments');
    return Comments.find({
      contextId: this._id._str,
    }, { sort: { created: -1 } });
  },
  commentsCount () {
    if (this.commentCount) {
      return this.commentCount;
    }
    return 0;
  },
});
