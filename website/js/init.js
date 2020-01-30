$(document).ready(() => {
    var customEvents = window.customEvents;

    // Set Up Events
    $('#register').click(function (ev) {
        ev.preventDefault();
        customEvents.emit('register', {
            email: $('#emailInputRegister').val(),
            password: $('#passwordInputRegister').val()
        })
    });

    $('#confirm').click(function (ev) {
        ev.preventDefault();
        customEvents.emit('confirm_user', {
            cognitoUser,
            code: $('#code').val()
        })
    });

    $('#signin').click(function (ev) {
        ev.preventDefault();
        customEvents.emit('login', {
            Username: $('#emailInputSignin').val(),
            Password: $('#passwordInputSignin').val()
        });
    });

    $('#signout').click(function (ev) {
        ev.preventDefault();
        customEvents.emit('sign_out');
    });

    $('#openapi').click(function (ev) {
        ev.preventDefault();
        req('openapi');
    });

    $('#privateapi').click(function (ev) {
        ev.preventDefault();
        req('api');
    });

    $('#sendToFirehose').click((ev) => {
        ev.preventDefault();
        sendToFirehose({ a: 'b' });
    });

    document.addEventListener('click', () => {
        console.log('I will listen to all clicks');
    })

    // Trigger Initialization Flow
    customEvents.emit('init_ready');
});