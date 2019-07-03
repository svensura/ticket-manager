$(document).ready(function(){
    $("#but_submit").click(function(){
        var username = $("#txt_uname").val().trim();
        var password = $("#txt_pwd").val().trim();

        if( username != "" && password != "" ){

            $.ajax({
                "url": "http://127.0.0.1:3001/users/login",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                },
                "processData": false,
                "data": `{\n\t\"email\": \"${username}\",\n\t\"password\": \"${password}\"\n}`
                ,
                success: function (response) {
                    if (response.token) {
                        console.log(response.token)
                        window.localStorage.setItem('token', response.token)
                        window.location = "database.html"
                    } else {
                        window.alert("Wrong email or password")
                    }    
                },
                error: function (request, message, error) {
                    handleException(request, message, error);
                  }
            });
        };


            // $.ajax({
            //     url:'http://localhost:3001/users/login',
            //     type:'post',
            //     data:{email:username,password:password},
            //     success:function(response){
            //         console.log(response);
            //         // var msg = "";
            //         // if(response == 1){
            //         //     window.location = "home.php";
            //         // }else{
            //         //     msg = "Invalid username and password!";
            //         // }
            //         // $("#message").html(msg);
            //     }
            // });
        
    });

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
});