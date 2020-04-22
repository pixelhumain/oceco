import { Meteor } from 'meteor/meteor';
import JoSk from 'meteor/ostrio:cron-jobs';
import { ActivityStream } from '../activitystream.js';
import { Actions } from '../actions.js';

const bound = Meteor.bindEnvironment((callback) => {
  callback();
});

const db = Meteor.users.rawDatabase();
const job = new JoSk({ db, autoClear: true });

const taskStart = (ready) => {
  bound(() => {
    // action start
    const inputDate = new Date();
    const query = {};
    query.startDate = { $lte: inputDate };
    query.status = 'todo';
    query.endDate = { $gt: inputDate };
    query['notifLog.start'] = { $exists: false };
    const actionCursor = Actions.find(query);

    // console.log(query);

    actionCursor.forEach((actionOne) => {
      // notification
      const notif = {};
      notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', links: actionOne.links, parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
      ActivityStream.api.add(notif, 'startAction', 'isActionMembers');
      // notification

      // bloque le passage
      const notifLog = {};
      notifLog.start = true;
      Actions.update({ _id: actionOne._id }, { $set: { notifLog } });
    });

    ready();
  });
};

const taskEnd = (ready) => {
  bound(() => {
    // action end
    const inputDate = new Date();
    const query = {};
    query.startDate = { $lt: inputDate };
    query.status = 'todo';
    query.endDate = { $lte: inputDate };
    query['notifLog.end'] = { $exists: false };
    query['notifLog.start'] = true;
    const actionCursor = Actions.find(query);

    // console.log(query);

    actionCursor.forEach((actionOne) => {
      // notification
      const notif = {};
      notif.object = { id: actionOne._id._str, name: actionOne.name, type: 'actions', links: actionOne.links, parentType: actionOne.parentType, parentId: actionOne.parentId, idParentRoom: actionOne.idParentRoom };
      ActivityStream.api.add(notif, 'endAction', 'isActionMembers');
      // notification

      // bloque le passage
      Actions.update({ _id: actionOne._id }, { $set: { 'notifLog.end': true } });
    });

    ready();
  });
};


Meteor.startup(function () {
  job.setInterval(taskStart, 5 * 1000, 'taskStart');
  job.setInterval(taskEnd, 5 * 1000, 'taskEnd');
});
