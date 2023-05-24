/**
 * 文档介绍:综合权限[用户,员工,主管,admin]
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.14
 */
// 导入基础响应包
const BackController = require("./key/backController")

// 导入MD5加密模块
const MD5 = require("md5-node")

// 导入用户mode层
const User = require("../mode/user")

// 导入工单mode层
const WorkOrder = require("../mode/workorder")

// 导入redis模块`
const RedisIO = require("../mode/redis")

// 导入数据验证模块
const dataVerification = require("./dataVerification/dataVerification")

// 综合权限接口,注意权限管控
module.exports = {

    // 用户以及部门方面
    // 密码修改
    modificationPassword: (req, res, next) => {
        BackController.nullPromise().then(result => {
            // 验证新密码类型
            if (typeof req.data.newPassword === 'string') {
                // 加密对比老密码
                let password = MD5(req.data.password + req.data.token.salt)
                if (password === req.data.token.password) {
                    let newPassword = MD5(req.data.newPassword + req.data.token.salt)
                        // 更新新密码
                    return User.modificationPassword(req.data.token.id, newPassword)
                } else {
                    throw ([0, null, "旧密码验证不通过!"])
                }
            } else {
                throw ([0, null, "数据验证不通过!"])
            }
        }).then(result => {
            // 清除TOKEN
            return RedisIO.getKey(req.data.token.token, 0)
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "密码修改成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 获取用户卡片
    getEmployeeCard: (req, res, next) => {
        BackController.nullPromise().then(result => {
            if (!isNaN(req.data.id)) {
                // 通过用户ID从数据库读取
                return getUserChard(req.data.id)
            } else {
                throw ([0, null, "用户ID不通过!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "卡片数据获取成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 查询部门列表                                 admin/manager    初步测试通过  21.6.13
    getDepartmentList: (req, res, next) => {
        User.getDepartmentList().then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "部门数据列表获取成功!", result.length))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 获取用户基本数据  
    getUserBaseData: (req, res, next) => {
        //  使用id从userList视图中拿取数据
        User.getUserBaseData(req.data.token.id).then(result => {
            res.json(BackController.dataEncapsulation(1, result[0], msg = "数据获取成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 修改用户基础数据
    setUserBaseData: (req, res, next) => {
        // 修改用户基础数据,用户仅可以修改自己的
        dataVerification.verificationUser(req.data).then(result => {
            // 触发修改
            req.data.did = req.data.token.departmentid;
            req.data.jurisdiction = req.data.token.jurisdiction;
            req.data.id = req.data.token.id;
            return User.modificationUserItem(req.data)
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "基础数据修改成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 工单部分
    // 查看工单列表                                                     admin/manager    初步测试通过 21.6.13
    getWorkOrderList: (req, res, next) => {
        // 权限验证  admin全部  主管>部门  员工>个人  用户>个人
        BackController.nullPromise().then(result => {
            // 验证分页数据和query  计算index
            let limit = parseInt(req.data.limit)
            let index = limit * (req.data.page - 1)
            let data = {
                limit,
                index,
                ad: req.data.token.jurisdiction === 0 ? 1 : 0,
                did: req.data.token.jurisdiction === 2 ? req.data.token.departmentid : 0,
                uid: req.data.token.jurisdiction === 1 ? req.data.token.id : 0,
                eid: req.data.token.jurisdiction === 3 ? req.data.token.id : 0,
                query: typeof(req.data.query) === 'string' ? req.data.query : ''
            }
            return WorkOrder.getWorkOrderList(data)
        }).then(result => {
            console.log(result);
            // console.log(result);
            res.json(BackController.dataEncapsulation(1, result.data, msg = "工单列表数据获取成功!", result.total))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 查看工单内容                                              admin/manager   初步测试通过   21.6.13
    getWorkOrderItem: (req, res, next) => {
        // 验证工单ID
        BackController.nullPromise().then(result => {
            if (!isNaN(req.data.id)) {
                return WorkOrder.getWorkOrderItem(req.data.id)
            } else {
                throw ([0, null, "数据验证不通过!"])
            }
        }).then(result => {
            // 权限判定
            if (req.data.token.jurisdiction === 0 ||
                (req.data.token.jurisdiction === 1 && result[0].uid === req.data.token.id) ||
                (req.data.token.jurisdiction === 2 && result[0].did === req.data.token.departmentid) ||
                (req.data.token.jurisdiction === 3 && result[0].eid === req.data.token.id)) {
                res.json(BackController.dataEncapsulation(1, result[0], msg = "数据获取成功!", 1))
            } else {
                throw ([0, null, "你无权查看此表单!"])
            }
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 评价工单
    scoreWorkOrderItem: (req, res, next) => {
        BackController.nullPromise().then(result => {
            // 验证评价内容和评价等级以及工单ID
            if (typeof(req.data.content) == 'string' && !isNaN(req.data.id)) {
                return WorkOrder.getWorkOrderItem(req.data.id)
            } else {
                throw ([0, null, "数据验证不通过!"])
            }
        }).then(result => {
            if (result[0].wstatus === 3 && req.data.token.jurisdiction === 1 || result[0].wstatus === 4 && req.data.token.jurisdiction === 2) {
                let data = {
                    start: parseFloat(req.data.start),
                    id: req.data.id,
                    content: req.data.content,
                    jurisdiction: req.data.token.jurisdiction
                }
                return WorkOrder.scoreWorkOrderItem(data)
            } else {
                throw ([0, null, "当前工单状态或当前用户权限不可评价!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "评价成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },
}