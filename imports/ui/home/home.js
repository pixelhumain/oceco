import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

import './home.html';
import { arrayLinkProper } from '../../api/helpers';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions';


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;

Template.home.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = Meteor.subscribe('poles.actions', Meteor.settings.public.orgaCibleId, Router.current().params.pole);
    this.ready.set(handle.ready());
  }.bind(this));
  this.sortByDate = new ReactiveVar(false);
  this.sortByDay = new ReactiveVar(false);
});


Template.itemInputAction.onCreated(function() {
  this.displayDesc = new ReactiveVar(false);
});

Template.itemInputAction.events({
  'click .display-desc-js'(event, instance) {
    event.preventDefault();
    if (!Template.instance().displayDesc.get()) {
      Template.instance().displayDesc.set(true);
    } else {
      Template.instance().displayDesc.set(false);
    }
  },
});
Template.itemInputAction.helpers({
  displayDesc() {
    return Template.instance().displayDesc.get();
  },
});

Template.scrollPrez.onCreated(function() {
  this.scrollPrez = new ReactiveVar(false);
});

Template.scrollPrez.events({
  'click .scroll-prez-js'(event, instance) {
    event.preventDefault();
    if (!Template.instance().scrollPrez.get()) {
      Template.instance().scrollPrez.set(true);
    } else {
      Template.instance().scrollPrez.set(false);
    }
  },
});
Template.scrollPrez.helpers({
  scrollP() {
    return Template.instance().scrollPrez.get();
  },
});

Template.home.events({
  'click #sortByDate '(event, instance) {
    Template.instance().sortByDate.set(true);
  },
  'change #sortByDay'(event, instance) {
    const selectedDay = event.currentTarget.value;
    Template.instance().sortByDay.set(selectedDay);
  },
});

Template.buttonSubscribeAction.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false,
  });
});

Template.buttonSubscribeAction.helpers({
  isCall() {
    return Template.instance().state.get('call');
  },
});

Template.buttonSubscribeAction.events({
  'click .assign-action-js' (event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('assignmeActionRooms', { id: this.id }, (error) => {
      if (error) {
        console.log(error);
        IonPopup.alert({ template: i18n.__('Pas assé de crédits désolé') });
        instance.state.set('call', false);
      } else {
      }
    });
  },
});


Template.actionDuration.helpers({
  projectDuration(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    return Math.round(endDate.diff(startDate, 'minutes') / 60);
  },
});

Template.actionParticipantNeeded.helpers({
  actionParticipantsNbr(actionId) {
    // const actionId = Router.current().params.id
    // const actionObjectId = new Mongo.ObjectID(actionId)
    const actionCursor = Actions.findOne({ _id: actionId });
    if (actionCursor && actionCursor.links) {
      const numberParticipant = arrayLinkProper(actionCursor.links.contributors).length;
      return numberParticipant;
    }

    return 0;
  },
});
Template.actionDate.helpers({
  projectDay(date) {
    return moment(date).format(' ddd Do MMM ');
  },
});
Template.home.helpers({
  projectAction() {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    if (Template.instance().sortByDate.get()) {
      if (Template.instance().sortByDay.get()) {
        const dayWanted = Template.instance().sortByDay.get();
        const actionCursor = Actions.find();
        const arrayActionToDisplay = [];
        actionCursor.forEach((action) => {
          const day = moment(action.startDate).format('dddd');
          if (day === dayWanted) {
            arrayActionToDisplay.push(action._id);
          }
        });
        return Actions.find({ $and: [{ _id: { $in: arrayActionToDisplay } }, { sort: { startDate: 1 } },
          { [userAddedAction]: { exists: false } }] });
      }
      return Actions.find({ $and: [{}, { sort: { startDate: -1 } }, { [userAddedAction]: { $exists: false } }] });
    }
    if (Template.instance().sortByDay.get()) {
      const dayWanted = Template.instance().sortByDay.get();
      const actionCursor = Actions.find();
      const arrayActionToDisplay = [];
      actionCursor.forEach((action) => {
        const day = moment(action.startDate).format('dddd');
        if (day === dayWanted) {
          arrayActionToDisplay.push(action._id);
        }
      });
      return Actions.find({ $and: [{ _id: { $in: arrayActionToDisplay } },
        { [userAddedAction]: { $exists: false } }] });
    }
    return Actions.find({ $and: [{}, { [userAddedAction]: { $exists: false } }] });
  },
  returnId(id) {
    return id.valueOf();
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.buttonSubscribeAction.helpers({
  creditPositive(credit) {
    if (credit >= 0) {
      return true;
    }
    return false;
  },
});
