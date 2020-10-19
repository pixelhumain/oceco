import { Template } from 'meteor/templating';
import IOlazy from '../../ui/components/iolazyload.js';

import './images.html';

Template.imgDoc.onRendered(function () {
  // eslint-disable-next-line no-new
  new IOlazy({
    image: 'img',
    threshold: 1,
  });
});
