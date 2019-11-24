import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { Tracker } from 'meteor/tracker';

// schemas
import { baseSchema } from './schema.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
import { Events } from './events.js';
import { Poi } from './poi.js';
import { queryLink, queryLinkToBeValidated } from './helpers.js';
import { nameToCollection } from './helpers.js';

export const Gamesmobile = new Mongo.Collection('gamesmobile', { idGeneration: 'MONGO' });

export const Playersmobile = new Mongo.Collection('playersmobile', { idGeneration: 'MONGO' });

export const Questsmobile = new Mongo.Collection('questsmobile', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
  // Index
  Playersmobile.rawCollection().createIndex(
    { idUser: 1, idGame: 1 },
    { name: 'usergame', background: true, unique: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
  Questsmobile.rawCollection().createIndex(
    { idGame: 1 },
    { name: 'questgame', background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
}

/*
Todo :
equipe,groupe
validateQuest detail
valider/ou pas
les reponse
nombre de reponse
date des reponse
*/
export const SchemasPlayersmobileRest = new SimpleSchema({
  idUser: {
    type: String,
  },
  idGame: {
    type: String,
  },
  totalPoint: {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 0,
  },
  validateQuest: {
    type: Array,
    optional: true,
  },
  'validateQuest.$': {
    type: String,
  },
  errorQuest: {
    type: Array,
    optional: true,
  },
  'errorQuest.$': {
    type: String,
  },
  finishedAt: {
    type: Date,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    },
  },
  updatedAt: {
    type: Date,
    autoValue () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
});

Playersmobile.attachSchema(SchemasPlayersmobileRest, {
  tracker: Tracker,
});

/* Todo
questionType :

*/
export const SchemasQuestsmobileRest = new SimpleSchema({
  idGame: {
    type: String,
  },
  pointWin: {
    type: SimpleSchema.Integer,
    min: 1,
  },
  order: {
    type: SimpleSchema.Integer,
  },
  numberPlayerValidate: {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 0,
  },
  numberPlayerError: {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 0,
  },
  question: {
    type: String,
  },
  questType: {
    type: String,
  },
  questId: {
    type: String,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
});

Questsmobile.attachSchema(SchemasQuestsmobileRest, {
  tracker: Tracker,
});

export const SchemasGamesmobileRest = new SimpleSchema(baseSchema.pick('name', 'description'));
SchemasGamesmobileRest.extend({
  startDate: {
    type: Date,
    optional: true,
    custom() {
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
    custom() {
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
  numberPlayers: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      }
      this.unset();
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
});

/* export const SchemasGamesmobileRest = new SimpleSchema([baseSchema.pick('name', 'description'), {
  startDate: {
    type: Date,
    optional: true,
    custom() {
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
    custom() {
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
  numberPlayers: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
}]); */

Gamesmobile.attachSchema(SchemasGamesmobileRest, {
  tracker: Tracker,
});


if (Meteor.isClient) {
  import { Chronos } from './client/chronos.js';

  window.Organizations = Organizations;
  window.Projects = Projects;
  window.Citoyens = Citoyens;
  window.Events = Events;
  window.Poi = Poi;

  Gamesmobile.helpers({
    isStart() {
      const start = moment(this.startDate).toDate();
      return Chronos.moment(start).isBefore(); // True
    },
    isEnd() {
      const end = moment(this.endDate).toDate();
      return Chronos.moment(end).isBefore(); // True
    },
    isNotStart() {
      const start = moment(this.startDate).toDate();
      return Chronos.moment().isBefore(start); // True
    },
    isNotEnd() {
      const end = moment(this.endDate).toDate();
      return Chronos.moment().isBefore(end); // True
    },
    timeSpentStart() {
      return Chronos.moment(this.startDate).fromNow();
    },
    timeSpentEnd() {
      return Chronos.moment(this.endDate).fromNow();
    },
  });

  Playersmobile.helpers({
    playTimeSpentStart() {
      return Chronos.moment(this.createdAt).fromNow();
    },
  });
} else {
  Gamesmobile.helpers({
    isStart() {
      const start = moment(this.startDate).toDate();
      return moment(start).isBefore(); // True
    },
    isEnd() {
      const end = moment(this.endDate).toDate();
      return moment(end).isBefore(); // True
    },
    isNotStart() {
      const start = moment(this.startDate).toDate();
      return moment().isBefore(start); // True
    },
    isNotEnd() {
      const end = moment(this.endDate).toDate();
      return moment().isBefore(end); // True
    },
  });


  Playersmobile.helpers({
    playTimeSpentStart() {
      return moment(this.createdAt).fromNow();
    },
  });
}

Gamesmobile.helpers({
  scopeVar() {
    return 'gamesmobile';
  },
  listQuests() {
    const query = {};
    query.idGame = this._id._str;
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields.idGame = 1;
    queryOptions.fields.pointWin = 1;
    queryOptions.fields.question = 1;
    queryOptions.fields.questType = 1;
    queryOptions.fields.questId = 1;
    queryOptions.sort = {};
    queryOptions.sort.order = 1;
    // queryOptions
    return Questsmobile.find(query, queryOptions);
  },
  countQuests() {
    return this.listQuests() && this.listQuests().count();
  },
  listPlayers() {
    const query = {};
    query.idGame = this._id._str;
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields.idGame = 1;
    queryOptions.fields.idUser = 1;
    queryOptions.fields.totalPoint = 1;
    queryOptions.fields.validateQuest = 1;
    queryOptions.fields.errorQuest = 1;
    queryOptions.fields.createdAt = 1;
    queryOptions.fields.finishedAt = 1;
    queryOptions.sort = {};
    queryOptions.sort.totalPoint = -1;
    queryOptions.sort.finishedAt = 1;
    // queryOptions
    return Playersmobile.find(query, queryOptions);
  },
  countPlayers() {
    return this.listPlayers() && this.listPlayers().count();
  },
  playerMe() {
    const query = {};
    query.idGame = this._id._str;
    query.idUser = Meteor.userId();
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields.idGame = 1;
    queryOptions.fields.idUser = 1;
    queryOptions.fields.totalPoint = 1;
    queryOptions.fields.validateQuest = 1;
    queryOptions.fields.errorQuest = 1;
    queryOptions.fields.createdAt = 1;
    queryOptions.fields.finishedAt = 1;
    // queryOptions
    return Playersmobile.findOne(query, queryOptions);
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
});

Questsmobile.helpers({
  objectQuest() {
    if (this.questType && this.questId) {
      const collection = nameToCollection(this.questType);
      return collection.findOne({ _id: new Mongo.ObjectID(this.questId) });
    }
  },
});

Playersmobile.helpers({
  isMe() {
    return this.idUser === Meteor.userId();
  },
  playerProfile() {
    return Citoyens.findOne({
      _id: new Mongo.ObjectID(this.idUser),
    }, {
      fields: {
        name: 1,
        profilThumbImageUrl: 1,
      },
    });
  },
  listQuestsValid() {
    const query = {};
    query.idGame = this.idGame;
    const arrayValidateQuest = this.validateQuest ? this.validateQuest.map(_id => new Mongo.ObjectID(_id)) : [];
    const arrayErrorQuest = this.errorQuest ? this.errorQuest.map(_id => new Mongo.ObjectID(_id)) : [];
    query._id = { $in: [...arrayValidateQuest, ...arrayErrorQuest] };
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields._id = 1;
    queryOptions.fields.idGame = 1;
    queryOptions.fields.pointWin = 1;
    queryOptions.fields.questType = 1;
    queryOptions.fields.questId = 1;
    queryOptions.fields.question = 1;
    queryOptions.fields.order = 1;
    queryOptions.fields.numberPlayerValidate = 1;
    queryOptions.fields.numberPlayerError = 1;
    queryOptions.sort = {};
    queryOptions.sort.order = 1;
    // queryOptions
    return Questsmobile.find(query, queryOptions);
  },
  countQuestsValid() {
    return this.listQuestsValid() && this.listQuestsValid().count();
  },
  listQuestsError() {
    const query = {};
    query.idGame = this.idGame;
    const arrayErrorQuest = this.errorQuest ? this.errorQuest.map(_id => new Mongo.ObjectID(_id)) : [];
    query._id = { $in: arrayErrorQuest };
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields._id = 1;
    queryOptions.fields.idGame = 1;
    queryOptions.fields.pointWin = 1;
    queryOptions.fields.questType = 1;
    queryOptions.fields.questId = 1;
    queryOptions.fields.question = 1;
    queryOptions.fields.order = 1;
    queryOptions.fields.numberPlayerValidate = 1;
    queryOptions.fields.numberPlayerError = 1;
    queryOptions.sort = {};
    queryOptions.sort.order = 1;
    // queryOptions
    return Questsmobile.find(query, queryOptions);
  },
  countQuestsError() {
    return this.listQuestsError() && this.listQuestsError().count();
  },
  listQuestsNoValid() {
    const query = {};
    query.idGame = this.idGame;
    const arrayValidateQuest = this.validateQuest ? this.validateQuest.map(_id => new Mongo.ObjectID(_id)) : [];
    const arrayErrorQuest = this.errorQuest ? this.errorQuest.map(_id => new Mongo.ObjectID(_id)) : [];
    query._id = { $nin: [...arrayValidateQuest, ...arrayErrorQuest] };
    const queryOptions = {};
    queryOptions.fields = {};
    queryOptions.fields._id = 1;
    queryOptions.fields.idGame = 1;
    queryOptions.fields.pointWin = 1;
    queryOptions.fields.questType = 1;
    queryOptions.fields.questId = 1;
    queryOptions.fields.question = 1;
    queryOptions.fields.order = 1;
    // queryOptions.limit = 1;
    queryOptions.sort = {};
    queryOptions.sort.order = 1;
    // queryOptions
    return Questsmobile.find(query, queryOptions);
  },
  countQuestsNoValid() {
    return this.listQuestsNoValid() && this.listQuestsNoValid().count();
  },
  questIsValid(questId) {
    return this.validateQuest && this.validateQuest.includes(questId);
  },
});
