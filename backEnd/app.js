const login = require("./router/login")
const generalAuthority = require("./router/generalAuthority")
const advancedPermissions = require("./router/advancedPermissions")
const comprehensiveAuthority = require("./router/comprehensiveAuthority")

// ↑  导入一堆router
// 导入并且使用express
const express = require('express')
const app = express()

// 导入跨域中间件
const cors = require('cors')
app.use(cors())

//设置body解析中间件
app.use(express.urlencoded({
    extends: true
}));

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('unhandledRejection', error);
});


// 多重角色路由分发方便管理以及后续修改功能
//Upgrade: 由于原有接口设计导致前端代码冗余过高,先将接口调整为以下状态
//U: generalAuthority       权限用途:员工和用户接口放入此处即可
// app.use('/generalAuthority', generalAuthority)

//U: advancedPermissions    权限用途:管理员和主管接口放入此处即可
// app.use('/advancedPermissions', advancedPermissions)

//U: comprehensiveAuthority 权限用途:所有人共用的查询接口放入此处即可
// app.use('/comprehensiveAuthority', comprehensiveAuthority)

// 处理登陆以及注册路由       用途:用于无需用户登陆操作即可使用的接口,例如登陆和注册
// app.use('/login', login)

// 启动server
const server = app.listen(1587, '0.0.0.0', () => {
    console.log("server Run ...");
})