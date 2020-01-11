import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import i18n from 'meteor/universe:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { IonPopup, IonModal, IonLoading } from 'meteor/meteoric:ionic';

// submanager
// import { profileSubs, filActusSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Poi } from '../../api/poi.js';
import { Classified } from '../../api/classified.js';
import { Citoyens } from '../../api/citoyens.js';
import { Rooms } from '../../api/rooms.js';

import './profile.html';

// import '../components/directory/list.js';
import '../components/news/button-card.js';
import '../components/news/card.js';


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Poi = Poi;
window.Classified = Classified;
window.Citoyens = Citoyens;
window.Rooms = Rooms;

const pageSession = new ReactiveDict('pageProfile');

Template.profile.onCreated(function () {
  this.readyScopeDetail = new ReactiveVar();

  this.autorun(function () {
    const handle = Meteor.subscribe('scopeDetail', 'citoyens', Meteor.userId());
    this.readyScopeDetail.set(handle.ready());
  }.bind(this));
});

Template.profile.helpers({
  scope() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) });
  },
  scopeCardTemplate() {
    return 'listCardcitoyens';
  },
  dataReadyScopeDetail() {
    return Template.instance().readyScopeDetail.get();
  },
  selectview() {
    return pageSession.get('selectview');
  },
  scopeMe() {
    return true;
  },
});


