import response from './../response.js'
import OrderClass from './../class/OrderClass.js'
import DeviceClass from './../class/DeviceClass.js'
import ConfigClass from './../class/ConfigClass.js'

export const showProduct = async(req, res) => {

    try {
        let show_product = 
            await new OrderClass()
            .showProduct()

        return response(res, 200, true, 'List product found!', show_product)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const getProduct = async(req, res) => {
    const { product_id } = req.params

    try {
        let get_product = 
            await new OrderClass()
            .setProductId(product_id)
            .getProduct()

        if (get_product === null) {
            return response(res, 404, true, 'Product not found!', {})
        }

        return response(res, 200, true, 'Product found!', get_product)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const showOrder = async(req, res) => {

    try {
        var authorization = req.headers["authorization"].split(" ")
        const token = authorization[1]

        let show_order = 
            await new OrderClass()
            .setToken(token)
            .showOrder()

        return response(res, 200, true, 'Order list found!', show_order)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const getOrder = async(req, res) => {
    const { order_id } = req.params

    try {
        let get_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .getOrder()

        return response(res, 200, true, 'Order found!', get_order)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const storeOrder = async(req, res) => {
    const { device_id, product_id } = req.body

    try {
        var authorization = req.headers["authorization"].split(" ")
        const token = authorization[1]

        let is_running_order = 
            await new OrderClass()
            .setDeviceId(device_id)
            .isRunningOrder()

        if (is_running_order) {
            return response(res, 422, false, 'Current order with this Device is running!')
        }

        let is_active_device = 
            await new DeviceClass()
            .setDeviceId(device_id)
            .isActiveDevice()

        if (is_active_device) {
            return response(res, 422, false, 'Cannot order! Device already active!')
        }

        let store_order = 
            await new OrderClass()
            .setDeviceId(device_id)
            .setProductId(product_id)
            .setToken(token)
            .storeOrder()

        return response(res, 200, true, 'Order success!', store_order)
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const acceptOrder = async(req, res) => {
    const { order_id } = req.body

    try {
        let is_paid_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .isPaidOrder()

        if (is_paid_order) {
            return response(res, 400, true, 'Order already paid!', {})
        }

        let accept_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .acceptOrder()

        return response(res, 200, true, 'Order accepted!', {})
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const rollbackAcceptOrder = async(req, res) => {
    const { order_id } = req.body

    try {
        let get_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .getOrder()
            
        if (get_order.payment_status != "PAID") {
            return response(res, 400, true, 'Order have not paid!', {})
        }

        let cancel_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .rollbackAcceptOrder()

        return response(res, 200, true, 'Rollback order successfully!', {})
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}

export const cancelOrder = async(req, res) => {
    const { order_id } = req.params

    try {
        let get_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .getOrder()
            
        if (get_order.payment_status == "PAID") {
            return response(res, 422, true, 'Order is paid!', {})
        }

        if (get_order.payment_status == "CANCELED") {
            return response(res, 422, true, 'Order is canceled!', {})
        }

        let cancel_order = 
            await new OrderClass()
            .setOrderId(order_id)
            .cancelOrder()

        return response(res, 200, true, 'Cancel order successfully!', {})
    } catch (err) {
        let notification_error = 
            await new ConfigClass()
            .setErrorMessage(err.message)
            .notificationError()

        return response(res, 500, false, err.message, {})
    }
}