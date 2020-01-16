import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

import './home.html';
import { arrayLinkProper, nameToCollection } from '../../api/helpers';

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
  this.readyScopeDetail = new ReactiveVar(false);
  this.autorun(function () {
    const handle = Meteor.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
    this.readyScopeDetail.set(handle.ready());
  }.bind(this));
  this.sortByDate = new ReactiveVar(false);
  this.sortByDay = new ReactiveVar(false);
});

Template.home.helpers({
  scope () {
    return Organizations.findOne({ _id: new Mongo.ObjectID(Meteor.settings.public.orgaCibleId) });
  },
  dataReadyScopeDetail() {
    return Template.instance().readyScopeDetail.get();
  },
});

Template.listProjectsEventsRafHome.onCreated(function () {
  this.ready = new ReactiveVar();
  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEvents', 'organizations', Meteor.settings.public.orgaCibleId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsEventsRafHome.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
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

Template.itemInputActionDetail.inheritsHelpersFrom('itemInputAction');


Template.buttonSubscribeAction.events({
  'click .action-assignme-js' (event) {
    event.preventDefault();
    Meteor.call('assignmeActionRooms', { id: this._id._str }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
  'click .action-depenseme-js' (event) {
    event.preventDefault();
    const self = this;
    IonPopup.confirm({
      title: 'Depenser',
      template: 'Voulez vous depenser vos credits ?',
      onOk() {
        Meteor.call('assignmeActionRooms', {
          id: self._id._str,
        }, (error) => {
          if (error) {
            IonPopup.alert({
              template: i18n.__(error.reason),
            });
          }
        });
      },
      onCancel() {

      },
      cancelText: i18n.__('no'),
      okText: i18n.__('yes'),
    });
  },
});

