/**
 * 文档介绍:数据验证   此文件部分地方暂时未使用,部分使用
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.16
 */

module.exports = class res {

    /**
     * 初步想法,传入对象,仅对对象判断其合法性,是否为空 如果为空无视,不为空不合法反馈false
     * @param {object} user user对象,user字段
     */
    static verificationUser(user) {
        return new Promise((resolve, reject) => {
            // 暂时关闭验证
            resolve('success')

            // 验证字段: id,username,name,did,jurisdiction,email,phone,sex
            // 如果key存在则验证是否符合规则
            if (user.hasOwnProperty('id')) {
                if (isNaN(user.id)) {
                    reject([0, null, "用户ID未通过验证!"])
                }
            }
            if (user.hasOwnProperty('username')) {
                if (!(/^[A-Za-z0-9-_]{4,15}$/.test(user.username))) {
                    reject([0, null, "用户名未通过验证!"])
                }
            }
            if (user.hasOwnProperty('password')) {
                if (typeof(user.password) == "string") {
                    reject([0, null, "用户密码未通过验证!"])
                }
            }
            if (user.hasOwnProperty('name')) {
                if (!(/\w[\u4e00-\u9fa5]{2,14}/.test(user.name))) {
                    reject([0, null, "用户姓名未通过验证!"])
                }
            }
            if (user.hasOwnProperty('departmentid')) {
                if (isNaN(user.departmentid)) {
                    reject([0, null, "用户部门未通过验证!"])
                }
            }
            if (user.hasOwnProperty('jurisdiction')) {
                if (isNaN(user.jurisdiction)) {
                    reject([0, null, "用户权限字段未通过验证!"])
                }
            }
            if (user.hasOwnProperty('email')) {
                if (!(/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(user.email))) {
                    reject([0, null, "用户邮箱未通过验证!"])
                }
            }
            if (user.hasOwnProperty('phone')) {
                if (!(/^(13|14|15|18|17)[0-9]{9}/.test(user.phone))) {
                    reject([0, null, "用户手机号未通过验证!"])
                }
            }
            if (user.hasOwnProperty('sex')) {
                if (isNaN(user.sex)) {
                    reject([0, null, "用户性别未通过验证!"])
                }
            }
            resolve('success')
        })
    }

    /**
     * 创建工单时数据验证
     * @param {object} work 工单对象
     * @returns 
     */
    static verificationCreateWork(work) {


        return new Promise((resolve, reject) => {
            resolve('success')
            if (work.hasOwnProperty('did')) {
                if (isNaN(work.did)) {
                    reject([0, null, "部门ID未通过验证!"])
                }
            }
            if (work.hasOwnProperty('intro')) {
                if (typeof(work.intro) != 'string') {
                    reject([0, null, "简介未通过验证!"])
                }
            }
            if (work.hasOwnProperty('content')) {
                if (typeof(work.content) != 'string') {
                    reject([0, null, "内容未通过验证!"])
                }
            }
            if (work.hasOwnProperty('remarks')) {
                if (typeof(work.remarks) != 'string') {
                    reject([0, null, "内容未通过验证!"])
                }
            }
            if (work.hasOwnProperty('uidea')) {
                if (typeof(work.uidea) != 'string') {
                    reject([0, null, "内容未通过验证!"])
                }
            }
            if (work.hasOwnProperty('urgent')) {
                if (isNaN(work.urgent)) {
                    reject([0, null, "加急状态未通过验证!"])
                }
            }
            if (work.did === undefined || work.intro === undefined || work.content === undefined || work.urgent === undefined) {
                reject([0, null, "传入数据不完整!"])
            }
            resolve('success')
        })
    }

    /**
     * 分配工单数据验证
     * @param {object} work 工单对象
     */
    static verificationCheckWork(work) {
        return new Promise((resolve, reject) => {
            if (work.hasOwnProperty('id')) {
                if (isNaN(work.id)) {
                    reject([0, null, "表单ID未通过验证!"])
                }
            }
            if (work.hasOwnProperty('did')) {
                if (isNaN(work.did)) {
                    reject([0, null, "部门ID未通过验证!"])
                }
            }
            if (work.hasOwnProperty('eid')) {
                if (isNaN(work.eid)) {
                    reject([0, null, "员工ID未通过验证!"])
                }
            }
            if (work.hasOwnProperty('idea')) {
                if (typeof(work.idea) != 'string') {
                    reject([0, null, "加急状态未通过验证!"])
                }
            }
            if (work.id === undefined || work.eid === undefined || work.idea === undefined) {
                reject([0, null, "传入数据不完整!"])
            }
            resolve('success')
        })
    }

}