import {
    Config
} from '../models/MySQLModel.js'
import request from 'request';

const config_class = class ConfigClass {
    constructor() {
        this.error_message = null
    }

    setErrorMessage(error_message) {
        this.error_message = error_message
        return this
    }

    async getBankAccount() {
        const bank_account = {
            name:"Rahmat Wahyu", 
            number: "081248891487",
            bank_name: "DANA"
        }

        return bank_account
    }

    async getEventAppend() {
        const event_append = ["#endchat", "endchat"]

        return event_append
    }
    
    async notificationError() {
        return false
        var options = {
            'method': 'POST',
            'url': 'https://hooks.slack.com/services/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',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "text": this.error_message
            })
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
    }

}

export default config_class