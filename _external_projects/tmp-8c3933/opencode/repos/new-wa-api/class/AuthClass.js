import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
    User
} from '../models/MySQLModel.js'
import request from 'request';
import axios from 'axios';
import { getSession, isExists, sendMessage, formatPhone } from './../whatsapp.js'

const auth_class = class AuthClass {
    constructor() {
        this.id = null
        this.telp = null
        this.name = null
        this.password = null
        this.otp = null
    }

    setId(id) {
        this.id = id
        return this
    }

    setTelp(telp) {
        this.telp = telp
        return this
    }

    setName(name) {
        this.name = name
        return this
    }

    setPassword(otp) {
        const string_otp = otp.toString()
        this.otp = string_otp
        const saltRounds = 10;
        const hash = bcrypt.hashSync(string_otp, saltRounds);
        this.password = hash
        
        return this
    }

    normalizeTelp(telp) {
        var telp = String(telp).trim();
        var telp = telp.replace(/[- .]/g, '');

        if (telp.startsWith('+62')) {
            telp = '62' + telp.slice(3);
        } else if (telp.startsWith('0')) {
            telp = '62' + telp.slice(1);
        }

        return telp
    }

    isValidFormatTelp(telp) {
        if (!telp || !/^628[1-9][0-9]{7,10}$/.test(telp)) {
            return false;
        }

        return true;
    }

    async storeUser() {
        await User.create({
            name: this.name,
            telp: this.telp,
            password: this.password
        })
    }

    async getUserById() {
        const user = await User.findOne({
            where: {
                id: this.id
            }
        })

        return user
    }

    async getUser() {
        const user = await User.findOne({
            where: {
                telp: this.telp
            }
        })

        return user
    }

    async updateUser(update) {
        const user = await User.update(update, {
            where: {
                telp: this.telp
            }
        })

        return user
    }

    async isExistUser() {
        const user = await this.getUser()
        if (user === null) {
            return false
        }

        return true
    }

    async generateToken() {
        var user = await this.getUser()
        var user = {
            id: user.id,
            name: user.name,
            telp: user.telp
        }
        var token = jsonwebtoken.sign(JSON.stringify(user), 'shhhhh');
        
        var new_user = {
            id: user.id,
            name: user.name,
            telp: user.telp,
            token: token
        }

        return new_user
    }

    async verifyToken(token) {
        const decoded = jsonwebtoken.verify(token, 'shhhhh', function(err, decoded) {
            return decoded
        });
        return decoded
    }

    async verifyPassword() {
        const user = await this.getUser()
        const is_valid = bcrypt.compareSync(this.otp, user.password);

        return is_valid
    }

    async sendOtp() {
        var otp = Math.floor(Math.random() * 1001)+1000;
        // login for testing
        if(this.telp == "6287714509601") {
            var otp = "0000";
        }

        const response = await axios.post('https://portal.angel-ping.my.id/chats/send', {
            "receiver": this.telp,
            "message": {
                "text": "OTP anda "+otp
            }
        },{
            headers: {
                'angel-key': 'ECOM.c9dc7e39c892544e816',
                'Content-Type': 'application/json'
            }
        });

        return otp
    }

    async registerLog() {
        const response = await axios.post('https://log.angel-ping.my.id/register', {
            "name": this.telp,
            "password": this.password
        },{
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data
    }
}

export default auth_class