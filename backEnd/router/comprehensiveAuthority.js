/**
 * 文档介绍:综合权限[用户,员工,主管,admin]
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
const express = require(`express`);
const router = express.Router()
const comprehensiveAuthority = require('../controller/comprehensiveAuthority')
const BackController = require("../controller/key/backController");
const Jwt = require('../controller/key/token');

// 路由拦截 将请求数据封装
router.use((req, res, next) => {
    if (req.method.toLowerCase() == 'get') {
        req.data = req.query
    } else if (req.method.toLowerCase() == 'post') {
        req.data = req.body
        req.data.token = req.query.token
    } else {
        res.json(BackController.dataEncapsulation(-1, null, "暂时不支持该请求哦~", 0))
    }
    // TOKEN认证, 先验证JWT 然后从redis获取用户数据
    let jwt = new Jwt(req.data.token)

    jwt.verifyTokenLogin(req.data.token).then(result => {
        // 判断不是超时和权限不足
        // 0 admin   1 user    2 manager   3 employee
        // 此处放行登陆用户,均属于综合权限
        if (result.jurisdiction >= 0 && result.jurisdiction <= 3) {
            req.data.token = result
            next()
        } else {
            res.json(result = BackController.dataEncapsulation(-1, null, msg = "请登陆后操作!", 0))
        }
    }).catch(err => {
        res.json(result = BackController.dataEncapsulation(-2, null, err, 0))
    })
})

// 综合权限接口,注意权限管控

// 用户以及部门方面
// 密码修改
router.all('/modificationPassword', (req, res, next) => { comprehensiveAuthority.modificationPassword(req, res, next) })

// 获取用户卡片
router.all('/getEmployeeCard', (req, res, next) => { comprehensiveAuthority.getEmployeeCard(req, res, next) })

// 查询部门列表
router.all('/getDepartmentList', (req, res, next) => { comprehensiveAuthority.getDepartmentList(req, res, next) })

// 获取用户基本数据  
router.all('/getUserBaseData', (req, res, next) => { comprehensiveAuthority.getUserBaseData(req, res, next) })

// 修改用户基础数据
router.all('/setUserBaseData', (req, res, next) => { comprehensiveAuthority.setUserBaseData(req, res, next) })

// 工单部分
// 查看工单列表
router.all('/getWorkOrderList', (req, res, next) => { comprehensiveAuthority.getWorkOrderList(req, res, next) })

// 查看工单内容
router.all('/getWorkOrderItem', (req, res, next) => { comprehensiveAuthority.getWorkOrderItem(req, res, next) })

// 评价工单
router.all('/scoreWorkOrderItem', (req, res, next) => { comprehensiveAuthority.scoreWorkOrderItem(req, res, next) })

module.exports = router;