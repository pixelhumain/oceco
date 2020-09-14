/* eslint-disable no-undef */
import { Email } from 'meteor/email';
import mjml2html from 'mjml';

const Handlebars = Npm.require('handlebars');

const MJML = class MJML {
  constructor(file) {
    this.mjml = file;
  }
  helpers(object) {
    this.helpers = object;
  }
  compile() {
    const text = Handlebars.compile(this.mjml)(this.helpers || {});
    return mjml2html(text).html;
  }
  send(mailOptions) {
    mailOptions.html = this.compile();
    Email.send(mailOptions);
  }
};

export default MJML;

