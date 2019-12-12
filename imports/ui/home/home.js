import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import './home.html'

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.home.onCreated(function(){
    Meteor.subscribe('notificationsUser');
    this.subscribe('projects.actions','5de9df6d064fca0d008b4568' )
    this.subscribe('scopeDetail', 'organizations', '5de9df6d064fca0d008b4568');
    this.subscribe('directoryList', 'organizations', '5de9df6d064fca0d008b4568');
    this.subscribe('directoryListProjects', 'organizations', '5de9df6d064fca0d008b4568');
})