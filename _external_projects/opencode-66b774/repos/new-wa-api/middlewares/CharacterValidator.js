import response from './../response.js'
import AuthClass from './../class/AuthClass.js'

const validate = async(req, res, next) => {
    const { name } = req.body

    try {
        if(name.toLowerCase() == name.toUpperCase()){
            return response(res, 422, false, 'Name must be characters A-Z!')
        }

        if(name.length < 3){
            return response(res, 422, false, 'Name must be at least 3 characters of letter!')
        }

        if(name.length > 13){
            return response(res, 422, false, 'Name must be 13 characters of maximum letter!')
        }

        next()

    } catch (err) {
        return response(res, 401, true, err.message, {})
    }
}

export default validate
