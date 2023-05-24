/**
 * 文档介绍:工单模型层,用于工单类型的数据库交互
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.14
 */

module.exports = class WorkOrder extends require('./condb') {


    /**
     * 获取工单列表
     * @param {object} data 工单列表查询项
     * 使用列表:
     *      getWorkOrderList:获取工单列表
     */
    static getWorkOrderList(data) {
        return new Promise((resolve, reject) => {
            let query = data.query
            if (query == '' || query == undefined) { query = '"%"' } else { query = `"%${query}%"` }
            let sql = `SELECT * FROM workorderlist WHERE (intro LIKE ${query} or uname LIKE ${query} or ename LIKE ${query} or dname LIKE ${query} or ctime LIKE ${query})
                        AND (uid=? OR eid=? OR did=? or 1=?) order by ctime desc LIMIT ?,?;SELECT FOUND_ROWS() as total;`
            let params = [data.uid, data.eid, data.did, data.ad, data.index, data.limit]
            this.query(sql, params).then(res => {
                // res.total = this.getTotal()
                res = {
                    data: res[0],
                    total: res[1][0].total
                }

                resolve(res)
            }).catch(err => {
                reject([0, err, "工单列表获取失败MODE!"])
            })
        })
    }

    /**
     * 评价工单功能
     * @param {object} data 工单评价数据
     * 使用列表:
     *      scoreWorkOrderItem:评价工单
     */
    static scoreWorkOrderItem(data) {
        return new Promise((resolve, reject) => {
            let sql = ''
            let params = []
            if (data.jurisdiction === 1) {
                // 用户评价
                sql = `UPDATE workorder SET ustart=?,ucontent=?,wstatus=4,ustarttime=NOW() WHERE id=?;`
                params = [data.start, data.content, data.id]
            } else {
                // manager评价
                sql = `UPDATE workorder SET mstart=?,averagestart=(ustart+?)/2,mcontent=?,wstatus=5,mstarttime=NOW() WHERE id=?;`
                params = [data.start, data.start, data.content, data.id]
            }
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "评价发表失败MODE!"])

            })
        })
    }

    /**
     * 返回图表内容,两条sql语句
     * @param {int} isAd 是否为AD
     * @param {int} did 部门ID
     * 使用列表:
     *      getCharData:获取图表数据
     */
    static getCharData(isAd, did) {
        return new Promise((resolve, reject) => {
            let sql = ''
            let params = []
            if (isAd) {
                // admin模式  部门id,部门名称,人数,总start  两个饼图 一个人数比例 一个start比例
                sql = `SELECT departmentid AS did,(SELECT departmentname FROM department WHERE id=departmentid) AS departmentname,
                (SELECT COUNT(*) FROM \`user\` WHERE departmentid=did) AS counte,(SELECT SUM(averagestart) FROM workorder 
                WHERE did=departmentid AND wstatus=5) as countstart FROM \`user\` GROUP BY departmentid`
            } else {
                // manager模式  员工ID,员工性别,员工start  员工男女比例图,部门start前十列表
                sql = `SELECT id,name,sex,(SELECT SUM(averagestart) FROM workorder WHERE uid=user.id AND wstatus=5) AS estart FROM \`user\` WHERE departmentid=? ORDER BY estart desc`
                params = [did]
            }
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "获取图表失败MODE!"])

            })
        })
    }

    /**
     * 获取Excel图表
     * @param {int} isAd 是否为AD
     * @param {int} did 不是AD则部门
     * 使用列表:
     *      getExcel:获取Excel
     */
    static getExcel(isAd, did) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT id,uid,(SELECT \`name\` FROM \`user\` WHERE id=uid) as uname,did,
            (SELECT departmentname FROM department WHERE id =did) as dname,
            (SELECT \`name\` FROM \`user\` WHERE id = eid) as ename,
            ctime,intro,content,remarks,midea,mideatime,eidea,eideatime,ustart,ucontent,ustarttime,mstart,mcontent,mstarttime,averagestart 
            FROM workorder	WHERE 1=? or did=?`

            let params = [isAd, did]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "获取Excel失败MODE!"])
            })
        })
    }

    /**
     * 分配工单接口
     * @param {object} data 分配工单对象
     * 使用列表:
     *      checkWorkOrderItem:分配工单接口
     */
    static checkWorkOrderItem(data) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE workorder SET wstatus=2,midea=?,mideatime=NOW(),eid=? WHERE id=?;`
            let params = [data.idea, data.eid, data.id]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "分配工单失败MODE!"])
            })
        })
    }

    /**
     * 员工端表单提交
     * @param {object} data 表单提交数据对象
     *  使用列表:
     *      subWorkOrderItem:员工表单提交接口
     */
    static subWorkOrderItem(data) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE workorder SET wstatus=3,eidea=?,eideatime=NOW() WHERE id=?;`
            let params = [data.idea, data.id]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "提交工单失败MODE!"])
            })
        })
    }

    /**
     * 查询表单内容
     * @param {int} id 表单ID
     * 使用列表:
     *       subWorkOrderItem:员工提交工单接口
     *       getWorkOrderItem:获取工单内容接口
     */
    static getWorkOrderItem(id) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM workorder WHERE id=?`
            let params = [id]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "获取工单失败MODE!"])
            })
        })
    }

    /**
     * 创建工单
     * @param {object} data 发布工单的必备数据3
     * 使用列表:
     *      createWorkOrderItem:发布工单接口
     */
    static createWorkOrderItem(data) {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO workorder(uid,did,ctime,intro,content,remarks,urgent,uidea,wstatus) 
            VALUES (?,?,NOW(),?,?,?,?,?,1);`
            let params = [data.token.id, data.did, data.intro, data.content, data.remarks, data.urgent, data.uidea]
            this.query(sql, params).then(res => {
                resolve(res)
            }).catch(err => {
                reject([0, err, "创建工单失败MODE!"])
            })
        })
    }
}