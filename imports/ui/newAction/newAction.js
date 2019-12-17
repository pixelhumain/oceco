import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions';
import { moment } from 'meteor/momentjs:moment';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;

import './newAction.html'
import { pageSession } from '../../api/client/reactive';

Template.newAction.onCreated(function(){
    Meteor.subscribe('notificationsUser');
    this.subscribe('projects.actions','5de9df6d064fca0d008b4568' )
    this.autorun(function() {
        pageSession.set('scopeId', "5deb282c064fca0c008b4569");
        pageSession.set('scope', "projects");
        pageSession.set('roomId',"5dedd02f064fca0d008b4568");
      });
})

AutoForm.addHooks(['addAction', 'editAction'], {
    after: {
      method(error, result) {
        if (!error) {
          Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
        }
      },
      'method-update'(error, result) {
        if (!error) {
          Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
        }
      },
    },
    before: {
      method(doc) {
        doc.parentType = pageSession.get('scope');
        doc.parentId = pageSession.get('scopeId');
        doc.idParentRoom = pageSession.get('roomId');
  
        return doc;
      },
      'method-update'(modifier) {
        modifier.$set.parentType = pageSession.get('scope');
        modifier.$set.parentId = pageSession.get('scopeId');
        modifier.$set.idParentRoom = pageSession.get('roomId');
  
        return modifier;
      },
    },
    onError(formType, error) {
      if (error.errorType && error.errorType === 'Meteor.Error') {
        if (error && error.error === 'error_call') {
          pageSession.set('error', error.reason.replace(': ', ''));
        }
      }
    },
  });