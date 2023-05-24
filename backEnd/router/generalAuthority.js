/**
 * 文档介绍:普通权限[用户,员工]
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
const express = require(`express`);
const router = express.Router()
const generalAuthority = require('../controller/generalAuthority')
const BackController = require("../controller/key/backController");
const Jwt = require('../controller/key/token');

// 路由拦截 将请求数据封装
router.use((req, res, next) => {
    if (req.method.toLowerCase() == 'get') {
        req.data = req.query
    } else if (req.method.toLowerCase() == 'post') {
        req.data = req.body

        // 提取token
        req.data.token = req.query.token
    } else {
        res.json(BackController.dataEncapsulation(-1, null, "暂时不支持该请求哦~", 0))
    }

    // TOKEN认证, 先验证JWT 然后从redis获取用户数据
    let jwt = new Jwt(req.data.token)
    jwt.verifyTokenLogin(req.data.token).then(result => {
        // 判断不是超时和权限不足
        // 0 admin   1 user    2 manager   3 employee
        // 此处放行用户和员工,均属于普通权限
        if (result.jurisdiction == 1 || result.jurisdiction == 3) {
            req.data.token = result
            next()
        } else {
            res.json(result = BackController.dataEncapsulation(-1, null, msg = "权限不足!", 0))
        }
    }).catch(err => {
        res.json(result = BackController.dataEncapsulation(-2, null, err, 0))
    })
})


// 用户部分
// 发布工单
router.all('/createWorkOrderItem', (req, res, next) => { generalAuthority.createWorkOrderItem(req, res, next) })

// 员工部分
// 提交工单
router.all('/subWorkOrderItem', (req, res, next) => { generalAuthority.subWorkOrderItem(req, res, next) })

module.exports = router;