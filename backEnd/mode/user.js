/**
 * 文档介绍:用户模型层,用于用户类型的数据库操作
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.14
 */

module.exports = class User extends require('./condb') {


    /**
     * @returns 获取部门列表
     * 使用列表:
     *          getDepartmentList:获取部门列表
     */
    static getDepartmentList() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM department;`
            this.query(sql).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "获取部门列表失败MODE!"])
            })
        })
    }

    /**
     * 修改用户基础数据
     * @param {int} id 用户ID
     * @param {object} data 对象数据
     * 使用列表:
     *      setUserBaseData:设置用户基础数据
     */
    static setUserBaseData(id, data) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE \`user\` SET \`name\`=?,email=?,phone=?,sex=? WHERE id=?`
            let params = [data.name, data.email, data.phone, data.sex, id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "用户基础数据修改失败MODE!"])
            })
        })
    }

    /**
     * 获取用户基础数据,不包括敏感数据
     * @param {int} id 用户ID
     * 使用列表:
     *      getUserBaseData:获取用户基础数据 
     */
    static getUserBaseData(id) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM userlist WHERE id=?`
            let params = [id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "用户基础数据获取失败MODE!"])
            })
        })
    }

    /**
     * 获取用户卡片,一般用来联系使用所有人都有该功能
     * @param {int} id 用户ID
     * 使用列表:
     *        getUserChard:获取用户卡片
     */
    static getUserChard(id) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT id AS userid,username,\`name\`,departmentid,(SELECT departmentname FROM department WHERE id = departmentid ) AS dname,
            lastlogintime,email,phone,sex,(SELECT AVG( averagestart ) AS avgstart FROM workorder WHERE eid = userid) AS avgstart from \`user\` WHERE id=?`
            let params = [id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "用户卡片获取失败MODE!"])
            })
        })
    }

    /**
     * 更改密码
     * @param {*} id 用户ID
     * @param {string} password 用户新密码
     * 使用列表:
     *      modificationPassword:修改密码接口
     */
    static modificationPassword(id, password) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE \`user\` SET \`password\`=? WHERE id=?`
            let params = [password, id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "修改密码失败MODE!"])
            })
        })
    }

    /**
     * 修改部门
     * @param {int} id 部门ID 
     * @param {string} name 部门名称
     * 使用列表:
     *      modifyDepartment:新增部门
     */
    static modifyDepartmentItem(id, name) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE department SET departmentname=?  WHERE id=?`
            let params = [name, id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "修改部门失败MODE!"])
            })
        })
    }

    /**
     * 删除部门
     * @param {int} id 部门ID 
     * 使用列表:
     *      addDepartmentItem:新增部门
     */
    static delDepartmentItem(id) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM department WHERE id=?`
            let params = [id]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "删除部门失败MODE!"])
            })
        })
    }

    /**
     * 新增部门
     * @param {string} name 部门名称
     * 使用列表:
     *      addDepartmentItem:新增部门
     */
    static addDepartmentItem(name) {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO department(departmentname) VALUES(?)`
            let params = [name]
            this.query(sql, params).then(result => {
                resolve(result)
            }).catch(err => {
                reject([0, err, "新增部门失败MODE!"])
            })
        })
    }

    /**
     * 根据权限获取用户列表             
     * @param {object} data 获取用户列表必备数据
     * 使用列表:
     *      getUserList:获取用户列表
     */
    static getUserList(data) {
        let query = data.query
        if (query == '' || query == undefined) { query = '"%"' } else { query = `"%${query}%"` }
        return new Promise((resolve, reject) => {
            let sql = `SELECT *,(SELECT count(*) FROM userlist WHERE (username LIKE ${query} OR departmentname LIKE ${query} 
            OR \`name\` LIKE ${query} OR lastlogintime LIKE ${query}) and (departmentid=? or 1=?)) as count
          FROM userlist WHERE (username LIKE ${query} OR departmentname LIKE ${query} OR \`name\` LIKE ${query} 
          OR lastlogintime LIKE ${query}) and (departmentid=? or 1=?) LIMIT ?,?;SELECT FOUND_ROWS() as total;`
            let params = [data.did, data.ad, data.did, data.ad, data.index, data.limit]
            this.query(sql, params).then(res => {
                res = {
                    data: res[0],
                    total: res[1][0].total
                }
                resolve(res)
            }).catch(err => {
                reject([0, err, "获取用户列表失败MODE!"])
            })
        })
    }

    /**
     * 删除用户
     * @param {int} id 用户ID
     * 使用列表:
     *       delUserItem:删除用户接口
     */
    static delUserItem(id) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE  FROM \`user\` WHERE id=?;`
            let params = [id]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "用户删除失败MODE!"])
            })
        })
    }

    /**
     * 修改用户数据
     * @param {object} data 修改用户数据
     * 使用列表:
     *      setUserItem:设置用户接口
     */
    static modificationUserItem(data) {
        data.did = data.departmentid ? data.departmentid : data.did
            // console.log(data);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE \`user\` SET \`name\`=?,departmentid=?,jurisdiction=?,email=?,phone=?,sex=? WHERE id=?;"
            let params = [data.name, data.did, data.jurisdiction, data.email, data.phone, data.sex, data.id]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "用户数据修改失败MODE!"])
            })
        })
    }

    /**
     * 判断部门是否存在,根据部门名称或者部门ID
     * @param {int} did 部门ID
     * @param {string} dName 部门名称
     * 使用列表:
     *      createWorkOrderItem:发布工单接口
     */
    static onlyDepartment(did, dName = '') {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM department where id=? or departmentname='?'`
            let params = [did, dName]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "用户名唯一判断出错MODE!"])
            })
        })
    }

    /**
     * 新增用户
     * @param {object} user 用户对象
     * 使用列表:
     *       registerUser:注册接口
     */
    static addUser(user) {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO \`user\`(\`username\`, \`name\`,\`sex\`,\`password\`, \`departmentid\`, \`jurisdiction\`, \`lastlogintime\`, \`salt\`) 
                        VALUES (?, ?, ?, ?, ?, ?,NOW(), ?);`
            let params = [user.username, user.name, user.sex, user.password, user.did, user.jurisdiction, user.salt]
            this.query(sql, params).then(result => {
                console.log(result);
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        })
    }

    /**
     * 判断用户名是否存在
     * @param {string} username 用户名
     * 使用列表: 
     *      registerUser:注册接口
     */
    static onlyUser(username) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM \`user\` WHERE username=?`
            let params = [username]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "用户名唯一判断出错MODE!"])
            })
        })
    }

    /**
     * 登陆接口
     * @param {*} username 用户名
     * @param {*} password 密码,整合后的
     * 使用列表:
     *      login:登陆接口
     */
    static login(username, password) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * from user where username=? and password=?`
            let params = [username, password]
            this.query(sql, params).then(result => {

                if (result.length > 0) {
                    resolve(result)
                } else {
                    reject([0, null, "用户名或密码错误!"])
                }
            }).catch(err => {
                reject([0, err, "登陆异常MODE!"])
            })
        })
    }

    /**
     * 根据用户id获取用户,兼容用户名查询
     * @param {int} id 用户ID
     * @param {string} username 用户名,为login提供查询
     * 使用列表:
     *     login:登陆接口
     *     setUserItem:设置用户数据,获取用户权限
     */
    static getUserItem(id, username = '') {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * from user where id=? or username=?`
            let params = [id, username]
            this.query(sql, params).then(result => {
                if (result.length > 0) {
                    resolve(result)
                } else {
                    reject([0, null, "该用户不存在"])
                }
            }).catch(err => {
                reject([0, err, "用户资料获取失败MODE!"])
            })
        })
    }

    /**
     * 用户token更新
     * @param {int} id 用户ID
     * @param {string} token 用户TOKEN
     * 使用列表:    
     *        login:登陆接口
     */
    static updateUserToken(id, token) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE \`user\` SET token=? WHERE id=?;`
            let params = [token, id]

            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "用户token更新失败MODE!"])
            })
        })
    }


}