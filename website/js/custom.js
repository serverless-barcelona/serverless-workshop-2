var authToken = authToken || "";

function req(pickupLocation) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/api',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            PickupLocation: {
                Latitude: pickupLocation.latitude,
                Longitude: pickupLocation.longitude
            }
        }),
        contentType: 'application/json',
        success: (e) => console.log(e),
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
        }
     })}

WildRydes.authToken.then((t) => { authToken = t})
