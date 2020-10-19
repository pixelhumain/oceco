/* global Meteor */
import { Accounts } from 'meteor/accounts-base';
import { HTTP } from 'meteor/http';

Accounts.registerLoginHandler(function(loginRequest) {
  if (!loginRequest.email || !loginRequest.pwd) {
    return null;
  }

  const response = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/authenticatetoken`, {
    params: {
      email: loginRequest.email,
      pwd: loginRequest.pwd,
      tokenName: 'comobi',
    },
  });

  if (response && response.data && response.data.result === true && response.data.id) {
    let userId = null;
    let retourId = null;

    if (response.data.id && response.data.id.$id) {
      retourId = response.data.id.$id;
    } else {
      retourId = response.data.id;
    }
    // console.log(response.data);

    // ok valide
    const userM = Meteor.users.findOne({ _id: retourId });

    const token = response.data.token ? response.data.token : false;

    // console.log(userM);
    if (userM) {
      // Meteor.user existe
      userId = userM._id;
      if (token) {
        const profile = {};
        profile.token = token;
        Meteor.users.update(userId, { $set: { profile } });
      }
      Meteor.users.update(userId, { $set: { emails: [loginRequest.email] } });
    } else {
      // Meteor.user n'existe pas
      // username ou emails
      userId = Meteor.users.insert({ _id: retourId, emails: [loginRequest.email] });
      if (token) {
        const profile = {};
        profile.token = token;
        Meteor.users.update(userId, { $set: { profile } });
      }
    }

    // eslint-disable-next-line no-underscore-dangle
    const stampedToken = Accounts._generateStampedLoginToken();
    Meteor.users.update(userId,
      { $push: { 'services.resume.loginTokens': stampedToken } },
    );
    this.setUserId(userId);
    // console.log(userId);
    return {
      userId,
      token: stampedToken.token,
    };
  }
  if (response && response.data && response.data.result === false) {
    throw new Meteor.Error(Accounts.LoginCancelledError.numericError, response.data.msg);
  } else if (response && response.data && response.data.result === true && response.data.msg) {
    throw new Meteor.Error(response.data.msg);
  }
});
