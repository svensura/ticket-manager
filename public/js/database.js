$(document).ready(function () {
  usersList();
});

// Get all Users to display
usersList = () => {

  var token = window.localStorage.getItem('token');

  $.ajax({
    "url": 'http://127.0.0.1:3001/users',
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (users) {
     userListSuccess(users);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

// Display all Users returned from Web API call
userListSuccess = (users) => {
  // Iterate over the collection of data
  $.each(users, (index, user) => {
    // Add a row to the Users table
    userAddRow(user);
  });
}

// Add User row to <table>
userAddRow = (user) => {
  // First check if a <tbody> tag exists, add one if not
  if ($("#userTable tbody").length == 0) {
    $("#userTable").append("<tbody></tbody>");
  }

  // Append row to <table>
  $("#userTable tbody").append(
    userBuildTableRow(user));
}

// Build a <tr> for a row of table data
function userBuildTableRow(user) {
  var ret = "<tr>" +
      "<td>" +
        "<button type='button' " +
          "onclick='userGet(this);' " +
          "class='btn btn-default' " +
          "data-id='" + user._id + "'>" +
          "<span class='glyphicon glyphicon-edit' />"
          + "</button>" +
        "</td >" +
        "<td>" + user.name + "</td>" +
        "<td>" + user.email + "</td>" +
        "<td>" + user.phone + "</td>" +
        "<td>" +
        "<button type='button' " +
        "onclick='userDelete(this);' " +
        "class='btn btn-default' " +
        "data-id='" + user._id + "'>" +
        "<span class='glyphicon glyphicon-remove' />" +
        "</button>" +
      "</td>" +
    "</tr>";

  return ret;
}

function userGet(ctl) {

  var token = window.localStorage.getItem('token');

  // Get product id from data- attribute
  var id = $(ctl).data("id");
  console.log(id);
  
  // Store product id in hidden field
  $("#userid").val(id);

  // Call Web API to get a Product
  $.ajax({
    "url": `http://127.0.0.1:3001/users/${id}`,
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (user) {
      userToFields(user);

      // Change Update Button Text
      $("#updateButton").text("Update");
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function userToFields(user) {
  $("#username").val(user.name);
  $("#email").val(user.email);
  $("#phone").val(user.phone);
}

// Handle click event on Update button
function updateClick() {
      // Build user object from inputs
      User = new Object();
      User._id = $("#userid").val();
      User.name = $("#username").val();
      User.email = $("#email").val();
      User.phone = $("#phone").val();
      User.password = $("#password").val();

      if ($("#updateButton").text().trim() == "Add") {
        userAdd(User);
      }
      else {
        userUpdate(User);
      }
    }

function addClick() {
  formClear();
}

function userUpdate(user) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.name = user.name
  data.email = user.email
  data.phone = user.phone
  if (user.password.length !== 0) {
    if (user.password.length > 6) {
      data.password = user.password
    } else {
      window.alert("Password must be at least 7 characters long")
    }
  }

  // Call Web API to update user
  $.ajax({
    "url": `http://127.0.0.1:3001/users/${user._id}`,
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (user) {
    userUpdateSuccess(user);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function userUpdateSuccess(user) {
  userUpdateInTable(user);
}

function userAdd(user) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.name = user.name
  data.email = user.email
  data.phone = user.phone
 if (user.password.length > 6) {
      data.password = user.password
  } else {
    window.alert("Password is required and must be at least 7 characters long")
  }

  // Call Web API to add a new user
  $.ajax({
    "url": `http://127.0.0.1:3001/users`,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (reply) {
      userAddSuccess(reply.user);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function userAddSuccess(user) {
  console.log(user)
  userAddRow(user);
  formClear();
}

// Update user in <table>
function userUpdateInTable(user) {
  // Find User in <table>
  var row = $("#userTable button[data-id='" + user._id + "']")
            .parents("tr")[0];
  // Add changed user to table
  $(row).after(userBuildTableRow(user));
  // Remove original product
  $(row).remove();

  // Clear form fields
  formClear();

  // Change Update Button Text
  $("#updateButton").text("Add");
}

// Handle click event on Add button
function addClick() {
  console.log('addClick');
  
}


 // Delete user from <table>
 function userDelete(ctl) {

  var token = window.localStorage.getItem('token');

  var id = $(ctl).data("id");

  // Call Web API to delete a user
  $.ajax({
    "url": `http://127.0.0.1:3001/users/${id}`,
    "method": "DELETE",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": ''
    ,
    success: function (user) {
      $(ctl).parents("tr").remove();
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

// Handle exceptions from AJAX calls
handleException = (request, message, error) => {
  var msg = "";

  msg += "Code: " + request.status + "\n";
  msg += "Text: " + request.statusText + "\n";
  if (request.responseJSON != null) {
    msg += "Message" + request.responseJSON.Message + "\n";
  }

  alert(msg);
}

// Clear form fields
function formClear() {
  $("#username").val("");
  $("#email").val("");
  $("#phone").val("");
  $("#password").val("");
}