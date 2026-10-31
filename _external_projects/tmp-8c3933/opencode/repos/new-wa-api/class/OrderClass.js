import {
    Order,
    Product,
    DetailOrder
} from '../models/MySQLModel.js'
import date from 'date-and-time';
import DeviceClass from './DeviceClass.js'
import AuthClass from './../class/AuthClass.js'

const order_class = class OrderClass {
    constructor() {
        this.order_id = null
        this.device_id = null
        this.total_payment = null
        this.order_at = null
        this.payment_status = "UNPAID"
        this.due_at = null
        this.product_id = null
        this.quantity = 1
        this.token = null
    }

    setToken(token) {
        this.token = token
        return this
    }

    setOrderId(order_id) {
        this.order_id = order_id
        return this
    }

    setDeviceId(device_id) {
        this.device_id = device_id
        return this
    }

    setName(name) {
        this.name = name
        return this
    }

    setTelp(telp) {
        this.telp = telp
        return this
    }

    setProductId(product_id) {
        this.product_id = product_id
        return this
    }

    setOrderAt() {
        const order_at = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        const due_at = date.addDays(new Date(), 3);
        this.order_at = order_at
        this.due_at = date.format(due_at, 'YYYY-MM-DD HH:mm:ss');
    }

    generateUniqueCode() {
        var unique_code = Math.floor(Math.random() * 101)+100
        return unique_code
    }

    async getProduct() {
        var product = await Product.findOne({
            where: {
                product_id: this.product_id
            },
            attributes: ['product_id','name','price','detail_features']
        })

        if (product !== null) {
            product.detail_features = JSON.parse(product.detail_features)   
        }

        return product
    }

    async showProduct() {
        var product = await Product.findAll({
            attributes: ['product_id','name','price','detail_features']
        })

        for (let i = 0; i < product.length; i++) {
            product[i].detail_features = JSON.parse(product[i].detail_features)
        }

        return product
    }

    async showOrder() {
        const verify_token = 
            await new AuthClass()
            .verifyToken(this.token)

        var orders = await Order.findAll({
            where: {
                user_id: verify_token.id
            },
            attributes: ['order_id','device_id','total_payment','subtotal','unique_code','payment_status','order_at','due_at']
        })

        return orders
    }

    async getOrder() {
        var order = await Order.findOne({
            where: {
                order_id: this.order_id
            },
            attributes: [
                'order_id','device_id','total_payment','payment_status','due_at', ['unique_code', 'fee']
            ]
        })

        return order
    }

    async storeOrder() {
        this.setOrderAt()

        const verify_token = 
            await new AuthClass()
            .verifyToken(this.token)

        const unique_code = this.generateUniqueCode()
        const get_product = await this.getProduct()
        const subtotal = get_product.price*this.quantity
        const total_payment = subtotal+unique_code

        this.setOrderId("TRX"+unique_code)
        
        const store_order = await Order.create({
            order_id: this.order_id,
            device_id: this.device_id,
            total_payment: total_payment,
            subtotal: subtotal,
            unique_code: unique_code,
            payment_status: this.payment_status,
            order_at: this.order_at,
            due_at: this.due_at,
            user_id: verify_token.id
        })

        await this.storeDetailOrder()

        return store_order
    }

    async storeDetailOrder() {
        const get_product = await this.getProduct()

        await DetailOrder.create({
            order_id: this.order_id,
            product_id: this.product_id,
            price: get_product.price,
            quantity: this.quantity
        })
    }

    async acceptOrder() {
        var update = {
            payment_status: "PAID"
        }
        
        await Order.update(update, {
            where: {
                order_id: this.order_id
            }
        });

        const get_order = await this.getOrder()
        let activate_device = 
            await new DeviceClass()
            .setDeviceId(get_order.device_id)
            .activateDevice()

        return 1
    }

    async rollbackAcceptOrder() {
        var update = {
            payment_status: "UNPAID"
        }
        
        await Order.update(update, {
            where: {
                order_id: this.order_id
            }
        });

        const get_order = await this.getOrder()
        let non_activate_device = 
            await new DeviceClass()
            .setDeviceId(get_order.device_id)
            .nonActivateDevice()

        return 1
    }

    async isPaidOrder() {
        const get_order = await this.getOrder()
        if (!get_order) {
            return false
        }

        if (get_order.payment_status === "PAID") {
            return true
        }
        
        return false
    }

    async isExistOrder() {
        const get_order = await this.getOrder()
        if (!get_order) {
            return false
        }

        return true
    }

    async isRunningOrder() {
        var order = await Order.findOne({
            where: {
                device_id: this.device_id,
                payment_status: "UNPAID"
            }
        })

        if (!order) {
            return false
        }

        return true
    }

    async cancelOrder() {
        var update = {
            payment_status: "CANCELED"
        }
        
        await Order.update(update, {
            where: {
                order_id: this.order_id
            }
        });

        return 1
    }
}

export default order_class