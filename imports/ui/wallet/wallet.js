/* eslint-disable meteor/no-session */
/* global IonPopup Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';
import { Rooms } from '../../api/rooms.js';


import './wallet.html';


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;
window.Rooms = Rooms;

Template.wallet.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.selectview = new ReactiveVar('aFaire');
  this.autorun(function () {
    if (this.selectview.get() === 'valides') {
      const handle = this.subscribe('user.actions.historique', 'organizations', Session.get('orgaCibleId'));
      if (handle.ready()) {
        this.ready.set(handle.ready());
      }
    } else {
      const handle = this.subscribe('user.actions', 'organizations', Session.get('orgaCibleId'), this.selectview.get());
      if (handle.ready()) {
        this.ready.set(handle.ready());
      }
    }
  }.bind(this));
});


Template.buttonActionFinish.events({
  'click .finish-action-js' (event) {
    event.preventDefault();
    const actionId = this.action._id._str;
    Meteor.call('finishAction', {
      id: actionId,
    }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
  'click .sortir-action-js' (event) {
    event.preventDefault();
    const actionId = this.action._id._str;
    const orgId = Session.get('orgaCibleId');
    Meteor.call('exitAction', {
      id: actionId, orgId,
    }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
});

Template.wallet.events({
  'click .change-selectview-js'(event) {
    event.preventDefault();
    Template.instance().selectview.set(event.currentTarget.id);
  },

});


Template.wallet.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  selectview() {
    return Template.instance().selectview.get();
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
  'click .display-desc-js'(event) {
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
});

Template.whalletInputInWaitingAction.helpers({
  badgeColorTest() {
    return this.action.credits > 0 ? this.badgeColor : this.badgeColorDepense;
  },
});

