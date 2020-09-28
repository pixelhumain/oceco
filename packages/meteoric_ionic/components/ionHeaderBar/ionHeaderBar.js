/* eslint-disable meteor/no-session */
/* global Template Session $ */
/* global IonHeaderBar Platform */
// eslint-disable-next-line no-global-assign
IonHeaderBar = {
  alignTitle () {
    const align = this.data.alignTitle || 'center';
    const $title = this.$('.title');

    if (Platform.isAndroid() && !this.alignTitle) {
      $title.addClass('title-left');
      return;
    }

    if (align === 'center') {
      $title.addClass('title-center');
    } else if (align === 'left') {
      $title.addClass('title-left');
    } else if (align === 'right') {
      $title.addClass('title-right');
    }
  },

  positionTitle () {
    const $title = this.$('.title');
    const $leftButton = $('.bar.button.pull-left');
    const $rightButton = $('.bar.button.pull-right');

    // Find out which button is wider,
    // use that to offset the title on both sides
    let leftButtonWidth = 0;
    let rightButtonWidth = 0;
    if ($leftButton.length) {
      $leftButton.each(function(index, element) {
        leftButtonWidth += $(element).outerWidth();
      });
    }
    if ($rightButton.length) {
      $rightButton.each(function(index, element) {
        rightButtonWidth += $(element).outerWidth();
      });
    }

    // If we're on Android, we only care about the left button
    let margin;
    if (Platform.isAndroid()) {
      margin = leftButtonWidth;
    } else {
      margin = Math.max(leftButtonWidth, rightButtonWidth);
    }
    $title.css('left', margin);
    $title.css('right', margin);
  },
};

Template.ionHeaderBar.onCreated(function () {
  this.data = this.data || {};
});

Template.ionHeaderBar.onRendered(function () {
  Session.set('hasHeader', true);
  IonHeaderBar.alignTitle.call(this);
  IonHeaderBar.positionTitle.call(this);
});

Template.ionHeaderBar.onDestroyed(function () {
  Session.set('hasHeader', false);
});

Template.ionHeaderBar.helpers({
  classes () {
    const classes = ['bar', 'bar-header'];

    if (this.class) {
      classes.push(this.class);
    } else {
      classes.push('bar-stable');
    }

    return classes.join(' ');
  },
});
