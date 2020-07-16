/* eslint-disable meteor/no-session */
/* global Session IonPopup */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import i18n from 'meteor/universe:i18n';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { Mongo } from 'meteor/mongo';
import { $ } from 'meteor/jquery';
import './admin.html';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions';

import '../components/directory/list.js';
import '../components/news/button-card.js';
// import '../components/news/card.js';

import { arrayLinkToModerate } from '../../api/helpers.js';


const pageSession = new ReactiveDict('pageAdmin');

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;


Template.adminDashboard.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handleScope = this.subscribe('scopeDetail', 'organizations', Session.get('orgaCibleId'));
    if (handleScope.ready()) {
      this.ready.set(handleScope.ready());
    }
  }.bind(this));
  this.selectview = new ReactiveVar('aValider');
});

Template.actionToValidate.onCreated(function() {
  this.scrollValidateAction = new ReactiveVar(false);
});

Template.actionToValidate.events({
  'click .button-validate-js'(event) {
    event.preventDefault();
    if (!Template.instance().scrollValidateAction.get()) {
      Template.instance().scrollValidateAction.set(true);
    } else {
      Template.instance().scrollValidateAction.set(false);
    }
  },
});
Template.adminDashboard.events({
  // 'click .admin-validation-js'(event, instance) {
  //   event.preventDefault();
  //   const usrId = $(event.currentTarget).attr('usrId');
  //   const actionId = $(event.currentTarget).attr('actionId');
  //   Meteor.call('ValidateAction', {
  //     actId: actionId, usrId,orgId: Session.get('orgaCibleId'),

  //   }, (err, res) => {
  //     if (err) {
  //       alert(err);
  //     } else {
  //     }
  //   });
  // },
  'click .change-selectview-js'(event) {
    event.preventDefault();
    Template.instance().selectview.set(event.currentTarget.id);
  },
});

Template.adminDashboard.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  actionToaccept() {
    const actionArray = [];
    Actions.find({ finishedBy: { $exists: true } }).forEach((action) => {
      if (action.finishedBy) {
        $.each(action.finishedBy, function(index, value) {
          if (value === 'toModerate') {
            actionArray.push(action._id);
          }
        });
      }
    });
    return Actions.find({ _id: { $in: actionArray } });
  },

  dataReady() {
    return Template.instance().ready.get();
  },
  selectview() {
    return Template.instance().selectview.get();
  },
});

Template.listProjectsAValiderRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEventsActions', 'organizations', Session.get('orgaCibleId'), 'todo');
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsAValiderRaf.helpers({
  actionToaccept() {
    return Actions.find({ finishedBy: { $exists: true } });
  },
  numberTovalidate(actions) {
    return actions && arrayLinkToModerate(actions) && arrayLinkToModerate(actions).length ? arrayLinkToModerate(actions).length : 0;
  },
  userTovalidate(actions) {
    const objIdArray = arrayLinkToModerate(actions);
    return Citoyens.find({ _id: { $in: objIdArray } });
  },
  isValidatedContributor(actions) {
    return actions && actions.countContributors() > 0;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsAValiderRaf.events({
  'click .admin-validation-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('ValidateAction', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (err) => {
        if (err) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      });
    }
  },
  'click .admin-no-validation-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('noValidateAction', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (err) => {
        if (err) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      });
    }
  },
  'click .admin-finish-action-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('finishActionAdmin', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (error) => {
        if (error) {
          IonPopup.alert({ template: i18n.__(error.reason) });
        }
      });
    }
  },
  'click .admin-sortir-action-js'(event) {
    event.preventDefault();
    const memberId = $(event.currentTarget).attr('usrId');
    const id = $(event.currentTarget).attr('actionId');
    if (memberId && id) {
      Meteor.call('exitAction', {
        id,
        memberId,
        orgId: Session.get('orgaCibleId'),
      }, (error) => {
        if (error) {
          IonPopup.alert({ template: i18n.__(error.reason) });
        }
      });
    }
  },
});

Template.listProjectsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEvents', 'organizations', Session.get('orgaCibleId'));
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsEventsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
    const handle = this.subscribe('directoryProjectsListEventsAdmin', 'organizations', Session.get('orgaCibleId'));
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsEventsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsEventsActionsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  pageSession.setDefault('limit', 10);
  pageSession.setDefault('incremente', 10);

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    if (pageSession.get('limit')) {
      const handleCounter = this.subscribe('directoryActionsAllCounter', 'organizations', Session.get('orgaCibleId'));
      const handle = this.subscribe('directoryActionsAll', 'organizations', Session.get('orgaCibleId'), 'all', pageSession.get('limit'));
      this.ready.set(handle.ready() && handleCounter.ready());
    }
  }.bind(this));
});

Template.listProjectsEventsActionsRaf.onRendered(function () {
  const showMoreVisible = () => {
    const $target = $('#showMoreResults');
    if (!$target.length) {
      return;
    }
    const threshold =
      $('.content.overflow-scroll').scrollTop() +
      $('.content.overflow-scroll').height() + 10;
    const heightLimit = $('.content.overflow-scroll .list').height();
    if (heightLimit < threshold) {
      if (!$target.data('visible')) {
        $target.data('visible', true);
        pageSession.set('limit', pageSession.get('limit') + pageSession.get('incremente'));
      }
    } else if ($target.data('visible')) {
      $target.data('visible', false);
    }
  };

  $('.content.overflow-scroll').scroll(showMoreVisible);
});

Template.listProjectsEventsActionsRaf.helpers({
  isLimit(countActions) {
    return countActions > pageSession.get('limit');
  },
  countActions() {
    return Counter.get(`countActionsAll.${Session.get('orgaCibleId')}`);
  },
  limit() {
    return pageSession.get('limit');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsEventsActionsRaf.events({
  'click .give-me-more'(event) {
    event.preventDefault();
    const newLimit = pageSession.get('limit') + pageSession.get('incremente');
    pageSession.set('limit', newLimit);
  },
});

Template.actionToValidate.helpers({
  numberTovalidate(action) {
    const actionArray = [];
    if (action.finishedBy) {
      $.each(action.finishedBy, function(index, value) {
        if (value === 'toModerate') {
          const usrId = new Mongo.ObjectID(index);
          actionArray.push(usrId);
        }
      });
    }
    return Citoyens.find({ _id: { $in: actionArray } }).count();
  },
  buttonActivate() {
    return Template.instance().scrollValidateAction.get();
  },
  userTovalidate(action) {
    const actionArray = [];
    if (action.finishedBy) {
      $.each(action.finishedBy, function(index, value) {
        if (value === 'toModerate') {
          const usrId = new Mongo.ObjectID(index);
          actionArray.push(usrId);
        }
      });
    }
    return Citoyens.find({ _id: { $in: actionArray } });
  },
});

