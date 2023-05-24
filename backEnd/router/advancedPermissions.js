/**
 * 文档介绍:高级权限[主管,admin]
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
const express = require(`express`);
const router = express.Router()
const advancedPermissions = require('../controller/advancedPermissions')
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
        // 此处放行主管和管理员,均属于高级权限
        if (result.jurisdiction == 0 || result.jurisdiction == 2) {
            req.data.token = result
            next()
        } else {
            res.json(result = BackController.dataEncapsulation(-1, null, msg = "权限不足!", 0))
        }
    }).catch(err => {
        res.json(result = BackController.dataEncapsulation(-2, null, err, 0))
    })
})

//  员工管理
// 查询员工列表
router.all('/getUserList', (req, res, next) => { advancedPermissions.getUserList(req, res, next) })

// 修改用户资料
router.all('/setUserItem', (req, res, next) => { advancedPermissions.setUserItem(req, res, next) })

// 添加用户
router.all('/delUserItem', (req, res, next) => { advancedPermissions.delUserItem(req, res, next) })

// 删除用户
router.all('/addUserItem', (req, res, next) => { advancedPermissions.addUserItem(req, res, next) })

// 冻结用户
router.all('/freezeUser', (req, res, next) => { advancedPermissions.freezeUser(req, res, next) })

// 解除冻结   冻结和解除冻结可以乘以2 拿不到合理权限即可默认为冻结
router.all('/relieveFreeze', (req, res, next) => { advancedPermissions.relieveFreeze(req, res, next) })

// 重置密码
router.all('/REUserPassword', (req, res, next) => { advancedPermissions.REUserPassword(req, res, next) })

// 工单管理
// 审核分配工单
router.all('/checkWorkOrderItem', (req, res, next) => { advancedPermissions.checkWorkOrderItem(req, res, next) })

// 图表
// 基础图表数据
router.all('/getChartData', (req, res, next) => { advancedPermissions.getChartData(req, res, next) })

// 获取Excel
router.all('/getExcel', (req, res, next) => { advancedPermissions.getExcel(req, res, next) })

// 部门管理   admin权限
// 新增部门
router.all('/addDepartment', (req, res, next) => { advancedPermissions.addDepartment(req, res, next) })

// 查询部门
router.all('/getDepartmentList', (req, res, next) => { advancedPermissions.getDepartmentList(req, res, next) })

// 修改部门
router.all('/modifyDepartment', (req, res, next) => { advancedPermissions.modifyDepartment(req, res, next) })

//删除部门   删除部门时需要确认部门内没有归属
router.all('/delDepartment', (req, res, next) => { advancedPermissions.delDepartment(req, res, next) })

module.exports = router;