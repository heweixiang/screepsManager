// ---------------token 验证工具文件-------------------
// 引入模块依赖
const fs = require('fs');
const path = require('path')
const jwt = require('jwt-simple')
const Redis = require('../../mode/redis')

// 创建 token 类
class Jwt {

    // 传入数据
    constructor(data, time) {
        this.data = data
        this.time = time
    }

    /**
     * 登陆时传入token 利用token作为key从redis拿取用户数据
     * @param {*} token token
     * @returns 
     */
    verifyTokenLogin(token) {
        return new Promise((resolve, reject) => {
            let cert = fs.readFileSync(path.join(__dirname, './Pkey.txt'));
            try {
                // 解析 token 并可以获取到之前使用 this.data 生成token 的数据
                let result = jwt.decode(token, cert) || {};
                // 判定是否超时
                if (Math.floor(Date.now() / 1000) <= result.exp) {
                    // res = result.data || {} 从redis使用该key获取值
                    let Key = result.data


                    Redis.getKey(Key, 2880).then(resultX => {
                        resultX.lastToken = Key
                        resolve(resultX)
                    }).catch(err => {
                        if (err == 'redis更新时间失败!') {
                            reject('redis更新时间失败!')
                        } else {
                            reject('登陆超时!')
                        }
                    })
                } else {
                    reject('登陆超时!')
                }
            } catch (err) {
                reject(`未知错误:${err}`)
            }
        })
    }

    // 生成 token
    generateToken() {
        let data = this.data;
        let created = Math.floor(Date.now() / 1000);
        // 读取私钥
        let cert = fs.readFileSync(path.join(__dirname, './Pkey.txt'));
        let token = jwt.encode({
            data,
            // 过期时间    time填入分钟
            exp: created + this.time * 1000
        }, cert);
        return token;
    }

    // 验证 token
    verifyToken(token) {
        let cert = fs.readFileSync(path.join(__dirname, './Pkey.txt'));
        let res;
        try {
            // 解析 token 并可以获取到之前使用 this.data 生成token 的数据
            let result = jwt.decode(token, cert) || {};
            let {
                exp = 0
            } = result, current = Math.floor(Date.now() / 1000);
            // 判断时间，如果当前时间大于第一次的时间，则为超时
            if (current <= exp) {
                res = result.data || {}
            } else {
                res = '超时!'
            }
        } catch (error) {
            res = `未知错误:${error}`
        }
        return res;
    }
}

module.exports = Jwt;