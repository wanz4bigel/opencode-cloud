import response from './../response.js'
import OrderClass from './../class/OrderClass.js'

const validate = async(req, res, next) => {
    try {
        if (req.body.order_id) {
            var order_id = req.body.order_id
        }else if(req.params.order_id) {
            var order_id = req.params.order_id
        }

        var is_exist_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .isExistOrder()

        if (!is_exist_order) {
            return response(res, 422, true, 'Order not found!', {})
        }

        next()

    } catch (err) {
        return response(res, 401, true, err.message, {})
    }
}

export default validate
