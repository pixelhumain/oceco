/* eslint-disable no-dupe-keys */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { _ } from 'meteor/underscore';
import { HTTP } from 'meteor/http';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';

// collection
import { ActivityStream } from '../activitystream.js';
import { Citoyens } from '../citoyens.js';
import { News } from '../news.js';
import { Cities } from '../cities.js';
import { Events } from '../events.js';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { Comments } from '../comments.js';
import { Lists } from '../lists.js';
// DDA
import { Actions } from '../actions.js';
import { LogUserActions } from '../loguseractions.js';
import { Resolutions } from '../resolutions.js';
import { Rooms } from '../rooms.js';
import { Proposals } from '../proposals.js';

import { nameToCollection, arrayLinkProperNoObject, arrayLinkParentNoObject, arrayChildrenParent, queryOrPrivateScope } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Citoyens = Citoyens;
global.News = News;
global.Actions = Actions;
global.Resolutions = Resolutions;
global.Rooms = Rooms;
global.Proposals = Proposals;

Events._ensureIndex({
  geoPosition: '2dsphere',
});
Projects._ensureIndex({
  geoPosition: '2dsphere',
});
Organizations._ensureIndex({
  geoPosition: '2dsphere',
});
Citoyens._ensureIndex({
  geoPosition: '2dsphere',
});
Cities._ensureIndex({
  geoShape: '2dsphere',
});
/* collection.rawCollection().createIndex(
{ geoPosition: "2dsphere"},
{ background: true }
, (e) => {
if(e){
console.log(e)
}
}); */

// eslint-disable-next-line meteor/audit-argument-checks

Meteor.publish('globalautocomplete', function(query) {
  check(query, {
    name: String,
    searchType: Array,
    searchBy: String,
    indexMin: Number,
    indexMax: Number,
  });

  const self = this;
  try {
    const response = HTTP.post(`${Meteor.settings.endpoint}/communecter/search/globalautocomplete`, {
      params: query,
    });
    _.each(response.data, function(item) {
      const doc = item;
      self.added('search', Random.id(), doc);
    });
    self.ready();
  } catch (error) {
    // console.log(error);
  }
});

Meteor.publish('lists', function(name) {
  if (!this.userId) {
    return null;
  }
  check(name, String);
  const lists = Lists.find({ name });
  return lists;
});

Meteor.publish('notificationsUser', function() {
  if (!this.userId) {
    return null;
  }
  Counts.publish(this, `notifications.${this.userId}.Unseen`, ActivityStream.api.queryUnseen(this.userId), { noReady: true });
  Counts.publish(this, `notifications.${this.userId}.Unread`, ActivityStream.api.queryUnread(this.userId), { noReady: true });
  return ActivityStream.api.isUnread(this.userId);
});

Meteor.publish('notificationsScope', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  if (!collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isAdmin(this.userId)) {
    return null;
  }
  const scopeCap = scope.charAt(0).toUpperCase() + scope.slice(1, -1);
  Counts.publish(this, `notifications.${scopeId}.Unseen`, ActivityStream.api.queryUnseen(this.userId, scopeId, scopeCap), { noReady: true });
  Counts.publish(this, `notifications.${scopeId}.Unread`, ActivityStream.api.queryUnread(this.userId, scopeId, scopeCap), { noReady: true });
  Counts.publish(this, `notifications.${scopeId}.UnseenAsk`, ActivityStream.api.queryUnseenAsk(this.userId, scopeId, scopeCap), { noReady: true });
  return collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).listNotifications(this.userId);
});

Meteor.publish('getcitiesbylatlng', function(latlng) {
  check(latlng, { latitude: Number, longitude: Number });
  if (!this.userId) {
    return null;
  }

  return Cities.find({ geoShape:
    { $geoIntersects:
      { $geometry: { type: 'Point',
        coordinates: [latlng.longitude, latlng.latitude] },
      },
    },
  });
});

Meteor.publish('cities', function(cp, country) {
  if (!this.userId) {
    return null;
  }
  check(cp, String);
  check(country, String);
  const lists = Cities.find({ 'postalCodes.postalCode': cp, country });
  return lists;
});

Meteor.publish('orga.switch', function () {
  if (!this.userId) {
    return null;
  }
  const lists = Organizations.find({ oceco: { $exists: true } });
  return lists;
});


Meteor.publish('organizerEvents', function(organizerType) {
  if (!this.userId) {
    return null;
  }
  check(organizerType, String);
  check(organizerType, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens'], name);
  }));
  if (organizerType === 'organizations') {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).listOrganizationsCreator();
  } else if (organizerType === 'projects') {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).listProjectsCreator();
  } else if (organizerType === 'citoyens') {
    return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, { fields: { _id: 1, name: 1 } });
  }
});


Meteor.publish('citoyen', function() {
  if (!this.userId) {
    return null;
  }
  const objectId = new Mongo.ObjectID(this.userId);
  const citoyen = Citoyens.find({ _id: objectId }, { fields: { pwd: 0 } });
  return citoyen;
});

// eslint-disable-next-line meteor/audit-argument-checks
Meteor.publish('geo.dashboard', function (geoId, latlng, radius) {
  if (!this.userId) {
    return null;
  }
  check(geoId, String);
  check(latlng, Object);
  const query = {};
  if (radius) {
    check(radius, Number);
    check(latlng.longitude, Number);
    check(latlng.latitude, Number);
    query.geoPosition = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [latlng.longitude, latlng.latitude],
        },
        $maxDistance: radius,
      },
    };
  } else {
    check(latlng.type, String);
    check(latlng.coordinates, Array);
    query.geoPosition = {
      $geoIntersects: {
        $geometry: {
          type: latlng.type,
          coordinates: latlng.coordinates,
        },
      },
    };
  }
  // console.log(geoId);

  const counterEvents = new Counter(`countScopeGeo.${geoId}.events`, Events.find(query));
  const counterOrganizations = new Counter(`countScopeGeo.${geoId}.organizations`, Organizations.find(query));
  const counterProjects = new Counter(`countScopeGeo.${geoId}.projects`, Projects.find(query));
  query._id = { $ne: new Mongo.ObjectID(this.userId) };
  const counterCitoyens = new Counter(`countScopeGeo.${geoId}.citoyens`, Citoyens.find(query));

  return [
    counterEvents,
    counterOrganizations,
    counterProjects,
    counterCitoyens,
  ];
});

// eslint-disable-next-line meteor/audit-argument-checks
Meteor.publish('geo.dashboardOld', function(geoId, latlng, radius) {
  const query = {};
  if (radius) {
    query.geoPosition = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [latlng.longitude, latlng.latitude],
        },
        $maxDistance: radius,
      } };
  } else {
    query.geoPosition = {
      $geoIntersects: {
        $geometry: {
          type: latlng.type,
          coordinates: latlng.coordinates,
        },
      },
    };
  }
  // console.log(geoId);
  Counts.publish(this, `countScopeGeo.${geoId}.events`, Events.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.organizations`, Organizations.find(query));
  Counts.publish(this, `countScopeGeo.${geoId}.projects`, Projects.find(query));

  query._id = { $ne: new Mongo.ObjectID(this.userId) };
  Counts.publish(this, `countScopeGeo.${geoId}.citoyens`, Citoyens.find(query));
});


// Geo scope
// scope string collection
// latlng object
// radius string
Meteor.publishComposite('geo.scope', function(scope, latlng, radius) {
  // check(latlng, Object);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const options = {};
      options._disableOplog = true;
      if (scope === 'citoyens') {
        // options.fields = { pwd: 0 };
      }

      options.fields = { _id: 1,
        profilThumbImageUrl: 1,
        profilMarkerImageUrl: 1,
        type: 1,
        startDate: 1,
        endDate: 1,
        geo: 1,
        name: 1,
        parent: 1,
        organizer: 1,
        organizerType: 1,
        organizerId: 1,
        parentType: 1,
        parentId: 1,
        creator: 1,
        geoPosition: 1,
        'address.codeInsee': 1,
        tags: 1 };

      const query = {};
      if (radius) {
        query.geoPosition = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [latlng.longitude, latlng.latitude],
            },
            $maxDistance: radius,
          } };
      } else {
        query.geoPosition = {
          $geoIntersects: {
            $geometry: {
              type: latlng.type,
              coordinates: latlng.coordinates,
            },
          },
        };
      }
      if (scope === 'citoyens') {
        query._id = { $ne: new Mongo.ObjectID(this.userId) };
      }
      if (scope === 'events') {
        query.endDate = { $gte: new Date() };
      }

      // Counts.publish(this, `countScopeGeo.${scope}`, collection.find(query), { noReady: true });
      return collection.find(query, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'events') {
            return scopeD.listEventTypes();
          } else if (scope === 'organizations') {
            return scopeD.listOrganisationTypes();
          }
        },
      },
      ...arrayChildrenParent(scope, ['events', 'projects', 'organizations', 'citoyens']),
    ] };
});


Meteor.publishComposite('scopeDetail', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens', 'actions', 'rooms', 'proposals', 'resolutions'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      //
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({ parentId: scopeId }), { noReady: true });
      }

      let query = {};

      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId), 'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId), 'preferences.private': { $exists: false },
        });


        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      // console.log(query);
      return collection.find(query, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'events') {
            return scopeD.listEventTypes();
          } else if (scope === 'organizations') {
            return scopeD.listOrganisationTypes();
          }
        },
      },
      {
        find(scopeD) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(scopeD.creator),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        },
      },
      {
        find() {
          if (scope !== 'citoyens') {
            return Citoyens.find({
              _id: new Mongo.ObjectID(this.userId),
            }, {
              fields: {
                name: 1,
                links: 1,
                collections: 1,
                profilThumbImageUrl: 1,
              },
            });
          }
        },
      },
      ...arrayChildrenParent(scope, ['events', 'projects', 'organizations', 'citoyens']),
      {
        find(scopeD) {
          if (scopeD && scopeD.address && scopeD.address.postalCode) {
            return Cities.find({
              'postalCodes.postalCode': scopeD.address.postalCode,
            });
          }
        },
      },
    ] };
});

Meteor.publish('citoyenActusListCounter', function () {
  if (!this.userId) {
    return null;
  }
  return new Counter(`countActus.${this.userId}`, Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).newsActus(this.userId));
});

Meteor.publishComposite('citoyenActusList', function(limit) {
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scopeD && scopeD.address && scopeD.address.postalCode) {
            return Cities.find({
              'postalCodes.postalCode': scopeD.address.postalCode,
            });
          }
        },
      },
      {
        find(scopeD) {
          // Counts.publish(this, `countActus.${this.userId}`, scopeD.newsActus(this.userId), { noReady: true });
          return scopeD.newsActus(this.userId, limit);
        },
        children: [
          {
            find(news) {
              /* ////console.log(news.author); */
              return Citoyens.find({
                _id: new Mongo.ObjectID(news.author),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }, /* ,
            children: [
              {
                find(citoyen) {
                  return citoyen.documents();
                },
              },
            ], */
          },
          {
            find(news) {
              return news.photoNewsAlbums();
            },
          },
          {
            find(news) {
              const queryOptions = { fields: {
                _id: 1,
                name: 1,
                profilThumbImageUrl: 1,
              } };
              if (news.target && news.target.type && news.target.id) {
                const collection = nameToCollection(news.target.type);
                return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
              }
            },
          }, /*
          {
            find(news) {
              if (news.target && news.target.type && news.target.id) {
                return Documents.find({
                  id: news.target.id,
                  contentKey: 'profil',
                }, { sort: { created: -1 }, limit: 1 });
              }
            },
          }, */
          {
            find(news) {
              const queryOptions = {};
              if (news.object && news.object.type === 'actions') {
                queryOptions.fields = {
                  _id: 1,
                  name: 1,
                  idParentRoom: 1,
                  profilThumbImageUrl: 1,
                };
              } else if (news.object && news.object.type === 'proposals') {
                queryOptions.fields = {
                  _id: 1,
                  title: 1,
                  idParentRoom: 1,
                  profilThumbImageUrl: 1,
                };
              } else {
                queryOptions.fields = {
                  _id: 1,
                  name: 1,
                  profilThumbImageUrl: 1,
                };
              }
              if (news.object && news.object.type && news.object.id) {
                // console.log(news.object.type);
                const collection = nameToCollection(news.object.type);
                return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
              }
            },
          }, /*
          {
            find(news) {
              if (news.object && news.object.type && news.object.id) {
                return Documents.find({
                  id: news.object.id,
                  contentKey: 'profil',
                }, { sort: { created: -1 }, limit: 1 });
              }
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('collectionsList', function(scope, scopeId, type) {
  check(scopeId, String);
  check(type, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['eventTypes', 'organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'citoyens');
        },
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'organizations');
        },
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'projects');
        },
      },
      {
        find(scopeD) {
          return scopeD.listCollections(type, 'events');
        },
      },
    ] };
});

Meteor.publishComposite('directoryList', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        // options.fields = { pwd: 0 };
      }

      options.fields = { _id: 1,
        profilThumbImageUrl: 1,
        type: 1,
        name: 1,
        parent: 1,
        organizer: 1,
        preferences: 1,
        creator: 1,
        tags: 1,
        links: 1 };

      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};

      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }

      return collection.find(query, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['eventTypes', 'organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listFollowers();
          } else if (scope === 'organizations') {
            return scopeD.listFollowers();
          } else if (scope === 'projects') {
            return scopeD.listFollowers();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listFollows();
          } else if (scope === 'organizations') {
            return scopeD.listMembers();
          } else if (scope === 'projects') {
            return scopeD.listContributors();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listMemberOf();
          } else if (scope === 'organizations') {
            return scopeD.listMembersOrganizations();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations') {
            return scopeD.listProjects();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects') {
            return scopeD.listEvents();
          }
        }, /* ,
        children: [
          {
            find(scopeD) {
              return scopeD.documents();
            },
          },
        ], */
      }, /* ,
      {
        find(scopeD) {
          return scopeD.documents();
        },
      }, */
    ] };
},
);

Meteor.publishComposite('directoryListEvents', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      return collection.find(query, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['eventTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listEventsCreator();
          }
        },
        children: arrayChildrenParent(scope, ['citoyens', 'organizations', 'projects', 'events']),
        /* [
          {
            find(scopeD) {
              if (scopeD.organizerType && scopeD.organizerId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.organizerType)) {
                const collectionType = nameToCollection(scopeD.organizerType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.organizerId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ], */
      },
    ] };
});

Meteor.publishComposite('directoryProjectsListEvents', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['organizations'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = {
          pwd: 0,
        };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      return collection.find(query, options);
    },
    children: [{
      find() {
        return Lists.find({
          name: {
            $in: ['eventTypes'],
          },
        });
      },
    },
    {
      find(scopeD) {
        if (scope === 'organizations') {
          return scopeD.listProjectsEventsCreator();
        }
      },
      children: arrayChildrenParent('events', ['citoyens', 'organizations', 'projects', 'events']),
      /* [
          {
            find(scopeD) {
              if (scopeD.organizerType && scopeD.organizerId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.organizerType)) {
                const collectionType = nameToCollection(scopeD.organizerType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.organizerId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ], */
    },
    ],
  };
});

Meteor.publishComposite('directoryProjectsListEventsAdmin', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['organizations'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = {
          pwd: 0,
        };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      return collection.find(query, options);
    },
    children: [{
      find() {
        return Lists.find({
          name: {
            $in: ['eventTypes'],
          },
        });
      },
    },
    {
      find(scopeD) {
        if (scope === 'organizations') {
          return scopeD.listProjectsEventsCreatorAdmin1M();
        }
      },
      children: arrayChildrenParent('events', ['citoyens', 'organizations', 'projects', 'events']),
    },
    ],
  };
});

Meteor.publish('directoryActionsAllCounter', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }
  const collection = nameToCollection(scope);
  return new Counter(`countActionsAll.${scopeId}`, collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).listProjectsEventsActionsCreatorAdmin('all'));
});

Meteor.publishComposite('directoryActionsAll', function (scope, scopeId, etat, limit) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  check(etat, Match.Maybe(String));
  check(limit, Match.Maybe(Number));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = {
          pwd: 0,
        };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      return collection.find(query, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listProjectsEventsActionsCreatorAdmin('all', limit);
          }
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listProjectsEventsCreatorAdmin1M();
          }
        },
      },
    ],
  };
});

Meteor.publishComposite('directoryProjectsListEventsActions', function (scope, scopeId, etat) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  check(etat, Match.Maybe(String));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = {
          pwd: 0,
        };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      // console.log(query);
      return collection.find(query, options);
    },
    children: [{
      find() {
        return Lists.find({
          name: {
            $in: ['eventTypes'],
          },
        });
      },
    },
    {
      find(scopeD) {
        if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
          return scopeD.listProjectsEventsCreator1M();
        }
      },
      children:
        [
          {
            find(scopeD) {
              const query = {};
              const inputDate = new Date();

              const queryone = {};
              queryone.endDate = { $exists: true, $lte: inputDate };
              if (etat) {
                queryone.status = etat;
              }
              queryone.parentId = { $in: [scopeD._id._str] };

              const querytwo = {};
              if (etat) {
                querytwo.status = etat;
              }
              querytwo.endDate = { $exists: false };
              querytwo.parentId = { $in: [scopeD._id._str] };

              query.$or = [];
              query.$or.push(queryone);
              query.$or.push(querytwo);

              return Actions.find(query);
            },
            children: [{
              find(scopeD) {
                return scopeD.listContributors();
              },
            }],
          },
        ],
    },
    {
      find(scopeD) {
        if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
          if (scopeD.isAdmin()) {
            return scopeD.listProjects();
          }
          return scopeD.listProjectsCreatorAdmin();
        }
      },
      children:
          [
            {
              find(scopeD) {
                const query = {};
                query.parentId = scopeD._id._str;
                if (etat) {
                  query.status = etat;
                }
                return Actions.find(query);
              },
              children: [{
                find(scopeD) {
                  return scopeD.listContributors();
                },
              }],
            },
          ],
    },
    {
      find(scopeD) {
        const query = {};
        query.parentId = scopeD._id._str;
        if (etat) {
          query.status = etat;
        }
        return Actions.find(query);
      },
      children: [{
        find(scopeD) {
          return scopeD.listContributors();
        },
      }],
    },
    ],
  };
});

Meteor.publishComposite('directoryListActions', function (scope, scopeId, etat) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  check(etat, Match.Maybe(String));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = {
          pwd: 0,
        };
      }
      if (scope === 'events') {
        // Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
      }
      let query = {};
      if (_.contains(['events', 'projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        } else if (scope === 'events') {
          query = queryOrPrivateScope(query, 'attendees', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      // console.log(JSON.stringify(query));
      return collection.find(query, options);
    },
    children: [{
      find() {
        return Lists.find({
          name: {
            $in: ['eventTypes'],
          },
        });
      },
    },
    {
      find(scopeD) {
        if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
          return scopeD.listActionsCreator('all', etat);
        }
      },
      children: [{
        find(action) {
          if (action.avatarOneUserAction()) {
            if (action && action.links && action.links.contributors) {
              const arrayContributors = arrayLinkProperNoObject(action.links.contributors);
              if (arrayContributors && arrayContributors[0]) {
                const arrayAllMergeMongoId = arrayContributors.map(k => new Mongo.ObjectID(k));
                return Citoyens.find({ _id: { $in: arrayAllMergeMongoId } }, { fields: { profilThumbImageUrl: 1 } });
              }
            }
          }
        },
      }],
    },
    ],
  };
});


Meteor.publish('historiqueUserActionsAllCounter', function (scopeId, citoyenId) {
  check(scopeId, String);
  check(citoyenId, String);

  if (!this.userId) {
    return null;
  }

  return new Counter(`historiqueUsercountActionsAll.${scopeId}.${citoyenId}`, LogUserActions.find({ organizationId: scopeId, userId: citoyenId }));
});

Meteor.publishComposite('listMembersDetailHistorique', function (organizationId, citoyenId, limit) {
  check(organizationId, String);
  check(citoyenId, String);
  check(limit, Number);

  if (!this.userId) {
    return null;
  }

  const collectionOne = Organizations.findOne({ _id: new Mongo.ObjectID(organizationId) });

  let isAdminProject = false;
  const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
  if (collectionOne.links && collectionOne.links.projects && userC && userC.links && userC.links.projects) {
    // eslint-disable-next-line no-unused-vars
    const arrayIds = Object.keys(collectionOne.links.projects)
      .filter(k => userC.links.projects[k] && userC.links.projects[k].isAdmin && !userC.links.projects[k].toBeValidated && !userC.links.projects[k].isAdminPending && !userC.links.projects[k].isInviting)
      // eslint-disable-next-line array-callback-return
      .map(k => k);
    // console.log(arrayIds);
    isAdminProject = !!(arrayIds && arrayIds.length > 0);
  }

  if (citoyenId === this.userId) {
    //
  } else if (!collectionOne.isAdmin()) {
    if (collectionOne && collectionOne.oceco && collectionOne.oceco.membersAdminProjectAdmin) {
      if (!isAdminProject) {
        return null;
      }
    } else {
      return null;
    }
  }

  return {
    find() {
      const options = {};
      options.fields = {
        pwd: 0,
      };
      options.fields = {
        name: 1,
        _id: 1,
      };

      const query = {};
      query._id = new Mongo.ObjectID(citoyenId);
      return Citoyens.find(query, options);
    },
    children: [{
      find() {
        const options = {};
        options.limit = limit || 10;
        options.sort = { createdAt: -1 };
        return LogUserActions.find({ organizationId, userId: citoyenId }, options);
      },
      children: [{
        find(log) {
          return Actions.find({ _id: new Mongo.ObjectID(log.actionId) }, { sort: { createdAt: -1 } });
        },
      },
      ],
    },
    ],
  };
});


Meteor.publishComposite('directoryListProjects', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['organizations', 'citoyens', 'projects'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      let query = {};
      if (_.contains(['projects', 'organizations'], scope)) {
        query.$or = [];
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': false,
        });
        query.$or.push({
          _id: new Mongo.ObjectID(scopeId),
          'preferences.private': {
            $exists: false,
          },
        });

        if (scope === 'projects') {
          query = queryOrPrivateScope(query, 'contributors', scopeId, this.userId);
        } else if (scope === 'organizations') {
          query = queryOrPrivateScope(query, 'members', scopeId, this.userId);
        }
      } else {
        query._id = new Mongo.ObjectID(scopeId);
      }
      return collection.find(query, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects') {
            // console.log('directoryListProjects');
            return scopeD.listProjectsCreator();
          }
        },
        children: arrayChildrenParent(scope, ['organizations', 'projects']),
        /* [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['organizations', 'projects'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ], */
      },
    ] };
});

Meteor.publishComposite('directoryListPoi', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listPoiCreator();
          }
        },
        children: arrayChildrenParent(scope, ['citoyens', 'organizations', 'projects', 'events']),
        /* [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ], */
      },
    ] };
});

Meteor.publishComposite('directoryListRooms', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            const options = {};
            options.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
            let scopeCible = scope;
            if (scope === 'organizations') {
              scopeCible = 'memberOf';
            }
            options.fields[`links.${scopeCible}`] = 1;
            return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
          }
        },
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listRooms();
          }
        },
      },
    ] };
});

Meteor.publishComposite('directoryListClassified', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'citoyens', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'citoyens' || scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.listClassifiedCreator();
          }
        },
        children: arrayChildrenParent(scope, ['citoyens', 'organizations', 'projects', 'events']),
        /* [
          {
            find(scopeD) {
              if (scopeD.parentType && scopeD.parentId && _.contains(['citoyens', 'organizations', 'projects', 'events'], scopeD.parentType)) {
                const collectionType = nameToCollection(scopeD.parentType);
                return collectionType.find({
                  _id: new Mongo.ObjectID(scopeD.parentId),
                }, {
                  fields: {
                    name: 1,
                    links: 1,
                    profilThumbImageUrl: 1,
                  },
                });
              }
            },
          },
        ], */
      },
    ] };
});

Meteor.publishComposite('directoryListOrganizations', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listOrganizationsCreator();
          }
        },
      },
    ] };
});

Meteor.publishComposite('directoryListInvitations', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listOrganizationsCreator();
          }
        },
      },
      {
        find(citoyen) {
          return citoyen.listFollows();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          },
        ],
      },
    ] };
});

Meteor.publish('listeventSous', function (scopeId) {
  check(scopeId, String);
  if (!this.userId) {
    return null;
  }
  const query = {};
  query[`parent.${scopeId}`] = {
    $exists: false,
  };
  const counterEvents = new Counter(`countSous.${scopeId}`, Events.find(query));

  return [
    counterEvents,
    Events.find(query),
  ];
});


/* Meteor.publishComposite('listeventSous', function(scopeId) {
  check(scopeId, String);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      Counts.publish(this, `countSous.${scopeId}`, Events.find({ parentId: scopeId }), { noReady: true });
      return Events.find({ parentId: scopeId });
    },
  };
}); */

Meteor.publishComposite('detailRooms', function(scope, scopeId, roomId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            const options = {};
            options.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
            let scopeCible = scope;
            if (scope === 'organizations') {
              scopeCible = 'memberOf';
            }
            options.fields[`links.${scopeCible}`] = 1;
            return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, options);
          }
        },
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return room.listProposals();
              }
            },
          },
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return room.listActions();
              }
            },
          },
          {
            find(room) {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return room.listResolutions();
              }
            },
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailProposals', function(scope, scopeId, roomId, proposalId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(proposalId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find() {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Proposals.find({ _id: new Mongo.ObjectID(proposalId) });
              }
            },
            children: [
              {
                find(proposal) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(proposal.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('proposalsDetailComments', function(scope, scopeId, roomId, proposalId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(proposalId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find() {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Proposals.find({ _id: new Mongo.ObjectID(proposalId) });
              }
            },
            children: [
              {
                find(proposal) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(proposal.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(proposal) {
                  return proposal.listComments();
                },
                children: [
                  {
                    find(comment) {
                      return Citoyens.find({
                        _id: new Mongo.ObjectID(comment.author),
                      }, {
                        fields: {
                          name: 1,
                          profilThumbImageUrl: 1,
                        },
                      });
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailActions', function(scope, scopeId, roomId, actionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(actionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events' || scope === 'citoyens') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find() {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events' || scope === 'citoyens') {
                return Actions.find({ _id: new Mongo.ObjectID(actionId) });
              }
            },
            children: [
              {
                find(action) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(action.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(action) {
                  return action.listContributors();
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('actionsDetailComments', function(scope, scopeId, roomId, actionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(actionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events', 'citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events' || scope === 'citoyens') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find() {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events' || scope === 'citoyens') {
                return Actions.find({ _id: new Mongo.ObjectID(actionId) });
              }
            },
            children: [
              {
                find(action) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(action.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
              {
                find(action) {
                  return action.listComments();
                },
                children: [
                  {
                    find(comment) {
                      return Citoyens.find({
                        _id: new Mongo.ObjectID(comment.author),
                      }, {
                        fields: {
                          name: 1,
                          profilThumbImageUrl: 1,
                        },
                      });
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('detailResolutions', function(scope, scopeId, roomId, resolutionId) {
  check(scopeId, String);
  check(scope, String);
  check(roomId, String);
  check(resolutionId, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['projects', 'organizations', 'events'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find(scopeD) {
          if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
            // return Rooms.find({ _id: new Mongo.ObjectID(roomId) });
            return scopeD.detailRooms(roomId);
          }
        },
        children: [
          {
            find() {
              if (scope === 'organizations' || scope === 'projects' || scope === 'events') {
                return Resolutions.find({ _id: new Mongo.ObjectID(resolutionId) });
              }
            },
            children: [
              {
                find(resolution) {
                  return Citoyens.find({
                    _id: new Mongo.ObjectID(resolution.creator),
                  }, {
                    fields: {
                      name: 1,
                      profilThumbImageUrl: 1,
                    },
                  });
                },
              },
            ],
          },
        ],
      },
    ],
  };
});

Meteor.publishComposite('listAttendees', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Events.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(event) {
          return event.listAttendeesValidate();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          },
        ],
      },
      {
        find(event) {
          return event.listAttendeesIsInviting();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          },
        ],
      },
      {
        find(event) {
          return event.listAttendeesOrgaValidate();
        },
      },
    ] };
});

Meteor.publishComposite('listMembers', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Organizations.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(organisation) {
          return organisation.listMembers();
        },
      },
    ] };
});

Meteor.publishComposite('listMembersActions', function (scopeId, actionId) {
  check(scopeId, String);
  check(actionId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Organizations.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(organisation) {
          return organisation.listMembersActions(actionId);
        },
      },
    ],
  };
});

Meteor.publishComposite('listMembersToBeValidated', function(scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['organizations', 'projects'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return collection.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(organisation) {
          return organisation.listMembersToBeValidated();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('listContributors', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Projects.find({ _id: new Mongo.ObjectID(scopeId) });
    },
    children: [
      {
        find(project) {
          return project.listContributors();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publishComposite('listFollows', function(scopeId) {
  check(scopeId, String);

  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Citoyens.find({ _id: new Mongo.ObjectID(scopeId) }, {
        fields: {
          _id: 1,
          name: 1,
          'links.follows': 1,
          profilThumbImageUrl: 1,
        },
      });
    },
    children: [
      {
        find(citoyen) {
          return citoyen.listFollows();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  'status.online': 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publish('newsListCounter', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }
  const collection = nameToCollection(scope);
  return new Counter(`countNews.${scopeId}`, collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId));
});

Meteor.publishComposite('newsList', function(scope, scopeId, limit) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const collection = nameToCollection(scope);
      // Counts.publish(this, `countNews.${scopeId}`, collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId), { noReady: true });
      return collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).newsJournal(scopeId, this.userId, limit);
    },
    children: [
      {
        find(news) {
          /* ////console.log(news.author); */
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
      {
        find(news) {
          const queryOptions = { fields: {
            _id: 1,
            name: 1,
            profilThumbImageUrl: 1,
          } };
          if (news.target && news.target.type && news.target.id) {
            const collection = nameToCollection(news.target.type);
            return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
          }
        },
      }, /* ,      {
        find(news) {
          if (news.target && news.target.type && news.target.id) {
            return Documents.find({
              id: news.target.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      } */
      {
        find(news) {
          const queryOptions = {};
          if (news.object && news.object.type === 'actions') {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else if (news.object && news.object.type === 'proposals') {
            queryOptions.fields = {
              _id: 1,
              title: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
          }
          if (news.object && news.object.type && news.object.id) {
            const collection = nameToCollection(news.object.type);
            return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
          }
        },
      }, /* ,
      {
        find(news) {
          if (news.object && news.object.type && news.object.id) {
            return Documents.find({
              id: news.object.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
    ],
  };
});

Meteor.publishComposite('newsDetail', function(scope, scopeId, newsId) {
  check(newsId, String);
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const query = {};
      if (scope === 'citoyens') {
        if (this.userId === scopeId) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'projects') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isContributors(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'organizations') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isMembers(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'events') {
        query['scope.type'] = { $in: ['restricted', 'public'] };
      }
      query._id = new Mongo.ObjectID(newsId);
      // console.log(query);
      // console.log(News.find(query).fetch())
      return News.find(query);
    },
    children: [
      {
        find(news) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
      {
        find(news) {
          const queryOptions = { fields: {
            _id: 1,
            name: 1,
            profilThumbImageUrl: 1,
          } };
          if (news.target && news.target.type && news.target.id) {
            const collection = nameToCollection(news.target.type);
            return collection.find({ _id: new Mongo.ObjectID(news.target.id) }, queryOptions);
          }
        },
      }, /*
      {
        find(news) {
          if (news.target && news.target.type && news.target.id) {
            return Documents.find({
              id: news.target.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
      {
        find(news) {
          const queryOptions = {};
          if (news.object && news.object.type === 'actions') {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else if (news.object && news.object.type === 'proposals') {
            queryOptions.fields = {
              _id: 1,
              title: 1,
              idParentRoom: 1,
              profilThumbImageUrl: 1,
            };
          } else {
            queryOptions.fields = {
              _id: 1,
              name: 1,
              profilThumbImageUrl: 1,
            };
          }
          if (news.object && news.object.type && news.object.id) {
            const collection = nameToCollection(news.object.type);
            return collection.find({ _id: new Mongo.ObjectID(news.object.id) }, queryOptions);
          }
        },
      }, /* ,
      {
        find(news) {
          if (news.object && news.object.type && news.object.id) {
            return Documents.find({
              id: news.object.id,
              contentKey: 'profil',
            }, { sort: { created: -1 }, limit: 1 });
          }
        },
      }, */
    ],
  };
});

Meteor.publishComposite('newsDetailComments', function(scope, scopeId, newsId) {
  check(newsId, String);
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function(name) {
    return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
  }));
  if (!this.userId) {
    return null;
  }

  return {
    find() {
      const query = {};
      if (scope === 'citoyens') {
        if (this.userId === scopeId) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'projects') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isContributors(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'organizations') {
        const collection = nameToCollection(scope);
        if (collection.findOne({ _id: new Mongo.ObjectID(scopeId) }).isMembers(this.userId)) {
          query['scope.type'] = { $in: ['restricted', 'private', 'public'] };
        } else {
          query['scope.type'] = { $in: ['restricted', 'public'] };
        }
      } else if (scope === 'events') {
        query['scope.type'] = { $in: ['restricted', 'public'] };
      }
      query._id = new Mongo.ObjectID(newsId);
      return News.find(query);
    },
    children: [
      {
        find(news) {
          return Citoyens.find({
            _id: new Mongo.ObjectID(news.author),
          }, {
            fields: {
              name: 1,
              profilThumbImageUrl: 1,
            },
          });
        }, /* ,
        children: [
          {
            find(citoyen) {
              return citoyen.documents();
            },
          },
        ], */
      },
      {
        find(news) {
          return Comments.find({
            contextId: news._id._str,
          });
        },
        children: [
          {
            find(comment) {
              return Citoyens.find({
                _id: new Mongo.ObjectID(comment.author),
              }, {
                fields: {
                  name: 1,
                  profilThumbImageUrl: 1,
                },
              });
            }, /* ,
            children: [
              {
                find(citoyen) {
                  return citoyen.documents();
                },
              },
            ], */
          },
        ],
      },
      {
        find(news) {
          return news.photoNewsAlbums();
        },
      },
    ],
  };
});

Meteor.publish('citoyenOnlineProx', function(latlng, radius) {
  check(latlng, { longitude: Number, latitude: Number });
  check(radius, Number);
  if (!this.userId) {
    return null;
  }
  // moulinette pour mettre à jour les Point pour que l'index soit bon
  /*
                                      Citoyens.find({}).fetch().map(function(c){
                                      if(c.geo && c.geo.longitude){
                                      Citoyens.update({_id:c._id}, {$set: {'geoPosition': {
                                      type: "Point",
                                      'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                                    }}});
                                  }
                                }); */

  return Citoyens.find({ geoPosition: {
    $nearSphere: {
      $geometry: {
        type: 'Point',
        coordinates: [latlng.longitude, latlng.latitude],
      },
      $maxDistance: radius,
    } } }, { _disableOplog: true, fields: { pwd: 0 } });
});


Meteor.publish('users', function() {
  if (!this.userId) {
    return null;
  }
  return [
    Meteor.users.find({ 'status.online': true }, { fields: { status: 1, profile: 1, username: 1 } }),
    Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, { fields: { pwd: 0 } }),
  ];
});

Meteor.publishComposite('callUsers', function() {
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      return Citoyens.find({ _id: new Mongo.ObjectID(this.userId) }, {
        fields: {
          _id: 1,
          name: 1,
          'links.follows': 1,
          'links.followers': 1,
          profilThumbImageUrl: 1,
        },
      });
    },
    children: [
      {
        find(citoyen) {
          return citoyen.listFriends();
        },
        children: [
          {
            find(citoyen) {
              return Meteor.users.find({
                _id: citoyen._id._str,
              }, {
                fields: {
                  status: 1,
                },
              });
            },
          }, /* ,
          {
            find(citoyen) {
              return citoyen.documents();
            },
          }, */
        ],
      },
    ] };
});

Meteor.publish('projects.actions', function(raffId) {
  check(raffId, String);
  if (!this.userId) {
    return null;
  }
  const id = new Mongo.ObjectID(raffId);
  const raffinerieCursor = Organizations.findOne({ _id: id });
  if (raffinerieCursor) {
    const raffProjectsArray = raffinerieCursor.listProjectsCreator().map(project => project._id._str);
    const poleActions = Actions.find({ parentId: { $in: raffProjectsArray } });
    return poleActions;
  }
  return null;
  // Penser à ne renvoyer que les actions lié à la raffinerie
  // return   Actions.find()
});

// Meteor.publish('poles.actions', function(raffId, poleName) {
//   check(raffId, String);
//   check(poleName, Match.Maybe(String));
//   if (!this.userId) {
//     return null;
//   }
//   const id = new Mongo.ObjectID(raffId);
//   const raffinerieCursor = Organizations.findOne({ _id: id });
//   if (raffinerieCursor) {
//     const raffProjectsArray = raffinerieCursor.listProjectsEventsCreator().map(event => event._id._str);
//     if (poleName) {
//       const poleActions = Actions.find({ parentId: { $in: raffProjectsArray } });
//       return poleActions;
//     }
//     const poleActions = Actions.find({ parentId: { $in: raffProjectsArray } });
//     return poleActions;
//   }
//   return null;
// });

Meteor.publish('poles.actions2', function(raffId, poleName) {
  check(raffId, String);
  check(poleName, String);
  if (!this.userId) {
    return null;
  }
  const queryProjectId = `parent.${raffId}`;
  const poleProjects = Projects.find({ $and: [{ tags: poleName }, { [queryProjectId]: { $exists: 1 } }] }).fetch();
  const poleProjectsId = [];
  poleProjects.forEach((element) => {
    poleProjectsId.push(element._id._str);
  });
  const eventsArrayId = [];
  Events.find({ organizerId: { $in: poleProjectsId } }).forEach(function(event) { eventsArrayId.push(event._id._str); });

  const inputDate = new Date();
  const query = {};
  query.endDate = { $gte: inputDate };
  query.parentId = { $in: [...eventsArrayId, ...poleProjectsId] };
  query.status = 'todo';
  const options = {};
  options.sort = {
    startDate: 1,
  };

  const eventActions = Actions.find(query);
  return eventActions;
});

Meteor.publish('all.avatarOne', function (raffId) {
  check(raffId, String);
  if (!this.userId) {
    return null;
  }

  const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(raffId) });
  if (!orgaOne) {
    return null;
  }
  const allActions = orgaOne.actionsAll();
  const allIdsCitoyens = allActions.map((k) => {
    if (k.avatarOneUserAction()) {
      const arrayContributors = arrayLinkProperNoObject(k.links.contributors);
      return arrayContributors[0];
    }
  }).filter(Boolean);
  const mergeDedupe = arr => [...new Set([].concat(...arr))];
  const arrayAllMerge = mergeDedupe(allIdsCitoyens);
  const arrayAllMergeMongoId = arrayAllMerge.map(k => new Mongo.ObjectID(k));
  return Citoyens.find({ _id: { $in: arrayAllMergeMongoId } }, { fields: { profilThumbImageUrl: 1 } });
});

Meteor.publish('all.actions2', function (raffId) {
  check(raffId, String);

  if (!this.userId) {
    return null;
  }

  const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(raffId) });
  if (!orgaOne) {
    return null;
  }
  return orgaOne.actionsAll();
});

Meteor.publishComposite('all.user.actions2', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['citoyens'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      if (scope === 'citoyens') {
        options.fields = { pwd: 0 };
      }
      return collection.find({ _id: new Mongo.ObjectID(scopeId) }, options);
    },
    children: [
      {
        find() {
          return Lists.find({ name: { $in: ['organisationTypes'] } });
        },
      },
      {
        find(scopeD) {
          if (scope === 'citoyens') {
            return scopeD.listOrganizationsCreator();
          }
        },
        children: [{
          find(orgaOne) {
            return orgaOne.actionsUserAll(scopeId);
          },
        }],
      },
    ],
  };
});


Meteor.publish('member.profile', function(memberId) {
  check(memberId, String);
  if (!this.userId) {
    return null;
  }
  const id = new Mongo.ObjectID(memberId);
  return Citoyens.findOne({ _id: id });
});

/* Meteor.publish('user.actions', function(raffId) {
  check(raffId, String);
  if (!this.userId) {
    return null;
  }
  const id = new Mongo.ObjectID(raffId);
  const raffinerieCursor = Organizations.findOne({ _id: id });
  const UserId = `links.contributors.${this.userId}`;
  if (raffinerieCursor) {
    const raffProjectsArray = raffinerieCursor.listProjectsEventsCreator().map(event => event._id._str);
    return Actions.find({ parentId: { $in: raffProjectsArray }, [UserId]: { $exists: 1 } });
  }
}); */

Meteor.publishComposite('user.actions', function (scope, scopeId, etat) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['organizations'], name);
  }));
  check(etat, String);
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  const UserId = `links.contributors.${this.userId}`;
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      const query = {};
      query._id = new Mongo.ObjectID(scopeId);
      return collection.find(query, options);
    },
    children: [{
      find() {
        return Lists.find({
          name: {
            $in: ['eventTypes'],
          },
        });
      },
    },
    {
      find(scopeD) {
        if (scope === 'organizations') {
          return scopeD.listProjectsEventsCreator1M();
        }
      },
      children: [{
        find(scopeD) {
          const finished = `finishedBy.${this.userId}`;
          const query = {};
          query.parentId = scopeD._id._str;
          query[UserId] = {
            $exists: 1,
          };
          query.status = 'todo';
          const option = {};
          if (etat === 'aFaire') {
            query[finished] = { $exists: false };
            option.sort = { endDate: -1 };
          } else if (etat === 'enAttente') {
            query[finished] = 'toModerate';
            option.sort = { endDate: -1 };
          } else if (etat === 'valides') {
            /* WARNING pour l'historique listProjectsEventsCreator1M ne va pas aller car il prend les evenements qui ne sont pas terminer ou 15 jous apres la fin */
            query[finished] = 'validated';
            option.sort = { endDate: -1 };
            option.limit = 100;
          }
          // console.log(query);
          return Actions.find(query, option);
        },
      },
      ],
    },
    {
      find(scopeD) {
        if (scope === 'organizations') {
          return scopeD.listProjects();
        }
      },
      children: [{
        find(scopeD) {
          const finished = `finishedBy.${this.userId}`;
          const query = {};
          query.parentId = scopeD._id._str;
          query[UserId] = {
            $exists: 1,
          };
          query.status = 'todo';
          const option = {};
          if (etat === 'aFaire') {
            query[finished] = { $exists: false };
            option.sort = { endDate: -1 };
          } else if (etat === 'enAttente') {
            query[finished] = 'toModerate';
            option.sort = { endDate: -1 };
          } else if (etat === 'valides') {
            /* WARNING pour l'historique listProjectsEventsCreator1M ne va pas aller car il prend les evenements qui ne sont pas terminer ou 15 jous apres la fin */
            query[finished] = 'validated';
            option.sort = { endDate: -1 };
            option.limit = 100;
          }
          // console.log(query);
          return Actions.find(query, option);
        },
      },
      ],
    },
    {
      find() {
        const finished = `finishedBy.${this.userId}`;
        const query = {};
        query.parentId = scopeId;
        query[UserId] = {
          $exists: 1,
        };
        query.status = 'todo';
        const option = {};
        if (etat === 'aFaire') {
          query[finished] = { $exists: false };
          option.sort = { endDate: -1 };
        } else if (etat === 'enAttente') {
          query[finished] = 'toModerate';
          option.sort = { endDate: -1 };
        } else if (etat === 'valides') {
          /* WARNING pour l'historique listProjectsEventsCreator1M ne va pas aller car il prend les evenements qui ne sont pas terminer ou 15 jous apres la fin */
          query[finished] = 'validated';
          option.sort = { endDate: -1 };
          option.limit = 100;
        }
        // console.log(query);
        return Actions.find(query, option);
      },
    },
    ],
  };
});


Meteor.publishComposite('user.actions.historique', function (scope, scopeId) {
  check(scopeId, String);
  check(scope, String);
  check(scope, Match.Where(function (name) {
    return _.contains(['organizations'], name);
  }));
  const collection = nameToCollection(scope);
  if (!this.userId) {
    return null;
  }
  const UserId = `links.contributors.${this.userId}`;
  return {
    find() {
      const options = {};
      // options['_disableOplog'] = true;
      const query = {};
      query._id = new Mongo.ObjectID(scopeId);
      return collection.find(query, options);
    },
    children: [{
      find(scopeD) {
        if (scope === 'organizations') {
          // return scopeD.listProjectsEventsCreator1M();
          if (scopeD.links && scopeD.links.projects) {
            const projectIds = arrayLinkParentNoObject(scopeD.links.projects, 'projects');
            const query = {};
            query.$or = [];
            projectIds.forEach((id) => {
              const queryCo = {};
              queryCo[`organizer.${id}`] = { $exists: true };
              query.$or.push(queryCo);
            });
            /* const options = {};
            options.sort = {
              startDate: 1
            }; */
            const arrayEventsIds = Events.find(query).fetch().map(event => event._id._str);
            const finished = `finishedBy.${this.userId}`;
            const queryAction = {};
            queryAction.parentId = { $in: [...arrayEventsIds, ...projectIds, scopeId] };
            queryAction[UserId] = {
              $exists: 1,
            };
            const option = {};
            /* WARNING pour l'historique listProjectsEventsCreator1M ne va pas aller car il prend les evenements qui ne sont pas terminer ou 15 jous apres la fin */
            queryAction[finished] = 'validated';
            option.sort = { endDate: -1 };
            option.limit = 100;
            // console.log(queryAction);
            return Actions.find(queryAction, option);
          }
        }
      },
    },
    ],
  };
});

Meteor.publish('action.to.admin', function(raffId) {
  check(raffId, String);
  if (!this.userId) {
    return null;
  }
  const id = new Mongo.ObjectID(raffId);
  const raffinerieCursor = Organizations.findOne({ _id: id });
  if (raffinerieCursor) {
    const raffProjectsArray = raffinerieCursor.listProjectsCreator().map(project => project._id._str);
    return Actions.find({ parentId: { $in: raffProjectsArray } });
  }
});

Meteor.publish('poles.events', function (raffId, poleName) {
  check(raffId, String);
  check(poleName, Match.Maybe(String));
  if (!this.userId) {
    return null;
  }

  const queryProjectId = `parent.${raffId}`;
  const projectId = Projects.find({ [queryProjectId]: { $exists: 1 } }).fetch();
  const projectsId = [];
  projectId.forEach((element) => {
    projectsId.push(element._id);
  });
  let poleProjects;
  if (poleName) {
    poleProjects = Projects.find({ $and: [{ tags: poleName }, { _id: { $in: projectsId } }] }).fetch();
  } else {
    poleProjects = Projects.find({ _id: { $in: projectsId } }).fetch();
  }

  if (poleProjects) {
    // / const poleProjectsId = [];
    /* poleProjects.forEach((element) => {
      poleProjectsId.push(element._id._str);
    }); */

    const query = {};
    const inputDate = new Date();
    query.endDate = { $gte: inputDate };
    query.$or = [];
    poleProjects.forEach((element) => {
      const queryCo = {};
      queryCo[`organizer.${element._id._str}`] = { $exists: true };
      query.$or.push(queryCo);
    });

    // query.organizerId = { $in: poleProjectsId };

    const options = {};
    options.sort = {
      startDate: 1,
    };
    return Events.find(query, options);
  }
});


// Meteor.publish('raffinerie.members',function(raffhId){
//   let id = new Mongo.ObjectID(raffId)
//   let orgaCursor = Organizations.findOne({_id: id }).links.members
//   console.log(arrayLinkProper(orgaCursor))
// })

// Meteor.publish('poles.list', function())
