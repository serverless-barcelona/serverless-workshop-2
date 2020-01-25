var customEvents = new EventEmitter();
var idToken, cognitoUser;

var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var dataEmail = {
    Name: 'email',
    Value: 'simonezennaro@yahoo.it'
};

function req(path) { //executes a POST request to the protected api (idToken required)
    var requestObj = {
        method: 'POST',
        url: _config.api.invokeUrl + '/' + path,
        data: JSON.stringify({
            exampleData: { a : 1 }
        }),
        contentType: 'application/json',
        success: function (e) { alert(JSON.stringify(e)) },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
        }
    };
    if (path == 'api') {
        requestObj.headers = {
            Authorization: idToken
        };
    }
    $.ajax(requestObj);
}

customEvents.on('register', (data) => {
    var attributeList = [];
    const attributeEmail = {
        Name: 'email',
        Value: data.email
    };
    attributeList.push(attributeEmail);
    userPool.signUp(data.email, data.password, attributeList, null, function (err, result) {
        if (err) {
            customEvents.emit('error', { error: err, scope: 'register_error' });
            return;
        }
        cognitoUser = result.user;
        customEvents.emit('register_successful', cognitoUser);
        //console.log('user name is ' + cognitoUser.getUsername());
    });
})

customEvents.on('register_successful', (cognitoUser) => {
    //show confirmation form, add form trigger 
    $('#registerSection').hide(400, () => {
        $('#confirmSection').show(400);
    });
});

customEvents.on('confirm_user', (confirm => {
    confirm.cognitoUser.confirmRegistration(confirm.code, true, function (err, result) {
        if (err) {
            customEvents.emit('error', { error: err, scope: 'confirm_user' });
            return;
        }
        customEvents.emit('confirm_successful', result);
    });
}));

customEvents.on('confirm_successful', (result) => {
    $('#confirmSection').hide(400, () => {
        $('#signinSection').show(400);
    });
    console.log(result);
})

customEvents.on('load_current_user', (userPool) => {
    cognitoUser = userPool.getCurrentUser();
});

customEvents.on('login', (authenticationData) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: authenticationData.Username,
        Pool: userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            idToken = result.idToken.jwtToken;
            customEvents.emit('login_successful', result);
        },

        onFailure: function (err) {
            customEvents.emit('error', { error: err, scope: 'login' });
        },

    });
});

customEvents.on('login_successful', ()=>{
    alert('User logged in')
});
/* GET CURRENT USER (in browser session)

var cognitoUser = userPool.getCurrentUser();

*/