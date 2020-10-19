import { Template } from 'meteor/templating';
import IOlazy from '../iolazyload.js';

import './item.html';

Template.scopeItemList.onRendered(function () {
  // eslint-disable-next-line no-new
  new IOlazy({
    image: 'img',
    threshold: 1,
  });
});

Template.scopeItemListEvent.onRendered(function () {
  // eslint-disable-next-line no-new
  new IOlazy({
    image: 'img',
    threshold: 1,
  });
});

Template.scopeItemList.helpers({
  typeI18n(type) {
    return `schemas.poirest.type.options.${type}`;
  },
});
