module.exports = {
  signup (user, successCallback, errorCallback) {
    $.ajax({
      url: '/api/users',
      method: 'POST',
      dataType: 'JSON',
      data: {user: user},
      success (newUser) {
        successCallback(newUser);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  },
  login (user, successCallback, errorCallback) {
    $.ajax({
      url: '/api/session',
      method: 'POST',
      dataType: 'JSON',
      data: {user: user},
      success (newUser) {
        successCallback(newUser);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  },
  logout (successCallback) {
    $.ajax({
      url: '/api/session',
      method: 'DELETE',
      dataType: 'JSON',
      success (newUser) {
        successCallback(newUser);
      }
    });
  }
};
