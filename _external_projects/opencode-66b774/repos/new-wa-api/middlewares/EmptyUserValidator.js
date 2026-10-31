import response from './../response.js'
import AuthClass from './../class/AuthClass.js'

const validate = async(req, res, next) => {
    var { name, telp } = req.body
    var telp = 
        new AuthClass()
        .normalizeTelp(telp)

    try {
        let is_exist_user = 
            await new AuthClass()
            .setTelp(telp)
            .isExistUser()

        if (!is_exist_user) {
            return response(res, 422, false, 'Account not registered!')
        }

        next()

    } catch (err) {
        return response(res, 401, false, err.message, {})
    }
}

export default validate
