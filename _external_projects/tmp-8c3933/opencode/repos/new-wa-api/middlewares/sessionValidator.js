import { isSessionExists } from '../whatsapp.js'
import response from './../response.js'

const validate = (req, res, next) => {
    const sessionId = res.locals.sessionId

    if (!isSessionExists(sessionId)) {
        return response(res, 404, false, 'Session not found.')
    }

    next()
}

export default validate
