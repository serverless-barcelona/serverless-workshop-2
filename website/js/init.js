$(document).ready(()=>{
    var customEvents = window.customEvents;
    $('#register').click(function(ev){
        ev.preventDefault(); 
        customEvents.emit('register',{
            email:$('#emailInputRegister').val(),
            password:$('#passwordInputRegister').val()
        })
    });

    $('#confirm').click(function(ev){
        ev.preventDefault(); 
        customEvents.emit('confirm_user',{
            cognitoUser,
            code:$('#code').val()
        })
    });

    $('#signin').click(function(ev){
        ev.preventDefault(); 
        customEvents.emit('login',{
            Username: $('#emailInputSignin').val(),
            Password:$('#passwordInputSignin').val()
        });
    });

    $('#openapi').click(function(ev){
        ev.preventDefault(); 
        req('openapi');
    });
    
    $('#privateapi').click(function(ev){
        ev.preventDefault(); 
        req('api');
    });
    
});