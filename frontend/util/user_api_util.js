module.exports = {
  updateUser (user, successCallback, errorCallback) {
    $.ajax({
      url: `/api/users/${user.id}`,
      method: 'PATCH',
      dataType: 'JSON',
      data: {user: user},
      success (newUser) {
        successCallback(newUser);
      },
      error (errors) {
        errorCallback(JSON.parse(errors.responseText));
      }
    });
  }
};
