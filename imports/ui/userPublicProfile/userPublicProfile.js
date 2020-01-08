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
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const memberId = Router.current().params.id;
    const handle = this.subscribe('projects.actions', Meteor.settings.public.orgaCibleId);
    const handleProfile = this.subscribe('member.profile', memberId);
    if (handle.ready() && handleProfile.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.userPublicProfile.helpers({
  userLooked() {
    const memberId = Router.current().params.id;
    const id = new Mongo.ObjectID(memberId);
    console.log(Citoyens.find({ _id: id }).fetch());
    return Citoyens.findOne({ _id: id });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
})
;
