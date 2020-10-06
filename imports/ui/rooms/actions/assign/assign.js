/* eslint-disable meteor/no-session */
/* global IonPopup Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';

import { Organizations } from '../../../../api/organizations.js';
import { Actions } from '../../../../api/actions.js';

import { pageSession } from '../../../../api/client/reactive.js';

import './assign.html';
import { Projects } from '../../../../api/projects.js';

window.Organizations = Organizations;

Template.assignMembers.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('search', null);

  self.autorun(function () {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  self.autorun(function() {
    const handle = Meteor.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    const handleMember = Meteor.subscribe('listAssignActions', Session.get('orgaCibleId'), Router.current().params.actionId);
    self.ready.set(handle.ready() && handleMember.ready());
  });
});

Template.assignMembers.helpers({
  organizations () {
    return Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
  },
  actions () {
    const action = Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
    return action;
  },
  listAssignActions(search) {
    const action = Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
    let listMembers = [];
    const listMembersActions = orgaOne.listMembersActions(Router.current().params.actionId, search);
    if (action.parentType === 'projects') {
      const listContributorsActions = Projects.findOne({ _id: new Mongo.ObjectID(action.parentId) }).listContributorsActions(Router.current().params.actionId, search);
      listMembers = [...listContributorsActions.fetch(), ...listMembersActions.fetch()];
    } else {
      listMembers = [...listMembersActions.fetch()];
    }

    const listMembersUnique = listMembers.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);

    return listMembersUnique.sort((a, b) => {
      if (a.assign > b.assign) {
        return -1;
      }
      if (a.assign < b.assign) {
        return 1;
      }
      if (a.assign === b.assign && a.assign === 1) {
        return -1;
      }
      if (a.assign === b.assign && a.assign === 0) {
        return 1;
      }
      return 0;
    });
  },
  countMembers(search) {
    const action = Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
    let listMembers = [];
    const listMembersActions = orgaOne.listMembersActions(Router.current().params.actionId, search);
    if (action.parentType === 'projects') {
      const listContributorsActions = Projects.findOne({ _id: new Mongo.ObjectID(action.parentId) }).listContributorsActions(Router.current().params.actionId, search);
      listMembers = [...listContributorsActions.fetch(), ...listMembersActions.fetch()];
    } else {
      listMembers = [...listMembersActions.fetch()];
    }
    const listMembersUnique = listMembers.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
    const countMembers = listMembersUnique && listMembersUnique.length ? listMembersUnique.length : 0;
    return countMembers;
  },
  search () {
    return pageSession.get('search');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

/*
admin : assigner un user à une action
admin : de-assigner un user à une action
*/

Template.assignMembers.events({
  'click .assignmember-js' (event) {
    event.preventDefault();
    Meteor.call('assignMemberActionRooms', { id: pageSession.get('actionId'), memberId: this._id._str }, (error) => {
      if (error) {
        // instance.state.set('call', false);
        // IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
  'click .unassignmember-js' (event) {
    event.preventDefault();
    const actionId = pageSession.get('actionId');
    const orgId = Session.get('orgaCibleId');
    Meteor.call('exitAction', {
      id: actionId, orgId, memberId: this._id._str,
    }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
  'keyup #search, change #search': _.debounce((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      pageSession.set('search', event.currentTarget.value);
    } else {
      pageSession.set('search', null);
    }
  }, 500),
});
