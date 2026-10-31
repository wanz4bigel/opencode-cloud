import response from './../response.js'
import DeviceClass from './../class/DeviceClass.js'
import ChatClass from './../class/ChatClass.js'
import AuthClass from './../class/AuthClass.js'
import ConfigClass from './../class/ConfigClass.js'

export const showDevice = async(req, res) => {
    try {
        var authorization = req.headers["authorization"].split(" ")
        const token = authorization[1]
        
        let show_device = 
            await new DeviceClass()
            .setToken(token)
            .showDevice()

        return response(res, 200, true, 'Devices found!', show_device)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const getDevice = async(req, res) => {
    const { device_id } = req.params
    
    try {
        let get_device = 
            await new DeviceClass()
            .setDeviceId(device_id)
            .getDevice()

        return response(res, 200, true, 'Device found!', get_device)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()
            
        return response(res, 500, false, err.message, {})
    }
}

export const storeDevice = async(req, res) => {
    var { name, telp } = req.body
    var telp = 
        new AuthClass()
        .normalizeTelp(telp)

    var authorization = req.headers["authorization"].split(" ")
    const token = authorization[1]
    
    try {
        let is_exist_device = 
            await new DeviceClass()
            .setTelp(telp)
            .isExistDevice()

        if (is_exist_device) {
            return response(res, 422, false, 'Telp already used!')    
        }
        
        let is_valid_whatsapp_number = 
            await new DeviceClass()
            .setTelp(telp)
            .isValidWhatsappNumber()

        if (!is_valid_whatsapp_number) {
            return response(res, 422, false, 'This whatsapp number is not valid!')
        }

        let store_device = 
            await new DeviceClass()
            .setName(name)
            .setTelp(telp)
            .setToken(token)
            .storeDevice()

        return response(res, 200, true, 'Device created successfully!', store_device)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()
            
        return response(res, 500, false, err.message, {})
    }
}

export const updateDevice = async(req, res) => {
    const { webhook, webhook_group } = req.body
    const { device_id } = req.params
    
    try {
        let is_active_device = 
            await new DeviceClass()
            .setDeviceId(device_id)
            .isActiveDevice()

        if (!is_active_device) {
            return response(res, 402, false, 'Device not active!')
        }
        
        var update = {
            webhook: webhook,
            webhook_group: webhook_group
        }
        
        let update_device = 
            await new DeviceClass()
            .setDeviceId(device_id)
            .updateDevice(update)

        return response(res, 200, true, 'Device updated successfully', update_device)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const callWebhook = async(req, res) => {
    const { device_id } = req.params
    const { webhook } = req.body
    
    try {
        var response_webhook = 
            new DeviceClass
            .setDeviceId(device_id)
            .responseWebhook()
        
        var call_webhook = 
            await new ChatClass()
            .setResponse(response_webhook)
            .setWebhook(webhook)
            .callWebhook()

        return response(res, 200, true, 'Webhook called successfully!', response_webhook)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()
            
        return response(res, 500, false, err.message, {})
    }
}