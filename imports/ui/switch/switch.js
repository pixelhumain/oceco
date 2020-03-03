import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

// collection
import { Organizations } from '../../api/organizations.js';
import { Citoyens } from '../../api/citoyens.js';

// submanager
// import { singleSubs } from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';
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