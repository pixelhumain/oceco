/* global Template Blaze $ */
/* global IonPopover */
const POPOVER_BODY_PADDING = 6;

// eslint-disable-next-line no-global-assign
IonPopover = {
  show (templateName, data, button) {
    this.template = Template[templateName];
    this.view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));

    const $backdrop = $(this.view.firstNode());
    const $popover = $backdrop.find('.popover');
    const $button = $(button);
    const $arrow = $backdrop.find('.popover-arrow');

    const bodyWidth = $('body').width();
    const bodyHeight = $(window).innerHeight();
    const buttonPosition = $button.offset();
    const buttonWidth = $button.outerWidth();
    const buttonHeight = $button.outerHeight();
    const popoverWidth = $popover.outerWidth();
    const popoverHeight = $popover.outerHeight();

    const popoverCSS = {
      marginLeft: '0',
      opacity: 1,
      left: buttonPosition.left + buttonWidth / 2 - popoverWidth / 2,
    };

    if (popoverCSS.left < POPOVER_BODY_PADDING) {
      popoverCSS.left = POPOVER_BODY_PADDING;
    } else if (popoverCSS.left + popoverWidth + POPOVER_BODY_PADDING > bodyWidth) {
      popoverCSS.left = bodyWidth - popoverWidth - POPOVER_BODY_PADDING;
    }

    if (buttonPosition.top + buttonHeight + popoverHeight > bodyHeight) {
      popoverCSS.top = buttonPosition.top - popoverHeight;
      $popover.addClass('popover-bottom animated slideInUp');
    } else {
      popoverCSS.top = buttonPosition.top + buttonHeight;
      $popover.removeClass('popover-bottom');
      $popover.addClass('popover-bottom animated slideInDown');
    }

    $backdrop.addClass('active');

    $arrow.css({
      left: `${buttonPosition.left + buttonWidth / 2 - $arrow.outerWidth() / 2 - popoverCSS.left}px`,
    });
    $popover.css(popoverCSS);
  },

  hide () {
    if (typeof this.view !== 'undefined') {
      const $backdrop = $(this.view.firstNode());
      const $popover = $backdrop.find('.popover');
      $popover.addClass('fadeOut');
      $popover.removeClass('slideInDown');
      // $popover.css({opacity: 0});
      // $backdrop.removeClass('active');
      Blaze.remove(this.view);
    }
  },
};

Template.ionPopover.onRendered(function () {
  $(window).on('keyup.ionPopover', function (event) {
    if (event.which === 27) {
      IonPopover.hide();
    }
  });
});

Template.ionPopover.onDestroyed(function () {
  $(window).off('keyup.ionPopover');
});

Template.ionPopover.events({
  // Handle clicking the backdrop
  click (event) {
    if ($(event.target).hasClass('popover-backdrop')) {
      IonPopover.hide();
    }
  },
});
