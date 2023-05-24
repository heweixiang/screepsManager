// TODO 这里redis暂时不使用
// /**
//  * 文档介绍:redis读取写入
//  * 维护人员:何维想
//  * email:heweixiang3@163.com
//  * 创建日期:2021.5.13
//  * 修改日期:2021.5.15
//  */

// const Redis = require('redis')


// /**
//  * 数据库连接方法
//  */
// const _createClient = () => {
//     const client = Redis.createClient(6379, '127.0.0.1')
//         // RedisIO.conn.auth('', () => {})
//     client.on("error", function(err) {
//         console.log("redis error: " + err);
//     });
//     return client;
// }

// const redisClient = _createClient();

// /**
//  * 
//  * @param {*} key 
//  * @param {*} time 
//  * @returns 
//  */
// function getKey(key, time = 0) {
//     // time 值为设置过期token时间,默认为0验证码
//     return new Promise((resolve, reject) => {
//         // 查询
//         redisClient.get(key, (err, results) => {
//             if (err == null) {
//                 // 将尚未过期的key延期
//                 if (redisClient.expire(key, time * 1000) == true) {
//                     if (time == 0) {
//                         // 验证码反馈
//                         resolve(JSON.parse(`"${results}"`))
//                     } else {
//                         // 普通用户数据反馈
//                         resolve(JSON.parse(results))
//                     }
//                 } else {

//                     reject('redis更新时间失败!')
//                 }
//             } else {
//                 reject(err)
//             }
//         })
//     })
// }

// /**
//  * 
//  * @param {*} key 
//  * @returns 清除redis缓存KEY
//  */
// function clearKey(key) {
//     return new Promise((resolve, reject) => {
//         if (key) {
//             redisClient.DEL(key)
//             redisClient.expire(key, 0)
//             resolve('y')
//         } else {
//             resolve('y')
//         }
//         reject('n')
//     })
// }

// /**
//  * 
//  * @param {*} key 
//  * @param {*} value 
//  * @param {*} time 时间,默认24
//  * @returns 
//  */
// async function setKey(key, value, time = 24) {
//     return new Promise((resolve, reject) => {
//         redisClient.set(key, value, (err, result) => {
//             if (err) {
//                 reject(err)
//             } else {
//                 redisClient.expire(key, parseInt(time * 60));
//                 resolve(result)
//             }
//         })
//     })
// }

// module.exports = { getKey, clearKey, setKey }