'use strict';
const axios = require('axios');

const send = async (text) => {
    const response = await axios({
        method : 'post',
        url: process.env.WEBHOOK,
        data: {
            text: text
        },
        headers: {
            'Content-Type': 'application/json'
        }
      });
    return {
        status: response.status,
        data: response.data
    }
}

module.exports.consume = async event => {
    let success = 0;
    let failure = 0;
    const output = event.records.map(async (record) => {
        /* Data is base64 encoded, so decode here */
        const str = Buffer.from(record.data, 'base64').toString();
        console.log(str);
        const res = await send(str);
        console.log(JSON.stringify(res));
        try {
            /*

             * Note: Write logic here to deliver the record data to the
             * destination of your choice
             */
            success++;
            return {
                recordId: record.recordId,
                result: 'Ok',
            };
        } catch (err) {
            failure++;
            return {
                recordId: record.recordId,
                result: 'DeliveryFailed',
            };
        }
    });
    console.log(`Successful delivered records ${success}, Failed delivered records ${failure}.`);
    return { records: output };

};