'use strict';
const AWS = require('aws-sdk');
var firehose = new AWS.Firehose();

module.exports.push = async event => {
    try {
        event.body = JSON.parse(event.body);
    } catch (e) { }
    var params = {
        DeliveryStreamName: process.env.DELIVERY_STREAM, /* required */
        Record: { /* required */
            Data: JSON.stringify(event)
        }
    };
    var result = await firehose.putRecord(params).promise();
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                message: JSON.stringify(result),
            },
            null,
            2
        ),
    };
};
