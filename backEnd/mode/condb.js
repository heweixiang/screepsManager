/**
 * 文档介绍:数据库连接封装
 * 维护人员:何维想
 * email:heweixiang3@163.com
 * 创建日期:2021.5.13
 * 修改日期:2021.5.15
 */
const mysql = require('mysql');

module.exports = class Model {
    static conn = null
    static Pool = null

    /**
     * 数据库连接方法
     */
    static Connection(isPool) {
        // 判断是否为pool连接
        if (isPool == true) {
            Model.Pool = mysql.createPool({
                connectionLimit: 10,
                host: '', //服务器Ip  本地测试可以为localhost
                user: 'root',
                password: '',
                database: 'performancemanager',
                port: 3306
            })
        } else {
            Model.conn = mysql.createConnection({
                host: '',
                user: 'root',
                password: '',
                database: 'performancemanager',
                port: 3306,
                multipleStatements: true
            });
            Model.conn.connect(err => {
                if (err) {
                    console.log(`数据库连接失败: ${err.message}`);
                }
            });
        }
    }

    /**
     * 数据库关闭方法
     */
    static end() {
        if (null != Model.conn) {
            Model.conn.end();
        }
    }

    /**
     * 通用查询
     * @param {string} sql sql语句
     * @param {Array} params sql占位符
     */
    static query(sql, params = []) {
        return new Promise((resolve, reject) => {
            //数据库连接
            this.Connection()

            // 查询
            Model.conn.query(sql, params, (err, results) => {
                if (err) {
                    // 当出现错误时,将err反馈出去   .catch
                    reject(err)
                } else {
                    //查询成功反馈查询数据   .then
                    resolve(results)
                }
            })

            //数据库关闭
            this.end()
        })
    }

    /**
     * @param {*} sqlArr 数据库[sql:'',values:[]]
     */
    static transaction(sqlArr) {
        return new Promise((resolve, reject) => {
            var promiseArr = [];
            this.Connection(true)

            Model.Pool.getConnection(function(err, connection) {
                if (err) {
                    return reject(err)
                }
                connection.beginTransaction(err => {
                    if (err) {
                        return reject('开启事务失败')
                    }
                    // 将所有需要执行的sql封装为数组
                    promiseArr = sqlArr.map(({ sql, values }) => {
                            return new Promise((resolve, reject) => {
                                connection.query(sql, values, (e, rows, fields) => {
                                    e ? reject(e) : resolve({ rows, success: true })
                                })
                            })
                        })
                        // Promise调用所有sql，一旦出错，回滚，否则，提交事务并释放链接
                    Promise.all(promiseArr).then(res => {
                        connection.commit((error) => {
                            if (error) {
                                console.log('事务提交失败')
                                reject(error)
                            }
                        })

                        connection.release() // 释放链接
                        resolve(res)
                    }).catch(err => {
                        connection.rollback(() => {
                            console.log('数据操作回滚')
                        })
                        reject(err)
                    })
                })
            });
        })
    }
}