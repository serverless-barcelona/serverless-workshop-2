var customEvents = new EventEmitter();
var idToken, cognitoUser;

var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

//executes a POST request to the protected api (idToken required)
function req(path) {
    var cognitoUser = userPool.getCurrentUser();

    cognitoUser.getSession((err, session) => {
        var requestObj = {
            method: 'POST',
            url: _config.api.invokeUrl + '/' + path,
            data: JSON.stringify({
                exampleData: { a: 1 }
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
                Authorization: session.getIdToken().getJwtToken(),
            };
        }
        $.ajax(requestObj);
    });

}

function initializeSdk(result) {
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-integrating-user-pools-with-identity-pools.html
    var { region, userPoolClientId, userIdentityPoolId, userPoolId } = window._config.cognito;

    // Config region
    AWS.config.region = window._config.cognito.region;

    // Add the User's Id Token to the Cognito credentials login map.
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: userIdentityPoolId,
        Logins: {
            [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: result.getIdToken().getJwtToken(),
        },
    });

    console.log('SDK Initialized');
}

function sendToFirehose(data) {
    var firehose = new AWS.Firehose();

    firehose.putRecord({
        DeliveryStreamName: _config.cognito.deliveryStreamName,
        Record: {
            Data: JSON.stringify(data),
        }
    }, (err, data) => {
        console.log(err, data);
    });
}

customEvents.on('init_ready', () => {
    var cognitoUser = userPool.getCurrentUser();
    var isUserRegistered = localStorage.getItem('registered');

    if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
            $('#registerSection').hide()
            $('#confirmSection').hide();
            customEvents.emit('login_successful', session);
        });
    } else if (isUserRegistered) {
        $('#registerSection').hide()
        $('#signinSection').show();
    } else {
        $('#registerSection').show();
    }
});

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
});

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
    localStorage.setItem('registered', true);
    $('#confirmSection').hide(400, () => {
        $('#signinSection').show(400);
    });
    console.log(result);
});

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
            customEvents.emit('login_successful', result);
        },

        onFailure: function (err) {
            customEvents.emit('error', { error: err, scope: 'login' });
        },

    });
});

customEvents.on('login_successful', (result) => {
    // idToken = result.getIdToken().getJwtToken();
    $('#signinSection').hide();
    $('#loggedInSection').show();

    initializeSdk(result);
    // alert('User logged in')
});

customEvents.on('sign_out', () => {
    var cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();
    $('#loggedInSection').hide();
    $('#registerSection').show();
});

/* GET CURRENT USER (in browser session)

var cognitoUser = userPool.getCurrentUser();

*/