/* eslint-disable meteor/no-session */
/* global Session IonPopup */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';

import { searchAction } from '../../api/client/reactive.js';
import { searchQuery, searchQuerySort } from '../../api/helpers.js';

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
    const query = {};
    const projectId = projectObjectId.valueOf();
    query[`organizer.${projectId}`] = { $exists: true };

    const options = {};
    const searchSort = searchAction.get('searchSort');
    if (searchSort) {
      const arraySort = searchQuerySort('events', searchSort);
      if (arraySort) {
        options.sort = arraySort;
      }
    }

    return Events.find(query, options);
  },
  projectGlobalCount(projectObjectId) {
    const search = searchAction.get('search');
    const projectId = projectObjectId.valueOf();
    if (search && search.charAt(0) === ':' && search.length > 1) {
      return true;
    }
    let query = {};
    const organizerExist = `organizer.${projectId}`;
    query.parentId = projectId;
    query.status = 'todo';
    if (search) {
      query = searchQuery(query, search);
    }

    return Events.find({ [organizerExist]: { $exists: true } }).count() > 0 || Actions.find(query).count() > 0;
  },
  projectEventsCount(projectObjectId) {
    const query = {};
    const projectId = projectObjectId.valueOf();
    query[`organizer.${projectId}`] = { $exists: true };
    return Events.find(query).count();
  },
  projectActionsCount(projectObjectId) {
    const search = searchAction.get('search');
    const projectId = projectObjectId.valueOf();

    let query = {};
    query.parentId = projectId;
    query.status = 'todo';
    if (search) {
      query = searchQuery(query, search);
    }

    return Actions.find(query).count();
  },
  projectActions(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    const search = searchAction.get('search');
    let query = {};
    query.parentId = projectId;
    query.status = 'todo';
    if (search) {
      query = searchQuery(query, search);
    }

    const options = {};
    const searchSort = searchAction.get('searchSort');
    if (searchSort) {
      const arraySort = searchQuerySort('actions', searchSort);
      if (arraySort) {
        options.sort = arraySort;
      }
    }

    return Actions.find(query, options);
  },
  scroll() {
    if (searchAction.get('search')) {
      return true;
    }
    return Template.instance().scroll.get();
  },
});

Template.organizationList.onCreated(function () {
  this.scrollOrga = new ReactiveVar(false);
});

Template.organizationList.helpers({
  organizationActionsCount() {
    const search = searchAction.get('search');
    let query = {};
    query.parentId = Session.get('orgaCibleId');
    query.status = 'todo';
    if (search) {
      query = searchQuery(query, search);
    }

    return Actions.find(query).count() > 0;
  },
  organizationActions() {
    const search = searchAction.get('search');
    let query = {};
    query.parentId = Session.get('orgaCibleId');
    query.status = 'todo';
    if (search) {
      query = searchQuery(query, search);
    }

    const options = {};
    const searchSort = searchAction.get('searchSort');
    if (searchSort) {
      const arraySort = searchQuerySort('actions', searchSort);
      if (arraySort) {
        options.sort = arraySort;
      }
    }

    return Actions.find(query, options);
  },
  scrollOrga() {
    if (searchAction.get('search')) {
      return true;
    }
    return Template.instance().scrollOrga.get();
  },
});

Template.organizationList.events({
  'click .button-see-orga-js'(event) {
    event.preventDefault();
    if (Template.instance().scrollOrga.get()) {
      Template.instance().scrollOrga.set(false);
    } else Template.instance().scrollOrga.set(true);
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
    const search = searchAction.get('search');
    let query = {};
    query.parentId = eventId;
    query.status = 'todo';
    query[userAddedAction] = { $exists: false };
    if (search) {
      query = searchQuery(query, search);
    }

    const options = {};
    const searchSort = searchAction.get('searchSort');
    if (searchSort) {
      const arraySort = searchQuerySort('actions', searchSort);
      if (arraySort) {
        options.sort = arraySort;
      }
    }

    return Actions.find(query, options);
  },
  eventActionCount(eventId) {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    const search = searchAction.get('search');
    let query = {};
    query.parentId = eventId;
    query.status = 'todo';
    query[userAddedAction] = { $exists: false };
    if (search) {
      query = searchQuery(query, search);
    }
    return Actions.find(query).count();
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
  'click .action-redirect-js'(event) {
    event.preventDefault();
    Router.go('actionsDetail', { _id: this.action.parentId, scope: this.action.parentType, roomId: this.action.idParentRoom, actionId: this.action._id._str });
  },
});

Template.itemInputActionTags.events({
  'click .searchtag-js'(event) {
    event.preventDefault();
    if (this) {
      searchAction.set('search', `#${this}`);
    } else {
      searchAction.set('search', null);
    }
  }
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
  startDateDefault() {
    return moment().format('YYYY-MM-DDTHH:mm');
  }
});

Template.buttonSubscribeAction.events({
  'submit .form-assignme-js'(event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    const action = { id: this._id._str };

    if (!this.startDate && event.target && event.target.startDate && event.target.startDate.value) {
      action.startDate = moment(event.target.startDate.value).format('YYYY-MM-DDTHH:mm:ssZ');
      // console.log(action.startDate);
    }
    if (!this.endDate && event.target && event.target.endDate && event.target.endDate.value) {
      action.endDate = moment(event.target.endDate.value).format('YYYY-MM-DDTHH:mm:ssZ');
      // console.log(action.endDate);
    }


    Meteor.call('assignmeActionRooms', action, (error) => {
      if (error) {
        instance.state.set('call', false);
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
    

  },
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
