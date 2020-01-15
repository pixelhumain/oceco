import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { pageSession } from '../../api/client/reactive.js';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';
import { Rooms } from '../../api/rooms.js';

import { arrayLinkProper } from '../../api/helpers.js';

import './wallet.html';


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;
window.Rooms = Rooms;

Template.wallet.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('user.actions', Meteor.settings.public.orgaCibleId);
    if (handle.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
  this.scroll1 = new ReactiveVar(false);
  this.scroll2 = new ReactiveVar(false);
  this.scroll3 = new ReactiveVar(false);
  this.scroll4 = new ReactiveVar(false);
  this.displayValidateActions = new ReactiveVar(true);
  this.displaySpendActions = new ReactiveVar(false);
  this.selectview = new ReactiveVar('aFaire');
});


Template.buttonActionFinish.events({
  'click .finish-action-js' (event, instance) {
    event.preventDefault();
    const actionId = this.action._id._str;
    Meteor.call('finishAction', {
      id: actionId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        console.log('succesw');
      }
    });
  },
});

Template.wallet.events({
  'click .change-selectview-js'(event, instance) {
    event.preventDefault();
    Template.instance().selectview.set(event.currentTarget.id);
  },

});


Template.wallet.helpers({
  actionsInWaiting() {
    const id = `links.contributors.${Meteor.userId()}`;
    const finished = `finishedBy.${Meteor.userId()}`;
    return Actions.find({ $and: [{ [id]: { $exists: 1 } }, { [finished]: { $exists: false } }] });
  },
  actionsToValidate() {
    const id = `links.contributors.${Meteor.userId()}`;
    const finished = `finishedBy.${Meteor.userId()}`;
    return Actions.find({ $and: [{ [id]: { $exists: 1 } }, { [finished]: 'toModerate' }] });
  },
  actionsValidate() {
    const id = `links.contributors.${Meteor.userId()}`;
    const finished = `finishedBy.${Meteor.userId()}`;
    return Actions.find({ $and: [{ [id]: { $exists: 1 } }, { [finished]: 'validated' }, { credits: { $gt: 0 } }] });
  },
  actionsSpend() {
    const id = `links.contributors.${Meteor.userId()}`;
    const finished = `finishedBy.${Meteor.userId()}`;
    return Actions.find({ $and: [{ [id]: { $exists: 1 } }, { [finished]: 'validated' }, { credits: { $lt: 0 } }] });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  selectview() {
    return Template.instance().selectview.get();
  },
  userCredit() {
    const userObjId = new Mongo.ObjectID(Meteor.userId());
    const orgId = Meteor.settings.public.orgaCibleId;
    return (Citoyens.findOne({ _id: userObjId }).userWallet[`${orgId}`].userCredits);
  },
});

Template.buttonActionFinish.helpers({
  options() {
    const actionStates = [{
      finihed: 'Fini',
      unsubscribe: 'Annuler',
    }];
    return actionStates;
  },
});

Template.whalletInputAction.onCreated(function() {
  this.displayDesc = new ReactiveVar(false);
});

Template.whalletInputAction.events({
  'click .display-desc-js'(event, instance) {
    event.preventDefault();
    if (!Template.instance().displayDesc.get()) {
      Template.instance().displayDesc.set(true);
    } else {
      Template.instance().displayDesc.set(false);
    }
  },
});
Template.whalletInputAction.helpers({
  displayDesc() {
    return Template.instance().displayDesc.get();
  },

  projectDay(date) {
    return moment(date).format(' ddd Do MMM à HH:mm ');
  },
  projectDuration(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    return Math.round(endDate.diff(startDate, 'minutes') / 60);
  },
  creditPositive(credit) {
    if (credit >= 0) {
      return true;
    }
    return false;
  },
  creditNegative(credit) {
    return -credit;
  },
  actionParticipantsNbr(actionId) {
    // const actionId = Router.current().params.id
    // const actionObjectId = new Mongo.ObjectID(actionId)
    const actionCursor = Actions.findOne({ _id: actionId });
    if (actionCursor && actionCursor.links) {
      const numberParticipant = arrayLinkProper(actionCursor.links.contributors).length;
      return numberParticipant;
    }

    return 'aucun';
  },
});

