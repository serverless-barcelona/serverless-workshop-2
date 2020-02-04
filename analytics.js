'use strict';

module.exports.consume = async event => {
    console.log(JOSN.stringify(event));
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                res: JSON.stringify(JSON.stringify(event)),
            },
            null,
            2
        ),
    };

};