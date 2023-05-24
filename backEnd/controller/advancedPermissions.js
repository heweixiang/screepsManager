/**
 * 文档介绍:高级权限[主管,admin]
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

// 随机生成字符串
const Random = require("string-random")

// 导入Excel模块
const xlsx = require("node-xlsx")

// 导入fs文件模块
const fs = require("fs")

// 导入数据验证模块
const dataVerification = require("./dataVerification/dataVerification")

module.exports = {
    //  员工管理
    // 查询员工列表                                           admin          初步测试通过    21.6.13
    getUserList: (req, res, next) => {
        // 验证page,limit以及query(模糊查询)   计算index
        let limit = parseInt(req.data.limit)
        let index = limit * (req.data.page - 1)
        let data = {
            limit,
            index,
            ad: req.data.token.jurisdiction === 0 ? 1 : 0,
            did: req.data.token.departmentid,
            query: typeof(req.data.query) === 'string' ? req.data.query : ''
        }

        // 根据权限返回内容
        User.getUserList(data).then(result => {
            res.json(BackController.dataEncapsulation(1, result.data, msg = "用户列表获取成功!", result.total))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 修改用户资料                                           admin         初步测试通过    21.6.13
    setUserItem: (req, res, next) => {
        // 验证数据
        dataVerification.verificationUser(req.data).then(result => {
            // 此处用户名是新用户名
            return User.getUserItem(req.data.id, '')
        }).then(result => {
            // 用户存在,判断权限 
            if (result[0].jurisdiction > req.data.token.jurisdiction && req.data.token.jurisdiction != 1 || req.data.token.jurisdiction === 0) {
                // 封装内容允许修改   username name department jurisdiction  email phone sex
                // 检测权限和部门是否修改,如果发生修改则需要admin权限
                // 此处不开放修改用户名,1:后台逻辑过于复杂,2:修改用户名后用户可能不知道,将由用户自行修改
                if (result[0].jurisdiction != req.data.jurisdiction || result[0].departmentid != req.data.did) {
                    // 权限和部门有异动,
                    if (req.data.token.jurisdiction === 0) {
                        // 放行修改
                        return User.modificationUserItem(req.data)
                    } else {
                        throw ([-1, null, "用户权限不足!"])
                    }
                } else if (result[0].departmentid === req.data.token.departmentid || req.data.token.jurisdiction === 0) {
                    // 权限和部门未异动,直接放行
                    return User.modificationUserItem(req.data)
                }
            } else {
                throw ([-1, null, "用户权限不足!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "用户数据修改成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 添加用户                                               admin/manager        初步测试通过    21.6.13
    addUserItem: (req, res, next) => {
        // 验证添加数据列表
        dataVerification.verificationUser(req.data).then(result => {
            // 判定添加用户权限是否越权,根据操作人判定
            // 权限为admin 或者主管添加员工权限放行
            if (req.data.token.jurisdiction === 0 || req.data.token.jurisdiction === 2) {
                // 操作添加
                // 生成salt和生成password
                // console.log(req.data);

                if (req.data.token.jurisdiction === 2) {
                    req.data.did = req.data.token.departmentid;
                    req.data.jurisdiction = 3
                    req.data.sex = req.data.sex
                }
                req.data.salt = MD5(Random(16))
                req.data.password = MD5('A123456!' + req.data.salt)
                    // console.log(req.data);
                return User.addUser(req.data)
            } else {
                throw ([-1, null, "用户权限不足!"])
            }
        }).then(result => {
            // console.log(result);
            res.json(BackController.dataEncapsulation(1, result, msg = "用户添加成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 删除用户                                               admin/manager        初步测试通过    21.6.13
    delUserItem: (req, res, next) => {
        // 验证id和username
        dataVerification.verificationUser(req.data).then(result => {
            // 获取用户,
            return User.getUserItem(req.data.id)
        }).then(result => {
            // 判定操作人权限
            if (result[0].jurisdiction === 3 && req.data.token.jurisdiction === 2 || result[0].jurisdiction === 1 || req.data.token.jurisdiction === 0) {
                return User.delUserItem(req.data.id)
            } else {
                throw ([-1, null, "用户权限不足!"])
            }
        }).then(result => {
            // 操作删除
            res.json(BackController.dataEncapsulation(1, result, msg = "用户删除成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 冻结用户                                                  admin        初步测试通过    21.6.13
    freezeUser: (req, res, next) => {
        // 验证id和username
        dataVerification.verificationUser(req.data).then(result => {
            // 获取用户,判定操作人权限和是否冻结(状态)
            return User.getUserItem(req.data.id, req.data.username)
                // 操作冻结(将当前权限乘以2)
        }).then(result => {
            if (result[0].jurisdiction < 5) {
                // 可以冻结,权限判定
                if (req.data.token.jurisdiction === 0 || result[0].jurisdiction > req.data.token.jurisdiction && req.data.token.departmentid === result[0].departmentid) {
                    // 操作冻结,将权限乘以10
                    result[0].jurisdiction = result[0].jurisdiction * 10
                        // 直接使用用户修改接口
                    return User.modificationUserItem(result[0])
                } else {
                    throw ([-1, null, "用户权限不足!"])
                }
            } else {
                throw ([0, null, "不可二次冻结!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "用户冻结成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 解除冻结                                                 admin        初步测试通过    21.6.13
    relieveFreeze: (req, res, next) => {
        // 验证id和username   冻结和解除冻结可以乘以2 拿不到合理权限即可默认为冻结
        dataVerification.verificationUser(req.data).then(result => {
            // 获取用户,判定操作人权限和是否冻结(状态)
            return User.getUserItem(req.data.id)
                // 操作冻结(将当前权限乘以2)
        }).then(result => {
            // 将权限恢复方便比对
            result[0].jurisdiction = result[0].jurisdiction / 10
            if (result[0].jurisdiction < 5) {
                // 可以冻结,权限判定
                if (result[0].jurisdiction > req.data.token.jurisdiction && req.data.token.departmentid === result[0].departmentid || req.data.token.jurisdiction === 0) {
                    // 直接使用用户修改接口
                    return User.modificationUserItem(result[0])
                } else {
                    throw ([-1, null, "用户权限不足!"])
                }
            } else {
                throw ([0, null, "不可二次冻结!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "用户冻结成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 重置密码                                               admin        初步测试通过    21.6.13
    REUserPassword: (req, res, next) => {
        // 验证id和username
        dataVerification.verificationUser(req.data).then(result => {
            // 获取用户
            return User.getUserItem(req.data.id, req.data.username)
        }).then(result => {
            if (result[0].jurisdiction > req.data.token.jurisdiction && req.data.token.departmentid === result[0].departmentid || req.data.token.jurisdiction === 0) {
                // 直接使用用户修改接口
                // 封装初始密码
                result[0].password = MD5('A123456!' + result[0].salt)
                return User.modificationUserItem(result[0])
            } else {
                throw ([-1, null, "用户权限不足!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "用户密码重置成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 工单管理
    // 审核分配工单
    checkWorkOrderItem: (req, res, next) => {
        dataVerification.verificationCheckWork(req.data).then(result => {
            // 工单数据审核通过
            // 获取用户数据并开始判断权限
            if (req.data.token.jurisdiction === 2) {
                return User.getUserItem(req.data.eid)
            } else {
                throw ([-1, null, "你权分配工单!"])
            }
        }).then(result => {
            // 获取到员工数据,判断权限为员工,部门相同则查询工单
            if (result[0].jurisdiction === 3 && result[0].departmentid === req.data.token.departmentid) {
                return WorkOrder.getWorkOrderItem(req.data.id)
            } else {
                throw ([-1, null, "你无权分配此给此员工,或此人不是员工!"])
            }
        }).then(result => {
            // 判断工单状态为   1   可分配,则触发分配
            if (result[0].wstatus === 1) {
                return WorkOrder.checkWorkOrderItem(req.data)
            } else {
                throw ([-1, null, "该工单状态不支持分配员工!"])
            }
        }).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "工单成功分配给员工!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 图表
    // 基础图表数据                                               admin         初步测试通过 21.6.13
    getChartData: (req, res, next) => {
        // 根据权限反馈图表数据
        let isAd = req.data.token.jurisdiction === 0
        let did = req.data.token.departmentid
        WorkOrder.getCharData(isAd, did).then(result => {
            res.json(BackController.dataEncapsulation(1, result, msg = "获取图表成功!", result.length))
        }).catch(err => res.json(BackController.Err(err)))

    },

    // 获取Excel                                               admin         初步测试通过 21.6.13
    getExcel: (req, res, next) => {
        // 根据权限封装表格数据
        let isAd = req.data.token.jurisdiction === 0
        let did = req.data.token.departmentid
        WorkOrder.getExcel(isAd, did).then(result => {
            let data = [];
            // 表头数组
            let header = [
                'ID', '用户名', '部门名', "员工名", '创建时间', '标题', '内容', '备注',
                '主管签核意见', '主管签核时间', "员工签核意见", "员工签核时间", "用户评分",
                "用户评论内容", "用户评论时间", "主管评分", "主管评论内容", "主管评论时间", "总评分"
            ]
            data.push(header);

            for (const item of result) {
                // 列值
                data.push([item.id, item.uname, item.dname, item.ename, item.ctime, item.intro, item.content, item.remarks,
                    item.midea, item.mideatime, item.uidea, item.uideatime, item.ustart,
                    item.ucontent, item.ustarttime, item.mstart, item.mstartcontent, item.mstarttime, item.averagestart
                ])
            }


            // 设置表格使用时间
            var myDate = new Date();
            var myYear = myDate.getYear();
            var myMonth = myDate.getMonth();
            var myHour = myDate.getHours();
            var myMinute = myDate.getMinutes();
            var mySecond = myDate.getSeconds();
            var sheetName = myYear + myMonth + myHour + myMinute + mySecond;

            // 设置表格名称
            // let sheetName = `data`
            // 建立表格
            let Excel = xlsx.build([{
                name: `${sheetName}`,
                data: data
            }])

            // 将表格存入本地
            fs.writeFileSync(`${sheetName}.xlsx`, Excel, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('y');
                }
            });

            // 响应下载
            res.download(`${sheetName}.xlsx`)
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 部门管理   admin权限
    // 新增部门                                               admin         初步测试通过 21.6.13
    addDepartment: (req, res, next) => {
        BackController.nullPromise().then(result => {
            if (req.data.token.jurisdiction === 0) {
                // 判定name合法
                if (typeof req.data.name === 'string') {
                    return User.addDepartmentItem(req.data.name)
                } else {
                    throw ([-1, null, "数据验证失败!"])
                }
            } else {
                throw ([-1, null, "权限不足!"])
            }
        }).then(result => {
            // 新增成功
            res.json(BackController.dataEncapsulation(1, result, msg = "部门新增成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    // 修改部门                                               admin         初步测试通过 21.6.13
    modifyDepartment: (req, res, next) => {
        BackController.nullPromise().then(result => {
            if (req.data.token.jurisdiction === 0) {
                if (!isNaN(req.data.id) && typeof req.data.name === 'string') {
                    return User.modifyDepartmentItem(req.data.id, req.data.name)
                } else {
                    throw ([-1, null, "数据验证失败!"])
                }
            } else {
                throw ([-1, null, "权限不足!"])
            }
        }).then(result => {
            // 修改成功
            res.json(BackController.dataEncapsulation(1, result, msg = "部门修改成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },

    //删除部门   删除部门时需要确认部门内没有归属 暂不测试
    delDepartment: (req, res, next) => {
        BackController.nullPromise().then(result => {
            if (req.data.jurisdiction === 0) {
                if (!isNaN(req.data.id)) {
                    return User.delDepartmentItem(req.data.id)
                } else {
                    throw ([-1, null, "数据验证失败!"])
                }
            } else {
                throw ([-1, null, "权限不足!"])
            }
        }).then(result => {
            // 删除成功
            res.json(BackController.dataEncapsulation(1, result, msg = "部门删除成功!", 1))
        }).catch(err => res.json(BackController.Err(err)))
    },
}