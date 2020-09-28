/* eslint-disable meteor/no-session */
/* global Template Session Meteor Platform $ */
/* global IonModal IonPopover IonSideMenu */
// eslint-disable-next-line no-global-assign
Platform = {
  isIOS () {
    return (!!navigator.userAgent.match(/iPad/i) || !!navigator.userAgent.match(/iPhone/i) || !!navigator.userAgent.match(/iPod/i))
           || Session.get('platformOverride') === 'iOS';
  },

  isAndroid () {
    return navigator.userAgent.indexOf('Android') > 0
           || Session.get('platformOverride') === 'Android';
  },
};

Template.registerHelper('isIOS', function () {
  return Platform.isIOS();
});

Template.registerHelper('isAndroid', function () {
  return Platform.isAndroid();
});

Template.ionBody.helpers({
  platformClasses () {
    const classes = ['grade-a'];

    if (Meteor.isCordova) {
      classes.push('platform-cordova');
    }
    if (Meteor.isClient) {
      classes.push('platform-web');
    }
    if ((Meteor.isCordova && Platform.isIOS()) || Session.get('platformOverride') === 'iOS') {
      classes.push('platform-ios');
    }
    if ((Meteor.isCordova && Platform.isAndroid()) || Session.get('platformOverride') === 'Android') {
      classes.push('platform-android');
    }

    return classes.join(' ');
  },
});


Template.ionBody.onRendered(function () {
  window.addEventListener('statusTap', function () {
    $('.content.overflow-scroll').animate({
      scrollTop: 0,
    }, 500);
  });
});


Template.ionBody.events({
  'click [data-ion-modal]' (event) {
    const instanceName = $(event.currentTarget).data('ion-modal');
    IonModal.open(instanceName, $(event.currentTarget).data());
  },

  'click [data-ion-popover]' (event) {
    const instanceName = $(event.currentTarget).data('ion-popover');
    IonPopover.show(instanceName, $(event.currentTarget).data(), event.currentTarget);
  },

  'click [data-nav-direction]' (event) {
    $('[data-nav-container]').addClass(`nav-view-direction-${$(event.target).data('nav-direction')}`);
    $('[data-navbar-container]').addClass(`nav-bar-direction-${$(event.target).data('nav-direction')}`);
  },

  'click [data-ion-menu-toggle]' (event) {
    if (!IonSideMenu.snapper) {
      return;
    }

    let direction;
    const $el = $(event.target);

    if ($el.data('ion-menu-toggle') !== '') {
      direction = $el.data('ion-menu-toggle');
    } else {
      direction = 'left';
    }

    if (IonSideMenu.snapper.state().state === direction) {
      IonSideMenu.snapper.close();
    } else {
      IonSideMenu.snapper.open(direction);
    }
  },

  'click [data-ion-menu-close]' () {
    if (!IonSideMenu.snapper) {
      return;
    }
    IonSideMenu.snapper.close();
  },
  'click [data-ion-list-toggle]' (event, instance) {
    let direction;
    const $el = $(event.target);
    if ($el.data('ion-list-toggle') !== '') {
      direction = $el.data('ion-list-toggle');
    } else {
      direction = 'left';
    }

    direction = direction.trim(); // just in case..

    const toggleListIcons = (directionParam) => {
      instance.$('.list').toggleClass(`list-${directionParam}-editing`);
      if (instance.$(`.item-${directionParam}-edit`).hasClass('visible')) {
        instance.$(`.item-${directionParam}-edit`).removeClass('active').delay(125).queue(function (next) {
          $(this).removeClass('visible');
          next();
        });
      } else {
        instance.$(`.item-${directionParam}-edit`).addClass('visible').delay(10).queue(function (next) {
          $(this).addClass('active');
          next();
        });
      }
    };

    // eslint-disable-next-line default-case
    switch (direction) {
      case 'left':
        toggleListIcons('left');
        break;
      case 'right':
        toggleListIcons('right');
        break;
      case 'both':
        toggleListIcons('left');
        toggleListIcons('right');
    }
  },

  'mousedown .button, touchstart .button' (event) {
    $(event.target).addClass('active');
  },

  'mouseup .button, touchend .button' (event) {
    $(event.target).removeClass('active');
  },
});
