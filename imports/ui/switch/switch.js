import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// collection
import { Organizations } from '../../api/organizations.js';

import './switch.html';

window.Organizations = Organizations;

Template.switch.onCreated(function () {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('orga.switch');
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.switch.helpers({
  OrganizationsOceco() {
    return Organizations.find({ oceco: true });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
