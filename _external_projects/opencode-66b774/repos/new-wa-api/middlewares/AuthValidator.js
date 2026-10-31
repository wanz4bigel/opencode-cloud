import response from './../response.js'
import AuthClass from './../class/AuthClass.js'

const validate = async(req, res, next) => {
    var authorization = req.headers["authorization"]
    if (!authorization) {
        return response(res, 401, false, 'Not authenticated')
    }
    
    var authorization = authorization.split(" ")
    if (authorization.length != 2) {
        return response(res, 401, false, 'Not authenticated')
    }

    const token_type = authorization[0]
    const token = authorization[1]
    
    if (token_type != "Bearer") {
        return response(res, 401, false, 'Not authenticated')
    }

    const verify_token = 
        await new AuthClass()
        .verifyToken(token)

    if (verify_token === undefined) {
        return response(res, 401, false, 'Not authenticated')
    }

    req.verified_token = verify_token
    
    next()
}

export default validate
