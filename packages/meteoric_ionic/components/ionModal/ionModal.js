/* eslint-disable no-underscore-dangle */
/* global Template Meteor Blaze _ $ */
/* global IonModal Platform */
import { get as lodashGet } from 'lodash';
// eslint-disable-next-line no-global-assign
IonModal = {
  transitionEndEvent: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
  animationEndEvent: 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd',
  enterClasses: ['ng-enter', 'slide-in-up'],
  enterActiveClass: 'ng-enter-active',
  leaveClasses: ['ng-leave', 'slide-in-up'],
  leaveActiveClass: 'ng-leave-active',
  view: {},
  views: [],
  open (templateName, data) {
    Meteor.defer(function () {
      this.template = Template[templateName];
      this.views.push(templateName);
      if (!this.view[templateName]) this.view[templateName] = [];

      const view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));
      this.view[templateName].push(view);

      const $modalBackdrop = $(view.firstNode());
      const $modal = $('.modal', $modalBackdrop);

      if (this.views.length === 1) {
        $modalBackdrop.addClass('active');
      }

      $modal.addClass(this.enterClasses.join(' '));
      Meteor.setTimeout(function () {
        $modal.addClass(this.enterActiveClass);
      }.bind(this), 50);
    }.bind(this));
  },
  close (templateName) {
    this.templateClosed = templateName;
    Meteor.defer(function () {
      const templateNameDefer = this.templateClosed || this.views.slice(-1)[0];
      delete this.templateClosed;

      const view = (this.view[templateNameDefer] || []).slice(-1)[0];
      if (!view) return;

      const $modalBackdrop = $(view.firstNode());
      const $modal = $('.modal', $modalBackdrop);

      $modal.addClass(this.leaveClasses.join(' '));
      Meteor.setTimeout(function () {
        $modal.addClass(this.leaveActiveClass);
      }.bind(this), 50);

      $modalBackdrop.fadeOut(500, function() {
        $('body').removeClass('modal-open');
      });
    }.bind(this));
  },
};

const getElementModalTemplateName = function (element) {
  const modal = $(element).parents('.modal').get(0);
  const modalView = Blaze.getView(modal);
  // lodashGet
  const tplView = Meteor._get(modalView, 'parentView', 'parentView'); // Twice because the parent view is a #with block
  const tplName = tplView.name.slice('Template.'.length, tplView.name.length);
  return tplName;
};


$(document).delegate('.modal', IonModal.transitionEndEvent, function(e) {
  const $modal = $(e.currentTarget);
  if ($modal.hasClass(IonModal.enterClasses.join(' ')) || $modal.hasClass(IonModal.enterActiveClasse)) {
    $modal.removeClass(IonModal.enterClasses.join(' ')).removeClass(IonModal.enterActiveClass);
    $('body').addClass('modal-open');
  } else if ($modal.hasClass(IonModal.leaveClasses.join(' ')) || $modal.hasClass(IonModal.leaveActiveClasse)) {
    const firstChild = $modal.children().first();
    const templateName = getElementModalTemplateName(firstChild);
    IonModal.views = _.without(IonModal.views, templateName);
    const view = IonModal.view[templateName].pop();
    const $modalBackdrop = $(view.firstNode());
    $modalBackdrop.removeClass('active');
    $modal.removeClass(IonModal.leaveClasses.join(' ')).removeClass(IonModal.leaveActiveClass).off(IonModal.transitionEndEvent);
    $('body').removeClass('modal-open');
    $(e.target).parents('.modal-backdrop').remove();
    Blaze.remove(view);
  }
});

Template.ionModal.onCreated(function () {
  this.data = this.data || {};
  this.customTemplate = this.data.customTemplate || false;
  this.title = this.data.title;
  this.title = this.data.closeText;
  this.focusFirstInput = _.isUndefined(this.data.focusFirstInput) ? true : this.data.focusFirstInput;
  this.animation = this.data.animation || 'slide-in-up';
});

Template.ionModal.onRendered(function () {
  if (this.focusFirstInput) {
    Meteor.setTimeout(function () {
      if (!this._domrange) return;
      this.$('input:first').focus();
    }.bind(this), 600);
  }
  $(window).on('keyup.ionModal', function (event) {
    event.stopImmediatePropagation();
    if (event.which === 27) {
      IonModal.close();
    }
  });
});

Template.ionModal.onDestroyed(function () {
  if (!IonModal.views.length) {
    $(window).off('keyup.ionModal');
  }
});

Template.ionModal.helpers({
  barClass () {
    const defaultClasses = ['bar', 'bar-header', 'bar-stable'].join(' ');
    const customClasses = _.isString(this.barClass) ? this.barClass : '';
    return [defaultClasses, customClasses].join(' ');
  },

  titleClass () {
    const classes = ['title'];

    if (Platform.isAndroid()) {
      classes.push('title-left');
    }

    return classes.join(' ');
  },

  title () {
    return this.title;
  },

  closeText () {
    return this.closeText;
  },

  animation () {
    return this.animation || 'slide-in-up';
  },

  customTemplate () {
    return this.customTemplate;
  },

  classes () {
    const classes = ['modal'];

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  },

});

Template.ionModal.events({
  // Handle clicking the backdrop
  click (event) {
    if ($(event.target).hasClass('modal-backdrop')) {
      IonModal.close();
    }
  },
  'click [data-dismiss=modal]' (event) {
    const tplName = getElementModalTemplateName(event.currentTarget);
    IonModal.close(tplName);
  },
});

