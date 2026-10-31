import response from './../response.js'
import AuthClass from './../class/AuthClass.js'

const validate = async(req, res, next) => {
    const { telp } = req.body

    try {
        var formatted_telp = 
            new AuthClass()
            .normalizeTelp(telp)

        var is_valid_telp = 
            new AuthClass()
            .isValidFormatTelp(formatted_telp)

        if(!is_valid_telp){
            return response(res, 422, false, 'Warning! format number not valid', {})
        }

        next()

    } catch (err) {
        return response(res, 401, true, err.message, {})
    }
}

export default validate
