import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Random } from 'meteor/random';
import { IonPopup } from 'meteor/meteoric:ionic';

import position from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import './changeposition.html';

const pageSession = new ReactiveDict('pageChangePosition');

Template.changePosition.onRendered(function () {
  this.autorun(function() {
    if (pageSession.get('filter')) {
      const query = pageSession.get('filter');
      Meteor.call('searchCities', query, function(error, result) {
        // console.log(result);
        if (result) {
          pageSession.set('cities', result);
        }
      });
    }
  });
});

Template.changePosition.helpers({
  cities () {
    return pageSession.get('cities');
  },
  countCities () {
    return pageSession.get('cities') && pageSession.get('cities').length;
  },
  filter () {
    return pageSession.get('filter');
  },
});

Template.changePosition.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('filter', event.currentTarget.value);
    }
  },
  'click .city'() {
    const self = this;
    IonPopup.confirm({ title: i18n.__('Location'),
      template: i18n.__('Use the position of this city'),
      onOk() {
        position.setCity(self);
        if (self.geoShape && self.geoShape.coordinates) {
          position.setOldRadius(position.getRadius());
          position.setRadius(false);
        }
        position.setGeolocate(false);
        position.setMockLocation(self.geo);
        const geoIdRandom = Random.id();
        geoId.set('geoId', geoIdRandom);
        Router.go('dashboard', { replaceState: true });
      },
      cancelText: i18n.__('no'),
      okText: i18n.__('yes'),
    });
  },
});
