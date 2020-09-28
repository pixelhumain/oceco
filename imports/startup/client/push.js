/* eslint-disable no-shadow */
/* eslint-disable no-redeclare */
/* eslint-disable no-useless-escape */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* global Desktop PushNotification */
import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Router } from 'meteor/iron:router';
import { Tracker } from 'meteor/tracker';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';

import { ActivityStream } from '../../api/activitystream.js';

import { notifyDisplay } from '../../api/helpers.js';

if (Meteor.isDevelopment) {
  Push.debug = true;
}

Meteor.startup(function () {
  if (Meteor.isDesktop) {
    // console.log('DESKTOP');

    const query = {};
    query.created = { $gt: new Date() };
    const options = {};
    options.sort = { created: 1 };
    var initNotifystart = ActivityStream.find(query, options).observe({
      added(notification) {
        if (!initNotifystart) return;
        // console.log(Desktop.getAssetUrl('\___desktop\icon.png'));
        Desktop.send('systemNotifications', 'notify', {
          title: 'notification',
          text: notifyDisplay(notification.notify),
          icon: '\___desktop\icon.png',
          data: notification,
        });
        Desktop.send('systemNotifications', 'setBadge', ActivityStream.find({}).count());
      },
    });

    Desktop.on('systemNotifications', 'notificationClicked', (sender, data) => {
      // console.log(data);
      if (data.notify.url) {
        // Meteor.call('markRead',data._id);
        // Meteor.call('registerClick', data._id);
        // Router.go(data.link);
        Router.go('/notifications');
      } else {
        Router.go('/notifications');
      }
    });
  } else if (Meteor.isCordova) {
    PushNotification.createChannel(
      function () {
        // console.log('Channel Created!');
      },
      function () {
        // console.log('Channel not created :(');
      }, {
        id: 'PushPluginChannel',
        description: 'Channel Name Shown To Users',
        importance: 3,
        vibration: true,
      },
    );

    Push.Configure({
      cordovaOptions: {
        // Options here are passed to phonegap-plugin-push
        android: {
          sound: true,
          vibrate: true,
          clearBadge: false,
          clearNotifications: true,
          forceShow: false,
          icon: 'ic_stat_co_24',
          iconColor: '#6B97AF',
        },
      },
      appName: 'main',
    });

    /* Push.Configure({
      android: {
        senderID: 653253366584,
        alert: true,
        badge: true,
        sound: true,
        vibrate: true,
        clearNotifications: true,
        icon: 'ic_stat_co_24',
        iconColor: '#6B97AF',
      },
      ios: {
        alert: true,
        badge: true,
        sound: true,
      },
    }); */

    Push.addListener('startup', function() {
      Router.go('/notifications');
    });

    Push.addListener('message', function(notification) {
      function alertDismissed(buttonIndex) {
        if (buttonIndex === 1) {
          // const payload = JSON.parse(notification.payload);
          // if (payload.url) {
          //  Router.go('/notifications');
          // } else {
          Router.go('/notifications');
          // }
        }
      }
      // eslint-disable-next-line no-alert
      window.confirm(notification.message, alertDismissed, 'notifications', ['Voir', 'fermer']);
    });
  } else if (!('Notification' in window)) {
    // eslint-disable-next-line no-alert
    alert('This browser does not support desktop notification');
  } else {
    if (Notification.permission !== 'denied') {
      Notification.requestPermission(function () {
      });
    }

    if (Notification.permission === 'granted') {
      const query = {};
      query.created = { $gt: new Date() };
      const options = {};
      options.sort = { created: 1 };
      var initNotifystart = ActivityStream.find(query, options).observe({
        added(notification) {
          if (!initNotifystart) return;
          const textTarget = `${notifyDisplay(notification.notify)} - ${notification.target.name}`;
          const options = {
            body: textTarget,
            icon: '/icon.png',
            data: notification,
          };
          const n = new Notification('notification', options);
          n.onclick = function() {
            if (notification.notify.url) {
              // console.log(notification.notify.url);
              // Meteor.call('markRead',notification._id);
              // Meteor.call('registerClick', notification._id);
              // Router.go(notification.link);
              Router.go('/notifications');
              // window.open(Router.path[notification.link].url(), '_self');
              window.focus();
            } else {
              Router.go('/notifications');
              // window.open(Router.routes['notifications'].url(), '_self');
              window.focus();
            }
          };
          Meteor.setTimeout(n.close.bind(n), 5000);
        },
        changed() {
          // console.log(NotificationHistory.find({}).count());
          // Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
        },
        removed() {
          // console.log(NotificationHistory.find({}).count());
          // Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
        },
      });
    }
  }
});

Tracker.autorun(() => {
  if (Meteor.userId()) {
    if (Counter.get(`notifications.${Meteor.userId()}.Unseen`)) {
      if (Meteor.isDesktop) {
        Desktop.send('systemNotifications', 'setBadge', Counter.get(`notifications.${Meteor.userId()}.Unseen`));
      } else if (Meteor.isCordova) {
        Push.setBadge(Counter.get(`notifications.${Meteor.userId()}.Unseen`));
      } else {
        // web
      }
    }
  }
});

