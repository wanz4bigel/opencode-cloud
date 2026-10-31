import response from './../response.js'
import AuthClass from './../class/AuthClass.js'
import DeviceClass from './../class/DeviceClass.js'
import ConfigClass from './../class/ConfigClass.js'

export const getUser = async(req, res) => {
    try {
        var authorization = req.headers["authorization"].split(" ")
        const token = authorization[1]

        const verify_token = 
            await new AuthClass()
            .verifyToken(token)

        const get_user = 
            await new AuthClass()
            .setTelp(verify_token.telp)
            .getUser()
        
        return response(res, 200, true, "user found!", get_user)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const register = async(req, res) => {
    var { name, telp } = req.body
    var telp = 
        new AuthClass()
        .normalizeTelp(telp)

    try {
        let is_exist_user = 
            await new AuthClass()
            .setTelp(telp)
            .isExistUser()

        if (is_exist_user) {
            return response(res, 422, false, 'Warning! account registered!', {})
        }

        let is_valid_whatsapp_number = 
            await new DeviceClass()
            .setTelp(telp)
            .isValidWhatsappNumber()
        
        if (!is_valid_whatsapp_number) {
            return response(res, 422, false, 'This whatsapp number is not valid!', {})
        }

        let send_otp = 
            await new AuthClass()
            .setTelp(telp)
            .sendOtp()

        let store_user = 
            await new AuthClass()
            .setPassword(send_otp)
            .setName(name)
            .setTelp(telp)
            .storeUser()

        let register_log = 
            await new AuthClass()
            .setTelp(telp)
            .setPassword(telp)
            .registerLog()

        let update_user = 
            await new AuthClass()
            .setTelp(telp)
            .updateUser({token_log: register_log.token})

        return response(res, 200, true, 'OTP sent successfully via Whatsapp!', {})
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const login = async(req, res) => {
    var { telp } = req.body
    var telp = 
        new AuthClass()
        .normalizeTelp(telp)

    try {
        let send_otp = 
            await new AuthClass()
            .setTelp(telp)
            .sendOtp()

        let password = 
            new AuthClass()
            .setPassword(send_otp)
            .password

        let update_user = 
            await new AuthClass()
            .setTelp(telp)
            .updateUser({password: password})

        return response(res, 200, true, 'Login success! OTP sent successfully via Whatsapp!', {})
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const verifyOtp = async(req, res) => {
    var { telp, otp } = req.body
    var telp = 
        new AuthClass()
        .normalizeTelp(telp)

    try {
        let verify_otp = 
            await new AuthClass()
            .setPassword(otp)
            .setTelp(telp)
            .verifyPassword()

        if (!verify_otp) {
            return response(res, 422, false, "OTP Invalid")
        }

        var generate_token = 
            await new AuthClass()
            .setTelp(telp)
            .generateToken()
        
        let update_user = 
            await new AuthClass()
            .setTelp(telp)
            .updateUser({token: generate_token.token})

        return response(res, 200, true, 'OTP verified!', generate_token)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}