##运行环境步骤
* 1、npm install
* 2、npm run dll:edf
* 3、npm run theme
* 4、npm run dev
* 3、http://localhost:8081
> dev 环境配置文件，在build文件下，如果要修改热更新theme，请单独运行 npm run theme --watch
> 该配置，只对invoices业务有效，如果要看其他业务，请运行npm run start

##开发纪要
* 1、 创建app
> ttk app/a invoices/inv-app-xxx
* 2、 创建模块
> ttk mo inv
* 3、 删除模块inv
> 手动删除 inv 目录下 除theme以外的文件夹
> ttk dmo inv
## 项目约定
1.代码管理,每个人在自己的分支下工作，分支名为dev_xxx，开发总分支dev，项目主分支master，每天早上pull，每天下班前push
2.代码规范，统一使用sublime text，安装html-css-js Prettify等插件，命名遵循驼峰，注释按公司规定走
3.样式，必须带上业务前缀
4.碰到的问题，写到自己的readme文档中
5.如果需要添加／修改公共部分代码的，需提报给qiu

## 常用标签属性
_visible：控制显示隐藏
###0515
创建快速认证模块
 增值税专用发票	上传密钥：	inv-app-fastAuthentication
 	更新密钥：	inv-app-fastAuthentication-list-import-key
 	发票列表查询、显示（专票）	：inv-app-fastAuthentication-list
 	发送认证：	inv-app-fastAuthentication-list
 	刷新认证结果：	inv-app-fastAuthentication-list
 	导出认证数据-加密的dat文件：	inv-app-fastAuthentication-list
 	新增发票（同采集）	：此功能跳转至增值税专用发票新增页面
 	删除发票（同采集）：	inv-app-fastAuthentication-list



 海关专用缴款书	发票列表查询、显示（海关）：inv-app-fastAuthentication-customsList
 	待比对数据导出：inv-app-fastAuthentication-customsList
 	刷新认证结果	inv-app-fastAuthentication-customsList
  新增发票（同采集）	：此功能跳转至增值税专用发票新增页面
 	电子税务局单点登陆	：此功能需求已砍
 	删除发票（同采集）	：inv-app-fastAuthentication-customsList

# 其它模块调用票据模块的方法（只能查看）
```angular2
  let invArguments = {   // 查询票据的参数 三个key为必填项 如缺少参数请自行控制
                    fpzlDm:'01',
                    fpdm:'01',
                    fphm:'01'
                }
   let ret = this.metaAction.modal('show', {
                    title: '查看',
                    width:document.body.clientWidth - 50 || 1100,
                    footer: null,
                    style: { top: 5 },                 
                    bodyStyle: { padding: '0px 0 12px 0' },
                    children: this.metaAction.loadApp('inv-app-new-invoices-card', {  // 以下参数所有为必须项
                        store: this.component.props.store,
                        kjxh : 1, // 这个写死一个值为1
                        fplx : 'xxfp', // 'xxfp''jxfp'销项发票或者是进销发票 必传
                        fpzlDm: fpzlDm, // 发票种类代码必传
                        readOnly:true,  // 必传true
                        justShow : true,  // 必传true
                        invArguments
                    })
                })
```



