import response from './../response.js'
import DeviceClass from './../class/DeviceClass.js'

const validate = async(req, res, next) => {
    try {
        if (req.body.device_id) {
            var device_id = req.body.device_id
        }else if(req.params.device_id) {
            var device_id = req.params.device_id
        }

        var get_device = 
            await new DeviceClass()
            .setDeviceId(device_id)
            .isExistDevice()

        if (!get_device) {
            return response(res, 422, false, 'Device not found!', {})
        }

        next()

    } catch (err) {
        return response(res, 401, false, err.message, {})
    }
}

export default validate
