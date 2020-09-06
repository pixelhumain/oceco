/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { AutoForm } from 'meteor/aldeed:autoform';
import { IonPopup } from 'meteor/meteoric:ionic';

import './messages.html';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

import { nameToCollection } from '../../api/helpers.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageSearchMessages');

Template.pageMessages.onCreated(function () {
  this.ready = new ReactiveVar();
  pageSession.set('error', false);
  this.autorun(function () {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function () {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    if (handle.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});


Template.pageMessages.helpers({
  scope() {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    // return undefined;
  },
  scopeId() {
    return pageSession.get('scopeId');
  },
  scopeVar() {
    return pageSession.get('scope');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  error() {
    return pageSession.get('error');
  },
});


AutoForm.addHooks(['formMessages'], {
  before: {
    method(doc) {
      pageSession.set('error', null);
      const scopeId = pageSession.get('scopeId');
      const scope = pageSession.get('scope');
      doc.parentId = scopeId;
      doc.parentType = scope;
      return doc;
    },
  },
  after: {
    method(error) {
      if (!error) {
        pageSession.set('error', null);
      }
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(':', ' '));
        IonPopup.alert({ template: i18n.__(error.reason.replace(':', ' ')) });
      } else {
        pageSession.set('error', error.reason.replace(':', ' '));
      }
    }
  },
});
