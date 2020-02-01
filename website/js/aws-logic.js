/**
 * This function handles the configuration of the AWS library using the credentials retrieved by Cognito
 * @param {CognitoUserSession} result 
 */
function initializeSdk(result) {
  var { region, userPoolClientId, userIdentityPoolId, userPoolId } = window._config.cognito;

  // Config region
  AWS.config.region = window._config.cognito.region;

  // Add the User's Id Token to the Cognito credentials login map.
  // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-integrating-user-pools-with-identity-pools.html
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: userIdentityPoolId,
    Logins: {
      [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: result.getIdToken().getJwtToken(),
    },
  });

  console.log('SDK Initialized');
}

/**
 * This functions send events to Firehose in batches
 * @param {object[]} data Data we want to send to firehose
 */
async function sendToFirehose(data = []) {
  var firehose = new AWS.Firehose();

  if (!data.length) return;

  // TODO Missing handling of errors (result.FailedPutCount > 0)
  return firehose.putRecordBatch({
    DeliveryStreamName: _config.cognito.deliveryStreamName,
    Records: data.map(
      (element) => ({
        Data: `${JSON.stringify(element)}\n`,
      })
    ),
  }).promise();
}
