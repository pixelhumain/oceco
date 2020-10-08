import { SubsManager } from 'meteor/meteorhacks:subs-manager';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import position from './position.js';
import { geoId } from './reactive.js';

export const listEventsSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});
export const listSousEventsSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});

export const newsListSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});
export const filActusSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});

export const listsSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});
export const invitationsSubs = new SubsManager({
  cacheLimit: 500,
  expireIn: 60,
});

export const notificationsSubs = new SubsManager({
  cacheLimit: 100,
  expireIn: 60,
});

export const actionsSubs = new SubsManager({
  cacheLimit: 100,
  expireIn: 60,
});


export const singleSubs = new SubsManager();


export const scopeSubscribe = (context, submanager, subscribe, scope) => {
  const self = context;
  self.ready = new ReactiveVar();
  if (scope === 'dashboard') {
    if (!geoId.get('geoId')) {
      const geoIdRandom = Random.id();
      geoId.set('geoId', geoIdRandom);
      // console.log(geoId.get('geoId'));
    }
  }

  // mettre sur layer ?
  Meteor.subscribe('citoyen');

  self.autorun(function() {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      // console.log(`sub list ${scope} geo radius`);
      let handle;
      if (scope === 'dashboard') {
        handle = submanager.subscribe(subscribe, geoId.get('geoId'), latlngObj, radius);
      } else {
        handle = submanager.subscribe(subscribe, scope, latlngObj, radius);
      }
      self.ready.set(handle.ready());
    } else {
      // console.log(`sub list ${scope} city`);
      const city = position.getCity();
      if (city && city.geoShape && city.geoShape.coordinates) {
        let handle;
        if (scope === 'dashboard') {
          handle = submanager.subscribe(subscribe, geoId.get('geoId'), city.geoShape);
        } else {
          handle = submanager.subscribe(subscribe, scope, city.geoShape);
        }
        self.ready.set(handle.ready());
      }
    }
  });
};
