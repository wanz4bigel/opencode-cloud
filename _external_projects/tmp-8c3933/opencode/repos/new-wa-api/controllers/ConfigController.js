import response from './../response.js'
import ConfigClass from './../class/ConfigClass.js'

export const getBankAccount = async(req, res) => {
    try {
        let get_bank_account = 
            await new ConfigClass()
            .getBankAccount()

        return response(res, 200, true, 'Bank account found!', get_bank_account)
    } catch (err) {
        return response(res, 500, false, err.message, {})
    }
}