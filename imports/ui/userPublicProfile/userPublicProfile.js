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

import './userPublicProfile.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;

Template.userPublicProfile.onCreated(function() {
  const memberId = Router.current().params.id;
  this.subscribe('projects.actions', Meteor.settings.public.orgaCibleId);
  this.subscribe('member.profile', memberId);
});

Template.userPublicProfile.helpers({
  userLooked() {
    const memberId = Router.current().params.id;
    const id = new Mongo.ObjectID(memberId);
    console.log(Citoyens.find({ _id: id }).fetch());
    return Citoyens.findOne({ _id: id });
  },
})
;
