const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const state = JSON.parse(fs.readFileSync('.serverless/serverless-state.json'));
const command = `aws cloudformation describe-stacks --stack-name ${state.service.service}-dev --region ${state.service.provider.region}`; //--profile ${state.service.provider.profile}

async function run(command) {
    const { stdout, stderr } = await exec(command);
    return stdout || stderr;
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

function getOutputValue(OutputArray, OutputKey) {
    var ret = false;
    OutputArray.map(output => {
        if (output.OutputKey == OutputKey) {
            ret = output.OutputValue;
        }
    })
    return ret;
}

(async () => {
    const cloudformation = await run(command);
    console.log(cloudformation);
    const output = JSON.parse(cloudformation).Stacks[0].Outputs;
    console.log(output);
    const configFile = `window._config = {
        cognito: {
            userPoolId: '${getOutputValue(output, 'CognitoUserPoolId')}',
            userPoolClientId: '${getOutputValue(output, 'CognitoUserPoolClientId')}',
            userIdentityPoolId: '${getOutputValue(output, 'CognitoIdentityPoolId')}',
            region: '${state.service.provider.region}',
            deliveryStreamName: '${getOutputValue(output, 'DeliveryStreamName')}'
        },
        api: {
            invokeUrl: '${getOutputValue(output, 'ServiceEndpoint')}'
        }
    };`;
    fs.writeFileSync('./website/js/config.js', configFile);
    const website = getOutputValue(output, 'WebsiteBucket');
    await run(`aws s3 sync ./website s3://${website}`);
    console.log(configFile);
})();
