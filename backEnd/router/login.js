/**
 * 文档介绍:用户登陆以及一些不需要登陆的文档
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
const express = require(`express`);
const router = express.Router()
const Login = require('../controller/login')
const BackController = require("../controller/key/backController");

// 路由拦截 将请求数据封装
router.use((req, res, next) => {
    if (req.method.toLowerCase() == 'get') {
        req.data = req.query
    } else if (req.method.toLowerCase() == 'post') {
        req.data = req.body
    } else {
        res.json(BackController.dataEncapsulation(-1, null, "暂时不支持该请求哦~", 0))
    }
    next()
})

// 目前login接口压缩后仅存在以下功能,其余功能均放入其它接口

// 用户登陆功能
router.all('/login', (req, res, next) => { Login.login(req, res, next) })

// 注册账户功能
router.all('/registerUser', (req, res, next) => { Login.registerUser(req, res, next) })

// 获取验证码功能
router.all('/getVerificationCode', (req, res, next) => { Login.getVerificationCode(req, res, next) })

module.exports = router;