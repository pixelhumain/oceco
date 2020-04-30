/* eslint-disable meteor/no-session */
/* global Session IonPopup */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';

import './polesView.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.polesView.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const poleName = Router.current().params.pole;
    const handle = this.subscribe('poles.actions2', Session.get('orgaCibleId'), poleName);
    const handleEvents = this.subscribe('poles.events', Session.get('orgaCibleId'), poleName);
    if (handle.ready() && handleEvents.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.polesView.helpers({
  poleName() {
    const poleName = Router.current().params.pole;
    return poleName;
  },

  poleProjects2() {
    const poleName = Router.current().params.pole;
    const queryProjectId = `parent.${Session.get('orgaCibleId')}`;
    const projectId = Projects.find({ [queryProjectId]: { $exists: 1 } }).fetch();
    const projectsId = [];
    projectId.forEach((element) => {
      projectsId.push(element._id);
    });
    const poleProjectsCursor = Projects.find({ $and: [{ tags: poleName }, { _id: { $in: projectsId } }] });
    return poleProjectsCursor;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});


Template.projectList2.onCreated(function () {
  this.scroll = new ReactiveVar(false);
});

Template.eventsList2.onCreated(function () {
  this.scrollAction = new ReactiveVar(false);
});

Template.projectList2.helpers({
  projectEvents(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Events.find({ organizerId: projectId });
  },
  projectGlobalCount(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Events.find({ organizerId: projectId }).count() > 0 || Actions.find({ parentId: { $in: [projectId] }, status: 'todo' }).count() > 0;
  },
  projectEventsCount(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Events.find({ organizerId: projectId }).count() > 0;
  },
  projectActionsCount(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Actions.find({ parentId: projectId, status: 'todo' }).count() > 0;
  },
  projectActions(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Actions.find({ parentId: projectId, status: 'todo' });
  },
  scroll() {
    return Template.instance().scroll.get();
  },
});

Template.organizationList.helpers({
  organizationActionsCount() {
    return Actions.find({ parentId: Session.get('orgaCibleId'), status: 'todo' }).count() > 0;
  },
  organizationActions() {
    return Actions.find({ parentId: Session.get('orgaCibleId'), status: 'todo' });
  },
});

Template.eventsList2.helpers({
  scrollAction() {
    return Template.instance().scrollAction.get();
  },
});

Template.projectList2.events({
  'click .button-see-event-js'(event) {
    event.preventDefault();
    if (Template.instance().scroll.get()) {
      Template.instance().scroll.set(false);
    } else Template.instance().scroll.set(true);
  },
});
Template.eventsList2.events({
  'click .button-see-actions-js'(event) {
    event.preventDefault();
    if (Template.instance().scrollAction.get()) {
      Template.instance().scrollAction.set(false);
    } else Template.instance().scrollAction.set(true);
  },
});
Template.eventsList2.helpers({
  eventAction(eventId) {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    return Actions.find({ $and: [{ parentId: eventId }, { [userAddedAction]: { $exists: false } }, { status: 'todo' }] });
  },
  eventActionCount(eventId) {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    return Actions.find({ $and: [{ parentId: eventId }, { [userAddedAction]: { $exists: false } }, { status: 'todo' }] }).count() > 0;
  },
});

Template.itemInputAction.onCreated(function () {
  this.displayDesc = new ReactiveVar(false);
});

Template.itemInputAction.events({
  'click .display-desc-js'(event) {
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
  'click .action-assignme-js'(event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    Meteor.call('assignmeActionRooms', { id: this._id._str }, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
  'click .action-depenseme-js'(event, instance) {
    event.preventDefault();
    const self = this;
    instance.state.set('call', true);
    IonPopup.confirm({
      title: 'Depenser',
      template: 'Voulez vous depenser vos credits ?',
      onOk() {
        Meteor.call('assignmeActionRooms', {
          id: self._id._str,
        }, (error) => {
          if (error) {
            instance.state.set('call', false);
            IonPopup.alert({
              template: i18n.__(error.reason),
            });
          }
        });
      },
      onCancel() {
        instance.state.set('call', false);
      },
      cancelText: i18n.__('no'),
      okText: i18n.__('yes'),
    });
  },
});
