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

// submanager
// import { singleSubs } from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';

import './polesView.html'
import { Helpers } from 'meteor/raix:handlebar-helpers';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.polesView.onCreated(function() {
    let poleName = Router.current().params.pole
    Meteor.subscribe('notificationsUser');
    this.subscribe('projects.inscription', '5de9df6d064fca0d008b4568')
    this.subscribe('poles.actions','5de9df6d064fca0d008b4568', poleName )
// this.subscribe('scopeDetail', 'organizations', '5de9df6d064fca0d008b4568');
// this.subscribe('directoryList', 'organizations', '5de9df6d064fca0d008b4568');
// this.subscribe('directoryListProjects', 'organizations', '5de9df6d064fca0d008b4568');
  })
Template.polesView.helpers({
    poleName() {
        let poleName = Router.current().params.pole
        console.log(poleName)
        return  poleName
    }
})
  