import response from './../response.js'
import DeviceClass from './../class/DeviceClass.js'

const validate = async(req, res, next) => {
    var api_key = req.headers["angel-key"]
    if (!api_key) {
        return response(res, 401, false, 'Angel key invalid')
    }

    let is_active_device = 
        await new DeviceClass()
        .setApiKey(api_key)
        .isActiveDevice()

    if (!is_active_device) {
        return response(res, 401, false, 'Device not active!')
    }

    let get_device_by_key = 
        await new DeviceClass()
        .setApiKey(api_key)
        .getDeviceByKey()
    console.log(get_device_by_key.device_id)
    res.locals.sessionId = get_device_by_key.device_id

    next()
}

export default validate
