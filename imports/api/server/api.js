/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { request } from 'meteor/froatsnook:request';

export const apiCommunecter = {};

const callPixelRest = (token, method, controller, action, post) => {
  // post['json'] = 1;
  // console.log(post);
  const responsePost = HTTP.call(method, `${Meteor.settings.endpoint}/${controller}/${action}`, {
    headers: {
      'X-Auth-Token': token,
      'X-User-Id': Meteor.userId(),
      'X-Auth-Name': 'comobi',
      // Origin: 'https://co-mobile.communecter.org',
    },
    params: post,
    npmRequestOptions: {
      jar: true,
    },
  });
  // console.log(responsePost);
  if (responsePost && responsePost.data && responsePost.data.result) {
    return responsePost;
  }
  if (responsePost && responsePost.data && responsePost.data.msg) {
    // console.log(responsePost);
    throw new Meteor.Error('error_call', responsePost.data.msg);
  } else {
    throw new Meteor.Error('error_server', 'error server');
  }
};

const callPixelMethodRest = (token, method, controller, action, post) => {
  post.json = 1;
  // console.log(post);
  const responsePost = HTTP.call(method, `${Meteor.settings.endpoint}/${controller}/${action}`, {
    headers: {
      'X-Auth-Token': token,
      'X-User-Id': Meteor.userId(),
      'X-Auth-Name': 'comobi',
      // Origin: 'https://co-mobile.communecter.org',
    },
    params: post,
    npmRequestOptions: {
      jar: true,
    },
  });
  // console.log(responsePost);
  if (responsePost && responsePost.data) {
    return responsePost;
  }
  throw new Meteor.Error('error_server', 'error server');
};

apiCommunecter.postPixel = function(controller, action, params) {
  const userC = Meteor.users.findOne({ _id: Meteor.userId() });
  // console.log(userC.services.resume.loginTokens[0]);
  if (userC && userC.profile && userC.profile.token) {
    const retour = callPixelRest(userC.profile.token, 'POST', controller, action, params);
    return retour;
  }
  throw new Meteor.Error('Error identification');
};

apiCommunecter.postPixelMethod = function(controller, action, params) {
  const userC = Meteor.users.findOne({ _id: Meteor.userId() });
  if (userC && userC.profile && userC.profile.token) {
    const retour = callPixelMethodRest(userC.profile.token, 'POST', controller, action, params);
    return retour;
  }
  throw new Meteor.Error('Error identification');
};

apiCommunecter.callRCRestUserToken = (userId, method, action, post) => {
  // console.log(post);
  const params = {};
  params.userId = userId;
  const auth = apiCommunecter.callRCrest('POST', 'users.createToken', params);
  if (auth && auth.data && auth.data.authToken) {
    try {
      const responsePost = HTTP.call(method, `${Meteor.settings.rocketchat.host}/api/v1/${action}`, {
        headers: {
          'X-Auth-Token': auth.data.authToken,
          'X-User-Id': auth.data.userId,
          // 'Content-type': 'application/json'
        },
        params: post,
      });
      // console.log(responsePost);
      if (responsePost && responsePost.data && responsePost.data.success) {
        return responsePost.data;
      }
    } catch (error) {
      // console.log(error.response.data.error);
      if (error && error.response && error.response.data && error.response.data.error) {
        throw new Meteor.Error(error.response.data.errorType, error.response.data.error);
      } else {
        throw new Meteor.Error('error_server', 'error server RC');
      }
    }
  }
};

apiCommunecter.callRCrest = (method, action, post) => {
  // console.log(post);
  try {
    const responsePost = HTTP.call(method, `${Meteor.settings.rocketchat.host}/api/v1/${action}`, {
      headers: {
        'X-Auth-Token': Meteor.settings.rocketchat.token,
        'X-User-Id': Meteor.settings.rocketchat.userId,
        // 'Content-type': 'application/json'
      },
      params: post,
    });
    // console.log(responsePost);
    if (responsePost && responsePost.data && responsePost.data.success) {
      return responsePost.data;
    }
  } catch (error) {
    // console.log(error.response.data.error);
    if (error && error.response && error.response.data && error.response.data.error) {
      throw new Meteor.Error(error.response.data.errorType, error.response.data.error);
    } else {
      throw new Meteor.Error('error_server', 'error server RC');
    }
  }
};

apiCommunecter.callRCInfo = (name) => {
  const params = {};
  params.roomName = name;
  const info = apiCommunecter.callRCrest('GET', 'rooms.info', params);
  if (info) {
    const room = {};
    room._id = info.room._id;
    room.fname = info.room.fname;
    room.type = info.room.t === 'c' ? 'channel' : 'group';
    return room;
  }
};


apiCommunecter.callRCPostMessage = (name, params, userId) => {
  const info = apiCommunecter.callRCInfo(name);
  if (info) {
    params.roomId = info._id;
    params.alias = 'oceco';
    // params.emoji = '';
    params.avatar = Meteor.isDevelopment ? Meteor.absoluteUrl('/avatar.png', { rootUrl: 'http://192.168.1.24:3000' }) : Meteor.absoluteUrl('/avatar.png');
    // const userIdTarget = userId || Meteor.userId();
    // const retour = apiCommunecter.callRCRestUserToken(userIdTarget, 'POST', 'chat.postMessage', params);
    const retour = apiCommunecter.callRCrest('POST', 'chat.postMessage', params);
    // console.log(retour);
    return retour;
  }
};


const dataUriToBuffer = (uri) => {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }

  // strip newlines
  uri = uri.replace(/\r?\n/g, '');

  // split the URI up into the "metadata" and the "data" portions
  const firstComma = uri.indexOf(',');
  if (firstComma === -1 || firstComma <= 4) throw new TypeError('malformed data: URI');

  // remove the "data:" scheme and parse the metadata
  const meta = uri.substring(5, firstComma).split(';');

  let base64 = false;
  for (let i = 0; i < meta.length; i += 1) {
    if (meta[i] === 'base64') {
      base64 = true;
    } else if (meta[i].indexOf('charset=') === 0) {
      charset = meta[i].substring(8);
    }
  }

  // get the encoded data portion and decode URI-encoded chars
  const data = unescape(uri.substring(firstComma + 1));

  const encoding = base64 ? 'base64' : 'ascii';
  // const buffer = new Buffer(data, encoding);
  const buffer = new Buffer.from(data, encoding);

  // set `.type` property to MIME type
  buffer.type = meta[0] || 'text/plain';

  // set the `.charset` property
  // buffer.charset = charset;

  return buffer;
};

const callPixelUploadRest = (token, folder, ownerId, input, dataURI, name) => {
  const fileBuf = dataUriToBuffer(dataURI);
  const formData = {};
  // formData['X-Auth-Token'] = token;
  // formData['X-User-Id'] = Meteor.userId();
  formData[input] = {
    value: fileBuf,
    options: {
      filename: name,
      contentType: 'image/jpeg',
    },
  };
  const requestWithToken = request.defaults({
    headers: { 'X-Auth-Token': token, 'X-User-Id': Meteor.userId(), 'X-Auth-Name': 'comobi' },
  });
  const responsePost = requestWithToken.postSync(`${Meteor.settings.endpoint}/${Meteor.settings.module}/document/upload/dir/communecter/folder/${folder}/ownerId/${ownerId}/input/${input}`, {
    formData,
    jar: true,
  });
  responsePost.data = JSON.parse(responsePost.response.body);
  if (responsePost && responsePost.data && responsePost.data.success === true) {
    return responsePost.data;
  }
  if (responsePost && responsePost.data && responsePost.data.msg) {
    throw new Meteor.Error('error_call', responsePost.data.msg);
  } else {
    throw new Meteor.Error('error_server', 'error server');
  }
};

const callPixelUploadSaveRest = (token, folder, ownerId, input, dataURI, name, doctype, contentKey, params = null) => {
  const fileBuf = dataUriToBuffer(dataURI);
  const formData = {};
  // formData['X-Auth-Token'] = token;
  // formData['X-User-Id'] = Meteor.userId();
  formData[input] = {
    value: fileBuf,
    options: {
      filename: name,
      contentType: 'image/jpeg',
    },
  };
  if (params) {
    if (params.parentId) {
      formData.parentId = params.parentId;
    }
    if (params.parentType) {
      formData.parentType = params.parentType;
    }
    if (input) {
      formData.formOrigin = input;
    }
  }
  const requestWithToken = request.defaults({
    headers: { 'X-Auth-Token': token, 'X-User-Id': Meteor.userId(), 'X-Auth-Name': 'comobi' },
  });
  const responsePost = requestWithToken.postSync(`${Meteor.settings.endpoint}/${Meteor.settings.module}/document/uploadSave/dir/communecter/folder/${folder}/ownerId/${ownerId}/input/${input}/docType/${doctype}/contentKey/${contentKey}`, {
    formData,
    jar: true,
  });
  responsePost.data = JSON.parse(responsePost.response.body);
  if (responsePost && responsePost.data && responsePost.data.success === true) {
    return responsePost.data;
  }
  if (responsePost && responsePost.data && responsePost.data.msg) {
    throw new Meteor.Error('error_call', responsePost.data.msg);
  } else {
    throw new Meteor.Error('error_server', 'error server');
  }
};


apiCommunecter.postUploadPixel = (folder, ownerId, input, dataBlob, name) => {
  const userC = Meteor.users.findOne({ _id: Meteor.userId() });
  if (userC && userC.profile && userC.profile.token) {
    const retour = callPixelUploadRest(userC.profile.token, folder, ownerId, input, dataBlob, name);
    if (retour && retour.name) {
      return retour;
    }
    throw new Meteor.Error('Error upload');
  } else {
    throw new Meteor.Error('Error identification');
  }
};

apiCommunecter.postUploadSavePixel = (folder, ownerId, input, dataBlob, name, doctype, contentKey, params = null) => {
  const userC = Meteor.users.findOne({
    _id: Meteor.userId(),
  });
  if (userC && userC.profile && userC.profile.token) {
    const retour = callPixelUploadSaveRest(userC.profile.token, folder, ownerId, input, dataBlob, name, doctype, contentKey, params);
    if (retour && retour.name) {
      return retour;
    }
    throw new Meteor.Error('Error upload');
  } else {
    throw new Meteor.Error('Error identification');
  }
};

apiCommunecter.authPixelRest = (email, pwd) => {
  const response = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/authenticatetoken`, {
    params: {
      pwd,
      email,
    },
    npmRequestOptions: {
      jar: true,
    },
  });
  return response;
};
