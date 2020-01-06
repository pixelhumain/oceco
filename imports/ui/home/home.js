import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
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
    const handle = Meteor.subscribe('poles.actions', '5de9df6d064fca0d008b4568', Router.current().params.pole);
    this.ready.set(handle.ready());
  }.bind(this));
  this.sortByDate = new ReactiveVar(false);
  this.sortByDay = new ReactiveVar(false);
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

Template.buttonSubscribeAction.events({
  'click .assign-action-js' (event, instance) {
    event.preventDefault();       
    Meteor.call('assignmeActionRooms', { id: this.id }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__('Pas assé de crédits désolé') });
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
    if (actionCursor.links != undefined) {
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

    const userAddedAction = 'links.contributors.'+Meteor.userId()
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
        return Actions.find({$and: [{ _id: { $in: arrayActionToDisplay } }, { sort: { startDate: 1 } },
        {[userAddedAction]: {exists: false}}]});
      }
      return Actions.find({$and: [{}, { sort: { startDate: -1 } },{[userAddedAction]: {$exists: false}}]});
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
      return Actions.find({$and: [{ _id: { $in: arrayActionToDisplay } },
        {[userAddedAction]: {$exists: false}}]});
    }
    return Actions.find({$and: [{},{[userAddedAction]: {$exists: false}}]});
  },
  returnId(id) {
    return id.valueOf();
  },
  
})
Template.buttonSubscribeAction.helpers({
  creditPositive(credit){
    if (credit >= 0) {
      return true
    }
    else{ return false}
  }
})
