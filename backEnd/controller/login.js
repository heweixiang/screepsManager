/**
 * 文档介绍:用户登陆以及一些不需要登陆的文档
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
// 导入基础响应包
const BackController = require("./key/backController")

// 导入验证码模块
const SvgCaptcha = require("svg-captcha")

// 导入MD5加密模块
const MD5 = require("md5-node")

// 导入token模块
const Token = require("./key/token")

// 导入用户mode层
const User = require("../mode/user")

// 随机生成字符串
const Random = require("string-random")

// 导入redis模块
const RedisIO = require("../mode/redis")

// 导入数据验证模块
const dataVerification = require("./dataVerification/dataVerification")

module.exports = {

    // 用户登陆功能    接口已完成,待测试
    login: (req, res, next) => {
        let token = new Token()
        let Key = token.verifyToken(req.data.codeToken)
        let codeValue = MD5(req.data.code.toLocaleLowerCase())
        let resultData
        RedisIO.getKey(Key, 0).then(result => {
            // 验证验证码
            if (result === codeValue) {
                // 验证码通过,下一层

                if (dataVerification.verificationUser(req.data)) {
                    // 获取盐
                    return User.getUserItem(0, req.data.username)
                } else {
                    // throw ([0, null, "用户名不合法!"])
                    throw ([0, null, "用户名不合法!"])
                }
            } else {
                throw ([0, null, "验证码错误"])
            }
        }).then(result => {
            // salt获取成功
            // 打包用户输入密码
            let password = MD5(req.data.password + result[0].salt)
                // 判断用户是否可以登陆
            return User.login(req.data.username, password)
        }).then(result => {
            // 用户登陆回调
            if (result.length > 0) {
                if (result[0].jurisdiction < 5 && result[0].jurisdiction >= 0) {
                    // 清除并创建token
                    RedisIO.clearKey(token.verifyToken(result[0].token))
                    let Keys = MD5(Random(16)) //创建KEY
                    let tokens = new Token(Keys, 60 * 24 * 90) // 90天过期
                    tokens = tokens.generateToken() // 获取token
                    resultData = result[0] //存储给下面用
                    resultData.token = tokens

                    // 两个月过期
                    return RedisIO.setKey(Keys, JSON.stringify(result[0]), 24 * 60)
                } else {
                    throw ([-1, null, "该用户被冻结!"])
                }
            } else {
                throw ([0, null, "用户名不存在或密码错误!"])
            }
        }).then(result => {
            // 向数据库更新TOKEN
            return User.updateUserToken(resultData.id, resultData.token)
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, resultData, msg = "登陆成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))


    },

    // 注册账户功能
    registerUser: (req, res, next) => {
        let token = new Token()
        console.log(req.data);
        let Key = token.verifyToken(req.data.codeToken)
        console.log(Key);
        let codeValue = MD5(req.data.code.toLocaleLowerCase())
        RedisIO.getKey(Key, 0).then(result => {
            // 验证验证码
            console.log(result, codeValue);
            if (result === codeValue) {
                // 验证码通过
                // 验证用户数据
                if (dataVerification.verificationUser(req.data)) {
                    // 验证用户名的唯一性
                    return User.onlyUser(req.data.username)
                } else {
                    throw ([0, null, "用户名不合法!"])
                }
            } else {
                throw ([0, null, "验证码错误"])
            }
        }).then(result => {
            // 验证用户名的唯一性
            if (result.length === 0) {
                // 打包密码开放注册
                let salt = MD5(Random(16))
                req.data.password = MD5(req.data.password + salt)
                req.data.salt = salt
                req.data.departmentid = 0 //0部门不存在,用户不存在部门归属
                req.data.jurisdiction = 1 //注册用户均为普通user权限
                return User.addUser(req.data)
            } else {
                throw ([0, null, "用户名已存在!"])
            }
        }).then(result => {
            // 注册成功
            res.json(BackController.dataEncapsulation(1, result, "账户注册成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 获取验证码功能
    getVerificationCode: (req, res, next) => {
        //创建验证码
        let svg = SvgCaptcha.create()
        let Key = MD5(Random(16))
        let Value = MD5(svg.text.toLocaleLowerCase())

        RedisIO.setKey(Key, Value, 5).then(result => {
            // KEY封装成TOKEN发送给前台
            let data = {}
            let token = new Token(Key, 10)
            data.Key = token.generateToken()
            data.svg = svg.data
            res.json(BackController.dataEncapsulation(1, data, "验证码获取成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },
}