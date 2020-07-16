/* eslint-disable meteor/no-session */
/* eslint-disable consistent-return */
/* global AutoForm Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';

import { Citoyens } from '../../../api/citoyens.js';
import { Organizations } from '../../../api/organizations.js';
import { LogUserActions } from '../../../api/loguseractions.js';

import './members.html';

window.Organizations = Organizations;
window.Citoyens = Citoyens;


const pageSession = new ReactiveDict('pageMembres');

Template.listMembers.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('search', null);

  self.autorun(function() {
    const handle = Meteor.subscribe('listMembers', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listMembers.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      pageSession.set('search', event.currentTarget.value);
    } else {
      pageSession.set('search', null);
    }
  }, 500),
});


Template.listMembers.helpers({
  organizations () {
    return Organizations.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
  },
  search() {
    return pageSession.get('search');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listMembersDetailCitoyens.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  pageSession.setDefault('limit', 10);
  pageSession.setDefault('incremente', 10);

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  self.autorun(function () {
    if (pageSession.get('limit')) {
      const handleCounter = Meteor.subscribe('historiqueUserActionsAllCounter', Session.get('orgaCibleId'), Router.current().params.citoyenId);
      const handle = Meteor.subscribe('listMembersDetailHistorique', Session.get('orgaCibleId'), Router.current().params.citoyenId, pageSession.get('limit'));
      self.ready.set(handle.ready() && handleCounter.ready());
    }
  });
});

Template.listMembersDetailCitoyens.onRendered(function () {
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

Template.listMembersDetailCitoyens.events({
  'click .give-me-more'(event) {
    event.preventDefault();
    const newLimit = pageSession.get('limit') + pageSession.get('incremente');
    pageSession.set('limit', newLimit);
  },
});

Template.listMembersDetailCitoyens.helpers({
  logUserActions() {
    const options = {};
    options.limit = pageSession.get('limit');
    options.sort = { createdAt: -1 };
    return LogUserActions.find({ organizationId: Session.get('orgaCibleId'), userId: Router.current().params.citoyenId }, options);
  },
  organizations() {
    return Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
  },
  citoyen() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Router.current().params.citoyenId) });
  },
  isLimit(countActions) {
    return countActions > pageSession.get('limit');
  },
  countActions() {
    return Counter.get(`historiqueUsercountActionsAll.${Session.get('orgaCibleId')}.${Router.current().params.citoyenId}`);
  },
  badgeColorTest() {
    return this.credits > 0 ? 'balanced' : 'dark';
  },
  limit() {
    return pageSession.get('limit');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.logUserActionsAdd.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function () {
    pageSession.set('citoyenId', Router.current().params.citoyenId);
  });
});

AutoForm.addHooks(['addLogUserActions'], {
  after: {
    method(error) {
      if (!error) {
        Router.go('listMembersDetailCitoyens', { _id: Session.get('orgaCibleId'), citoyenId: pageSession.get('citoyenId') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.organizationId = Session.get('orgaCibleId');
      doc.userId = pageSession.get('citoyenId');
      return doc;
    },
  },
  onError(error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(': ', ''));
      }
    }
  },
});