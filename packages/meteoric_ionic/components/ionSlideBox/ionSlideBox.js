/* eslint-disable meteor/no-session */
/* global Template Session $ */


Template.ionSlideBox.onCreated(function () {
  this.data = this.data || {};
  this.doesContinue = this.data.doesContinue || false;
  this.autoPlay = this.data.autoPlay || false;
  this.slideInterval = this.data.slideInterval || 4000;
  this.showPager = typeof this.data.showPager !== 'undefined' ? this.data.showPager : true;
  this.initialSlide = this.data.initialSlide || Session.get('ion-slide-initial-slide') || 0;
});

Template.ionSlideBox.onRendered(function () {
  this.$('.ion-slide-box').slick({
    infinite: this.doesContinue,
    autoplay: this.autoPlay,
    autoplaySpeed: this.slideInterval,
    arrows: false,
    dots: this.showPager,
    dotsClass: 'slider-pager',
    initialSlide: this.initialSlide,
    customPaging(slider, i) {
      return '<span class="slider-pager-page icon ion-record"></span>';
    },
  });
  this.$('.ion-slide-box').on('afterChange', function (event, slick, currentSlide) {
    $(this).trigger({ type: 'onSlideChanged', index: currentSlide });
  });
});

Template.ionSlideBox.onDestroyed(function () {
  const $slideBox = this.$('.ion-slide-box');
  if ($slideBox.hasClass('slick-initialized')) $slideBox.slick('unslick');
});
