/* eslint-disable import/prefer-default-export */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Events } from './events.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
import { Rooms } from './rooms.js';

export const ActivityStream = new Mongo.Collection('activityStream', { idGeneration: 'MONGO' });

ActivityStream.api = {
  Unseen (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.Unseen`)) {
      return Counts.get(`notifications.${bothUserId}.Unseen`);
    }
    return undefined;
  },
  UnseenAsk (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.UnseenAsk`)) {
      return Counts.get(`notifications.${bothUserId}.UnseenAsk`);
    }
    return undefined;
  },
  Unread (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Counts.has(`notifications.${bothUserId}.Unread`)) {
      return Counts.get(`notifications.${bothUserId}.Unread`);
    }
    return undefined;
  },
  queryUnseen (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnseen = { type: 'oceco' };
    queryUnseen[`notify.id.${bothUserId}`] = { $exists: 1 };
    queryUnseen[`notify.id.${bothUserId}.isUnseen`] = true;
    if (bothScopeId) {
      queryUnseen['target.id'] = bothScopeId;
    }
    return ActivityStream.find(queryUnseen, { fields: { _id: 1 } });
  },
  queryUnseenAsk (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnseen = { type: 'oceco' };
    queryUnseen[`notify.id.${bothUserId}`] = { $exists: 1 };
    queryUnseen[`notify.id.${bothUserId}.isUnseen`] = true;
    if (bothScopeId) {
      queryUnseen['target.id'] = bothScopeId;
      queryUnseen.verb = { $in: ['ask'] };
    }
    return ActivityStream.find(queryUnseen, { fields: { _id: 1 } });
  },
  queryUnread (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const queryUnread = { type: 'oceco' };
    queryUnread[`notify.id.${bothUserId}`] = { $exists: 1 };
    queryUnread[`notify.id.${bothUserId}.isUnread`] = true;
    if (bothScopeId) {
      queryUnread['target.id'] = bothScopeId;
    }
    return ActivityStream.find(queryUnread, { fields: { _id: 1 } });
  },
  isUnread (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = { type: 'oceco' };
    query[`notify.id.${bothUserId}`] = { $exists: 1 };
    if (bothScopeId) {
      query.verb = { $nin: ['ask'] };
      query['target.id'] = bothScopeId;
    } else {
      query[`notify.id.${bothUserId}.isUnread`] = true;
    }
    const options = {};
    options.sort = { created: -1 };
    /* options.fields = {};
    options.fields[`notify.id.${bothUserId}.isUnread`] = 1;
    options.fields[`notify.id.${bothUserId}.isUnseen`] = 1;
    options.fields['notify.displayName'] = 1;
    options.fields['notify.labelArray'] = 1;
    options.fields['notify.icon'] = 1;
    options.fields['notify.url'] = 1;
    options.fields['notify.objectType'] = 1;
    options.fields.verb = 1;
    options.fields.target = 1;
    options.fields.targetEvent = 1;
    options.fields.targetRoom = 1;
    options.fields.targetProject = 1;
    options.fields.object = 1;
    options.fields.created = 1;
    options.fields.author = 1;
    options.fields.type = 1; */
    return ActivityStream.find(query, options);
  },
  isUnseen (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = { type: 'oceco' };
    query[`notify.id.${bothUserId}`] = { $exists: 1 };
    if (bothScopeId) {
      query['target.id'] = bothScopeId;
    } else {
      query[`notify.id.${bothUserId}.isUnseen`] = true;
    }
    const options = {};
    options.sort = { created: -1 };
    /* options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['targetEvent'] = 1;
    options['fields']['targetRoom'] = 1;
    options['fields']['targetProject'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1; */
    return ActivityStream.find(query, options);
  },
  isUnseenAsk (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = { type: 'oceco' };
    query.verb = { $in: ['ask'] };
    query[`notify.id.${bothUserId}`] = { $exists: 1 };
    if (bothScopeId) {
      query['target.id'] = bothScopeId;
    } else {
      query[`notify.id.${bothUserId}.isUnseen`] = true;
    }
    const options = {};
    options.sort = { created: -1 };
    /* options['fields'] = {}
    options['fields'][`notify.id.${bothUserId}`] = 1;
    options['fields']['notify.displayName'] = 1;
    options['fields']['notify.icon'] = 1;
    options['fields']['notify.url'] = 1;
    options['fields']['notify.objectType'] = 1;
    options['fields']['verb'] = 1;
    options['fields']['target'] = 1;
    options['fields']['targetEvent'] = 1;
    options['fields']['targetRoom'] = 1;
    options['fields']['targetProject'] = 1;
    options['fields']['created'] = 1;
    options['fields']['author'] = 1;
    options['fields']['type'] = 1; */
    return ActivityStream.find(query, options);
  },
  isUnreadAsk (userId, scopeId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const bothScopeId = (typeof scopeId !== 'undefined') ? scopeId : false;
    const query = { type: 'oceco' };
    query.verb = { $in: ['ask'] };
    query[`notify.id.${bothUserId}`] = { $exists: 1 };
    if (bothScopeId) {
      query['target.id'] = bothScopeId;
    } else {
      query[`notify.id.${bothUserId}.isUnread`] = true;
    }
    const options = {};
    options.sort = { created: -1 };
    /* options.fields = {};
    options.fields[`notify.id.${bothUserId}`] = 1;
    options.fields['notify.displayName'] = 1;
    options.fields['notify.labelArray'] = 1;
    options.fields['notify.icon'] = 1;
    options.fields['notify.url'] = 1;
    options.fields['notify.objectType'] = 1;
    options.fields.verb = 1;
    options.fields.target = 1;
    options.fields.targetEvent = 1;
    options.fields.targetRoom = 1;
    options.fields.targetProject = 1;
    options.fields.object = 1;
    options.fields.created = 1;
    options.fields.author = 1;
    options.fields.type = 1; */
    return ActivityStream.find(query, options);
  },
  listUserOrga(array, type, idUser = null, author = null) {
    let arrayIdsUsers = [];
    if (type === 'isAdmin') {
      arrayIdsUsers = Object.keys(array)
        .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true) && array[k].type === 'citoyens' && array[k].isAdmin === true)
        .map(k => k);
    } else if (type === 'isMember') {
      // users
      arrayIdsUsers = Object.keys(array)
        .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true) && array[k].type === 'citoyens' && array[k].isAdmin !== true)
        .map(k => k);
    } else if (type === 'isUser' && idUser) {
      // users
      arrayIdsUsers = Object.keys(array)
        .filter(k => array[k].isInviting !== true && !(array[k].type === 'citoyens' && array[k].toBeValidated === true) && array[k].type === 'citoyens' && k === idUser)
        .map(k => k);
    } else if (type === 'isActionMembers') {
      arrayIdsUsers = Object.keys(array)
        .filter(k => array[k].type === 'citoyens')
        .map(k => k);
    }


    if (arrayIdsUsers.length > 0) {
      const idUsersObj = {};
      arrayIdsUsers.forEach(function (id) {
        if (author && author.id && author.id === id) {
          // author not notif
        } else {
          idUsersObj[id] = {
            isUnread: true,
            isUnseen: true,
          };
        }
      });
      return idUsersObj;
    }
    return null;
  },
  authorNotif(notificationObj, { id, name, type }) {
    notificationObj.author = {};
    notificationObj.author[id] = {};
    notificationObj.author[id].id = id;
    notificationObj.author[id].name = name;
    notificationObj.author[id].type = type;
    return notificationObj;
  },
  targetNotif(notificationObj, { id, name, type }) {
    notificationObj.target = {};
    notificationObj.target.type = type;
    notificationObj.target.id = id;
    notificationObj.target.name = name;
    return notificationObj;
  },
  objectNotif(notificationObj, { id, name, type }) {
    notificationObj.object = {};
    notificationObj.object[id] = {};
    notificationObj.object[id].id = id;
    notificationObj.object[id].type = type;
    notificationObj.object[id].name = name;
    return notificationObj;
  },
  ocecoNotif(notificationObj, { projectOne, eventOne, roomOne }) {
    // project
    if (projectOne) {
      notificationObj.targetProject = {};
      notificationObj.targetProject.type = 'projects';
      notificationObj.targetProject.id = projectOne._id._str;
      notificationObj.targetProject.name = projectOne.name;
    }
    // event
    if (eventOne) {
      notificationObj.targetEvent = {};
      notificationObj.targetEvent.type = 'events';
      notificationObj.targetEvent.id = eventOne._id._str;
      notificationObj.targetEvent.name = eventOne.name;
    }

    // room
    notificationObj.targetRoom = {};
    notificationObj.targetRoom.type = 'rooms';
    notificationObj.targetRoom.id = roomOne._id._str;
    notificationObj.targetRoom.name = roomOne.name;
    return notificationObj;
  },
  add({ target, object, author }, verb, type = 'isMember', idUser = null) {
    let notificationObj = {};
    notificationObj.type = 'oceco';
    notificationObj.verb = verb;

    let targetObj = target;

    if (object && object.type === 'actions' && object.parentType === 'organizations') {
      const organizationOne = Organizations.findOne({ _id: new Mongo.ObjectID(object.parentId) });

      if (!targetObj) {
        // target
        targetObj = { id: organizationOne._id._str, name: organizationOne.name, type: 'organizations', links: organizationOne.links };
      }

      if (type === 'isActionMembers') {
        if (object && object.links && object.links.contributors) {
          targetObj.links.members = object.links.contributors;
        } else {
          targetObj.links.members = null;
        }
      }

      // console.log(targetObj);
      // console.log(object);
      const roomOne = Rooms.findOne({
        _id: new Mongo.ObjectID(object.idParentRoom),
      });

      if (roomOne) {
        // oceco
        notificationObj = ActivityStream.api.ocecoNotif(notificationObj, { roomOne });
      }
    } else if (object && object.type === 'actions' && object.parentType === 'projects') {
      const projectOne = Projects.findOne({
        _id: new Mongo.ObjectID(object.parentId),
      });

      const project = `links.projects.${projectOne._id._str}`;
      const organizationOne = Organizations.findOne({ [project]: { $exists: 1 } });

      if (!targetObj) {
        // target
        targetObj = { id: organizationOne._id._str, name: organizationOne.name, type: 'organizations', links: organizationOne.links };
      }

      if (type === 'isActionMembers') {
        if (object && object.links && object.links.contributors) {
          targetObj.links.members = object.links.contributors;
        } else {
          targetObj.links.members = null;
        }
      }

      // console.log(targetObj);
      // console.log(object);
      const roomOne = Rooms.findOne({
        _id: new Mongo.ObjectID(object.idParentRoom),
      });

      if (projectOne && roomOne) {
        // oceco
        notificationObj = ActivityStream.api.ocecoNotif(notificationObj, { projectOne, roomOne });
      }
    } else if (object && object.type === 'actions' && object.parentType === 'events') {
      const eventOne = Events.findOne({
        _id: new Mongo.ObjectID(object.parentId),
      });

      const event = `links.events.${eventOne._id._str}`;
      const projectOne = Projects.findOne({ [event]: { $exists: 1 } });
      const project = `links.projects.${projectOne._id._str}`;
      const organizationOne = Organizations.findOne({ [project]: { $exists: 1 } });

      if (!targetObj) {
        // target
        targetObj = { id: organizationOne._id._str, name: organizationOne.name, type: 'organizations', links: organizationOne.links };
      }

      if (type === 'isActionMembers') {
        if (object && object.links && object.links.contributors) {
          targetObj.links.members = object.links.contributors;
        } else {
          targetObj.links.members = null;
        }
      }

      // console.log(targetObj);
      // console.log(object);
      const roomOne = Rooms.findOne({
        _id: new Mongo.ObjectID(object.idParentRoom),
      });

      if (eventOne && projectOne && roomOne) {
        // oceco
        notificationObj = ActivityStream.api.ocecoNotif(notificationObj, { projectOne, eventOne, roomOne });
      }
    }

    if (author) {
    // author
      notificationObj = ActivityStream.api.authorNotif(notificationObj, author);
    }

    if (targetObj) {
    // target
      notificationObj = ActivityStream.api.targetNotif(notificationObj, targetObj);
    }

    if (object) {
    // object
      notificationObj = ActivityStream.api.objectNotif(notificationObj, object);
    }


    notificationObj.created = new Date();
    notificationObj.updated = new Date();

    // notifications
    notificationObj.notify = {};
    // objectType sert à quoi ?
    if (object && object.type) {
      notificationObj.notify.objectType = object.type;
    }


    // listes des users à notifier
    // list des citoyens membre de l'orga
    if (targetObj && targetObj.links && targetObj.links.members) {
      // users / admin
      const idUsersObj = ActivityStream.api.listUserOrga(targetObj.links.members, type, idUser, author);

      // console.log(idUsersObj);

      if (idUsersObj) {
        /* notificationObj.notify.id['55ed9107e41d75a41a558524'] = {
            isUnread: true,
            isUnseen: true
          }; */

        // pattern du text de la notif
        // const pattern = patternNotif(verb, notificationObj.notify, isAdmin);
        let targetNofifScope = {};
        if (notificationObj && notificationObj.targetEvent) {
          targetNofifScope = { ...notificationObj.targetEvent };
        } else if (notificationObj && !notificationObj.targetEvent && notificationObj.targetProject) {
          targetNofifScope = { ...notificationObj.targetProject };
          console.log(targetNofifScope);
        } else if (notificationObj && !notificationObj.targetEvent && !notificationObj.targetProject) {
          targetNofifScope = { ...targetObj };
          console.log(targetNofifScope);
        }


        if (verb === 'join') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} participate to the action {what} from {where}';
              // notificationObj.notify.displayName = '{who} participates to {where}';
              notificationObj.notify.icon = 'fa-group';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'joinSpent') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} spent credit on {what} from {where}';
              // notificationObj.notify.displayName = '{who} participates to {where}';
              notificationObj.notify.icon = 'fa-money';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'leave') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} leave the action {what} from {where}';
              notificationObj.notify.icon = 'fa-times';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'finish') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} finished the action {what} from {where}';
              notificationObj.notify.icon = 'fa-calendar-check-o';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'validate') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              // isAdmin
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} validated the action {what} from {where}';
              notificationObj.notify.icon = 'fa-check';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            }
          }
        } else if (verb === 'add') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} added a new action {what} in {where}';
              notificationObj.notify.icon = 'fa-plus';

              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isMember') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} added a new action {what} in {where}';
              notificationObj.notify.icon = 'fa-plus';

              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'addSpent') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              // isAdmin
            } else if (type === 'isMember') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = 'a possible expense {what} has been added on {where}';
              notificationObj.notify.icon = 'fa-money';

              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isUser') {
              // isUser
            }
          }
        } else if (verb === 'startAction') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              // isAdmin
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            } else if (type === 'isActionMembers') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = 'start of the action {what} in {where}';
              notificationObj.notify.icon = 'fa-hourglass-start';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              // notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            }
          }
        } else if (verb === 'endAction') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              // isAdmin
            } else if (type === 'isMember') {
              // isMember
            } else if (type === 'isUser') {
              // isUser
            } else if (type === 'isActionMembers') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = 'end of the action {what} in {where}';
              notificationObj.notify.icon = 'fa-hourglass-end';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              // notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            }
          }
        } else if (verb === 'addComment') {
          if (object.type === 'actions') {
            if (type === 'isAdmin') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} commented on action {what} in {where}';
              notificationObj.notify.icon = 'fa-comments';

              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            } else if (type === 'isActionMembers') {
              notificationObj.notify.id = idUsersObj;
              notificationObj.notify.displayName = '{who} commented on action {what} in {where}';
              notificationObj.notify.icon = 'fa-comments';
              notificationObj.notify.url = `page/type/${targetNofifScope.type}/id/${targetNofifScope.id}/view/coop/room/${notificationObj.targetRoom.id}/action/${object.id}`;
              // labelAuthorObject ne sait pas a quoi ça sert
              notificationObj.notify.labelAuthorObject = 'author';
              // remplacement du pattern
              notificationObj.notify.labelArray = {};
              notificationObj.notify.labelArray['{who}'] = [author.name];
              notificationObj.notify.labelArray['{what}'] = [object.name];
              notificationObj.notify.labelArray['{where}'] = [targetNofifScope.name];
            }
          }
        }
      }
      // console.log(notificationObj);
      if (notificationObj.notify && notificationObj.notify.id) {
        ActivityStream.insert(notificationObj);
      }
    }
  },
};

ActivityStream.helpers({
  authorId () {
    const keyArray = _.map(this.author, (a, k) => k);
    return keyArray[0];
  },
});
