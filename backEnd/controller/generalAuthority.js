/**
 * 文档介绍:普通权限[用户,员工]
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 */
// 导入基础响应包
const BackController = require("./key/backController")

// 导入用户mode层
const User = require("../mode/user")

// 导入工单mode层
const WorkOrder = require("../mode/workorder")

// 导入数据验证模块
const dataVerification = require("./dataVerification/dataVerification")

module.exports = {

    // 用户部分
    // 发布工单
    createWorkOrderItem: (req, res, next) => {
        // 验证数据 先判定即可使用上层的promise
        dataVerification.verificationCreateWork(req.data).then(result => {
            // 权限判定为用户
            if (req.data.token.jurisdiction === 1) {
                // 验证部门是否存在
                return User.onlyDepartment(req.data.did)
            } else {
                throw ([-1, null, "用户权限不足!"])
            }
        }).then(result => {
            // 创建工单
            return WorkOrder.createWorkOrderItem(req.data)
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "工单创建成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))

    },

    // 员工部分
    // 提交工单
    subWorkOrderItem: (req, res, next) => {
        BackController.nullPromise().then(result => {
            // 权限判定为员工
            if (req.data.token.jurisdiction === 3) {
                // 表单ID合法且uidea合法
                if (!isNaN(req.data.id) && typeof(req.data.idea) == "string") {
                    // 获取表单内容,判定该表单归属于该员工
                    return WorkOrder.getWorkOrderItem(req.data.id)
                } else {
                    throw ([0, null, "数据验证不通过!"])
                }
            } else {
                throw ([-1, null, "权限不足!"])
            }
        }).then(result => {
            if (req.data.token.id === result[0].eid) {
                // 权限验证通过放行修改
                return WorkOrder.subWorkOrderItem(req.data)
            } else {
                throw ([-1, null, "用户权限不足,无法修改不属于他的工单!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "工单提交成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },
}