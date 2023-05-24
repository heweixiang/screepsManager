 /**
  * 文档介绍:基础反馈封装数据
  * 维护人员:何维想
  * email:heweixiang3@163.com
  * 创建日期:2021.5.14
  */

 const { rejects } = require("assert")
 const { resolve } = require("path")

 module.exports = class res {

     /**
      * 
      * @param {int} status 1 成功   0 失败   -1   无权限 2 其他错误
      * @param {Array} data   接收数据库数据,将数据反馈给user 
      * @param {string} msg 将解释消息传给user 
      * @param {int} count 表格数据需要单独提取
      */
     static dataEncapsulation(status = 1, data = null, msg, count = 1) {
         /**
          * status: 1 成功   0 失败  -1 权限不足   2  其他错误 
          * data:直接丢
          * msg:直接丢
          * count:表格原因由调用者传入
          */
         let res = {}
         res.status = status
         res.data = data
         res.msg = msg
         res.count = count
             // console.log(res);
         return res
     }

     /**
      * 
      * @param {*} status 可不传
      * @param {*} data 可不传
      * @param {*} msg 
      */
     static Err(err) {
         let res = {}

         res.status = err[0]
         res.data = err[1]
         res.msg = err[2]

         res.count = 1
         return res
     }

     /**
      * 空的promise,用于美化代码  其实直接  new Promise() 即可
      */
     static nullPromise() {
         return new Promise((resolve, reject) => { resolve('nullPromise') })
     }
 }