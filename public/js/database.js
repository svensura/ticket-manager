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

      console.log(JSON.stringify(user))

      // Call Web API to update product
      $.ajax({
        "url": `http://127.0.0.1:3001/users/${user.d}`,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        "data": `${JSON.stringify(user)}`
        success: function (user) {
          // productUpdateSuccess(user);
        },
        error: function (request, message, error) {
          handleException(request, message, error);
        }
      });
    }

    function productUpdateSuccess(user) {
      productUpdateInTable(user);
    }


// Handle click event on Add button
function addClick() {
  console.log('addClick');
  
}

// Handle click event on Add button
function loginClick() {
  console.log('loginClick');
  
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