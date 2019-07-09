$(document).ready(function () {
  usersList();
  venuesList();
  gigsList();

  // take focus away
  document.addEventListener('click', function(e) { if(document.activeElement.toString() == '[object HTMLButtonElement]'){ document.activeElement.blur(); } });
});

// USER_FUNCTIONS
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
      users.sort(sort_by('name', false, function(a){return a.toUpperCase()}));
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
    "</tr>" 

  return ret;
}

function userGet(ctl) {

  var token = window.localStorage.getItem('token');

  // Get product id from data- attribute
  var id = $(ctl).data("id");
  console.log(id);
  
  // Store product id in hidden field
  $("#storeid").val(id);

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
      $("#userUpdateButton").text("Update");
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
  userOpenForm()
}

// Handle click event on Update button
function userUpdateClick() {
      // Build user object from inputs
      user = new Object();
      user._id = $("#storeid").val();
      user.name = $("#username").val();
      user.email = $("#email").val();
      user.phone = $("#phone").val();
      user.password = $("#password").val();

      if ($("#userUpdateButton").text().trim() == "Add") {
        userAdd(user);
      }
      else {
        userUpdate(u^ser);
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
  userAddRow(user);
  userFormClear();
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
  userFormClear();

  // Change Update Button Text
  $("#venueUpdateButton").text("Add");
}



 // Delete user from <table>
 function userDelete(ctl) {
  $(this).blur();
  if (confirm("Are you sure ?")){
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
 }



// Clear form fields
function userFormClear() {
  $("#username").val("");
  $("#email").val("");
  $("#phone").val("");
  $("#password").val("");
  userCloseForm()
}

function userOpenForm() {
  document.getElementById("userForm").style.display = "block";
  $("#username").focus()
}

function userCloseForm() {
  document.getElementById("userForm").style.display = "none";
}

// VENUE_FUNCTIONS
// Get all Venues to display
venuesList = () => {

  var token = window.localStorage.getItem('token');

  $.ajax({
    "url": 'http://127.0.0.1:3001/venues',
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (venues) {
      venues.sort(sort_by('address', false, function(a){return a.toUpperCase()}));
      venueListSuccess(venues);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

// Display all Venues returned from Web API call
venueListSuccess = (venues) => {
  // Iterate over the collection of data
  $.each(venues, (index, venue) => {
    // Add a row to the Venues table
    venueAddRow(venue);
  });
}

// Add Venue row to <table>
venueAddRow = (venue) => {
  // First check if a <tbody> tag exists, add one if not
  if ($("#venueTable tbody").length == 0) {
    $("#venueTable").append("<tbody></tbody>");
  }

  // Append row to <table>
  $("#venueTable tbody").append(
    venueBuildTableRow(venue));
}

// Build a <tr> for a row of table data
function venueBuildTableRow(venue) {
  var ret = "<tr>" +
      "<td>" +
        "<button type='button' " +
          "onclick='venueGet(this);' " +
          "class='btn btn-default' " +
          "data-id='" + venue._id + "'>" +
          "<span class='glyphicon glyphicon-edit' />"
          + "</button>" +
        "</td >" +
        "<td>" + venue.address + "</td>" +
        "<td>" + venue.contact.name + "</td>" +
        "<td>" + venue.seats + "</td>" +
        "<td>" + 
        "<button type='button' disbabled " +
          "class='btn btn-default' disabled = 'disabled'>" +
          "<span class='" + 
        ((venue.active) ? 'glyphicon glyphicon-thumbs-up' : 'glyphicon glyphicon-thumbs-down') + "' />" +
         "</button>" +
         "</td >" + 
        "<td>" +
        "<button type='button' " +
        "onclick='venueDelete(this);' " +
        "class='btn btn-default' " +
        "data-id='" + venue._id + "'>" +
        "<span class='glyphicon glyphicon-remove' />" +
        "</button>" +
      "</td>" +
    "</tr>" 

  return ret;
}

function venueGet(ctl) {

  var token = window.localStorage.getItem('token');

  // Get product id from data- attribute
  var id = $(ctl).data("id");
  console.log(id);
  
  // Store product id in hidden field
  $("#storeid").val(id);

  // Call Web API to get a Venuet
  $.ajax({
    "url": `http://127.0.0.1:3001/venues/${id}`,
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (venue) {
      venueToFields(venue);

      // Change Update Button Text
      $("#venueUpdateButton").text("Update");
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function venueToFields(venue) {
  $("#address").val(venue.address);
  $("#cName").val(venue.contact.name);
  $("#cEmail").val(venue.contact.email);
  $("#cPhone").val(venue.contact.phone);
  $("#seats").val(venue.seats);
  $("#activeBox").prop('checked', (venue.active));
 venueOpenForm()
}

// Handle click event on Update button
function venueUpdateClick() {
       // Build venue object from inputs
      venue = new Object();
      contact = new Object();
      venue._id = $("#storeid").val();
      venue.address = $("#address").val();
      venue.contact = contact;
      venue.contact.name = $("#cName").val();
      venue.contact.email= $("#cEmail").val();
      venue.contact.phone = $("#cPhone").val();
      venue.seats = $("#seats").val();
      venue.active = $('#activeBox').prop('checked');
      console.log('active:', venue.active)

      if ($("#venueUpdateButton").text().trim() == "Add") {
        venueAdd(venue);
      }
      else {
        venueUpdate(venue);
      }
    }


function venueUpdate(venue) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.address = venue.address
  data.contact = venue.contact
  data.seats = venue.seats
  data.active = venue.active
  


  // Call Web API to update venue
  $.ajax({
    "url": `http://127.0.0.1:3001/venues/${venue._id}`,
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (venue) {
    venueUpdateSuccess(venue);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function venueUpdateSuccess(venue) {
  venueUpdateInTable(venue);
}

function venueAdd(venue) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.address = venue.address
  data.contact = venue.contact
  data.seats = venue.seats
  data.seats = venue.seats


  // Call Web API to add a new venue
  $.ajax({
    "url": `http://127.0.0.1:3001/venues`,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (venue) {
      venueAddSuccess(venue);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function venueAddSuccess(venue) {
  venueAddRow(venue);
  venueFormClear();
}

// Update venue in <table>
function venueUpdateInTable(venue) {
  // Find Venue in <table>
  var row = $("#venueTable button[data-id='" + venue._id + "']")
            .parents("tr")[0];
  // Add changed venue to table
  $(row).after(venueBuildTableRow(venue));
  // Remove original product
  $(row).remove();

  // Clear form fields
  venueFormClear();

  // Change Update Button Text
  $("#venueUpdateButton").text("Add");
}

// Handle click event on Add button
function addClick() {
  console.log('addClick');
  
}


 // Delete venue from <table>
 function venueDelete(ctl) {
  $(this).blur();
  if (confirm("Are you sure ?")){
    var token = window.localStorage.getItem('token');

    var id = $(ctl).data("id");

    // Call Web API to delete a venue
    $.ajax({
      "url": `http://127.0.0.1:3001/venues/${id}`,
      "method": "DELETE",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        },
      "processData": false,
      "data": ''
      ,
      success: function (venue) {
        $(ctl).parents("tr").remove();
      },
      error: function (request, message, error) {
        handleException(request, message, error);
      }
    });
  }
 }

// Clear form fields
function venueFormClear() {
  $("#address").val("");
  $("#cName").val("");
  $("#cEmail").val("");
  $("#cPhone").val("");
  $("#seats").val("");
  $("#activeBox").prop('checked', true);
  
  venueCloseForm()
}

function venueOpenForm() {
  document.getElementById("venueForm").style.display = "block";
  $("#address").focus()
}

function venueCloseForm() {
  document.getElementById("venueForm").style.display = "none";
}


// GIG_FUNCTIOONS
// Get all Gigs to display
gigsList = () => {

  var token = window.localStorage.getItem('token');

  $.ajax({
    "url": 'http://127.0.0.1:3001/gigs',
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (gigs) {
      console.log(gigs)
      //gigs.sort(sort_by('address', false, function(a){return a.toUpperCase()}));
      gigListSuccess(gigs);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

// Display all Gigs returned from Web API call
gigListSuccess = (gigs) => {
  // Iterate over the collection of data
  $.each(gigs, (index, gig) => {
    // Add a row to the Gigs table
    gigAddRow(gig);
  });
}

// Add Gig row to <table>
gigAddRow = (gig) => {
  // First check if a <tbody> tag exists, add one if not
  if ($("#gigTable tbody").length == 0) {
    $("#gigTable").append("<tbody></tbody>");
  }

  // Append row to <table>
  $("#gigTable tbody").append(
    gigBuildTableRow(gig));
}

// Build a <tr> for a row of table data
function gigBuildTableRow(gig) {
  var ret = "<tr>" +
      "<td>" +
        "<button type='button' " +
          "onclick='gigGet(this);' " +
          "class='btn btn-default' " +
          "data-id='" + gig._id + "/" + gig.venue.address + "'>" +
          "<span class='glyphicon glyphicon-edit' />"
          + "</button>" +
        "</td >" +
        "<td>" + gig.houseNo + "</td>" +
        "<td>" + gig.title + "</td>" +
        "<td>" + gig.performer.name + "</td>" +
        "<td>" + gig.venue.address + "</td>" +
        "<td>" + (gig.startSeats - gig.soldSeats) + "</td>" +
        "<td>" +
        "<button type='button' " +
        "onclick='gigDelete(this);' " +
        "class='btn btn-default' " +
        "data-id='" + gig._id + "'>" +
        "<span class='glyphicon glyphicon-remove' />" +
        "</button>" +
      "</td>" +
    "</tr>" 

  return ret;
}

function gigGet(ctl) {

  var token = window.localStorage.getItem('token');

  // Get product id from  first part of data- attribute (Split-operator = /)
  var id = $(ctl).data("id").split("/")[0];

  // Get address from  second part of data- attribute (Split-operator = /)
  var workingAddress = $(ctl).data("id").split("/")[1];
  
  // Store product id in hidden field
  $("#storeid").val(id);

  // Call Web API to get a Gig
  $.ajax({
    "url": `http://127.0.0.1:3001/gigs/${id}`,
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (gig) {
      gigToFields(gig);

      // Change Update Button Text
      $("#gigUpdateButton").text("Update");
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });

  function gigToFields(gig) {
    $("#houseNo").val(gig.houseNo);
    $("#title").val(gig.title);
    $("#gName").val(gig.performer.name);
    $("#gEmail").val(gig.performer.email);
    $("#gPhone").val(gig.performer.phone);
    $("#sSeats").val(gig.startSeats);
    gigOpenForm()
  }

  // Call Web API to get a List of active Venues
  $.ajax({
    "url": `http://127.0.0.1:3001/venues`,
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    success: function (venuesActive) {
      venuesActive.sort(sort_by('address', false, function(a){return a.toUpperCase()}));
      var addresses = []
      var venueIds = []
      venuesActive.forEach(function (venue) {
        if(venue.active){        
          addresses.push(venue.address)
          venueIds.push(venue._id)
        }
      })
      arrayToSelect(addresses, venueIds, 'gAddress', workingAddress);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function arrayToSelect(array, values, selectId, match) {
  var hasFound = false
  $.each(array, function(index, text) {
    if (text == match){
      $("#" + selectId).append( $('<option selected="selected"></option>').val(values[index]).html(text) )
      hasFound = 'true'
    } else {
      $("#" + selectId).append( $('<option></option>').val(values[index]).html(text) )
    }
  });
  if (hasFound == false) {
    $("#" + selectId).append( $('<option selected="selected"></option>').html(match + ' -- NOT ACTIVE!') )
  }
  console.log(hasFound)
}



// Handle click event on Update button
function gigUpdateClick() {
       // Build gig object from inputs
      gig = new Object();
      performer = new Object();
      // venue = new Object();
      gig._id = $("#storeid").val().split("/")[0];;
      gig.houseNo = $("#houseNo").val();
      gig.title = $("#title").val();
      gig.performer = performer;
      gig.performer.name = $("#gName").val();
      gig.performer.email= $("#gEmail").val();
      gig.performer.phone = $("#gPhone").val();
      gig.venue = $("#gAddress").val()
      console.log($("#gAddress").val())
      // gig.venue.address = $("#gAddress option:selected").text()
      // console.log($("#gAddress option:selected").text())
      gig.startSeats = $("#sSeats").val();
      

      if ($("#gigUpdateButton").text().trim() == "Add") {
        gigAdd(gig);
      }
      else {
        gigUpdate(gig);
      }
    }


function gigUpdate(gig) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.houseNo = gig.houseNo
  data.title = gig.title
  data.performer = gig.performer
  data.venue = gig.venue
  data.startSeats = gig.startSeats

  // Call Web API to update gig
  $.ajax({
    "url": `http://127.0.0.1:3001/gigs/${gig._id}`,
    "method": "PATCH",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (gig) {
    console.log(gig)
    gigUpdateSuccess(gig);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function gigUpdateSuccess(gig) {

  console.log('STREET', $("#gAddress option:selected").text())
  venue = new Object
  venue.address = $("#gAddress option:selected").text() 
  delete gig.venue
  gig.venue = venue
  console.log('GIG: ',gig)
  gigUpdateInTable(gig);
}

function gigAdd(gig) {

  var token = window.localStorage.getItem('token');

  data = new Object();
  data.houseNo = gig.house
  data.title = gig.title
  data.performer = gig.peformer
  data.venue = gig.venue
  data.startSeats = gig.startSeats

  // Call Web API to add a new gig
  $.ajax({
    "url": `http://127.0.0.1:3001/gigs`,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      },
    "processData": false,
    "data": `${JSON.stringify(data)}`
    ,
    success: function (gig) {
      gigAddSuccess(gig);
    },
    error: function (request, message, error) {
      handleException(request, message, error);
    }
  });
}

function gigAddSuccess(gig) {
  gigAddRow(gig);
  gigFormClear();
}

// Update gig in <table>
function gigUpdateInTable(gig) {
  // Find Gig in <table>
  var row = $("#gigTable button[data-id='" + gig._id + "']")
            .parents("tr")[0];
  // Add changed gig to table
  $(row).after(gigBuildTableRow(gig));
  // Remove original gig
  $(row).remove();

  // Clear form fields
  gigFormClear();

  // Change Update Button Text
  $("#gigUpdateButton").text("Add");
}

// Handle click event on Add button
function addClick() {
  console.log('addClick');
  
}


 // Delete gig from <table>
 function gigDelete(ctl) {
  $(this).blur();
  if (confirm("Are you sure ?")){
    var token = window.localStorage.getItem('token');

    var id = $(ctl).data("id");

    // Call Web API to delete a gig
    $.ajax({
      "url": `http://127.0.0.1:3001/gigs/${id}`,
      "method": "DELETE",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        },
      "processData": false,
      "data": ''
      ,
      success: function (gig) {
        $(ctl).parents("tr").remove();
      },
      error: function (request, message, error) {
        handleException(request, message, error);
      }
    });
  }
 }

// Clear form fields
function gigFormClear() {
  $("#houseNo").val("");
  $("#title").val("");
  $("#gName").val("");
  $("#gEmail").val("");
  $("#gPhone").val("");
  $("#gAddress").empty();
  $("#sSeats").val("");
  gigCloseForm()
}

function gigOpenForm() {
  document.getElementById("gigForm").style.display = "block";
  $("#title").focus()
}

function gigCloseForm() {
  document.getElementById("gigForm").style.display = "none";
}

// alphabetical sort function
var sort_by = function(field, reverse, primer){

  var key = primer ? 
      function(x) {return primer(x[field])} : 
      function(x) {return x[field]};

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    } 
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