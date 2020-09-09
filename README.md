##运行环境步骤
* 1、npm install
* 2、npm start
* 3、http://localhost:8081

##后端服务地址配置

* webpack.config.js文件中修改devServer的后端服务地址

##开发模式与线上环境运行区别

* 开发模式 webpack 的NODE_ENV=developer或空，在打包后，会暴露更多的问题，开发模式下建议不指定的NODE_ENV
* 使用配置文件：webpack.config.js


* 线上模式 webpack 的NODE_ENV=production,会抛更少的错误，很多插件的内部做了线上环境的预处理
* 使用配置文件：webpack.config.prd.js

## 本地调试单独编译app

需要编译的文件在 webpackSingleApp/index.js 中引入样式也在对应的style.less中引入


```
npm run singleStatic 

npm run single
```

## 运行环境步骤

- 1、npm install
- 2、npm run dll:edf
- 3、npm run theme
- 4、npm run dev
- 3、http://localhost:8081

> dev 环境配置文件，在build文件下，如果要修改热更新theme，请单独运行 npm run theme
> 该配置，只对invoices业务有效，如果要看其他业务，请运行npm run start

## 开发备忘录

- 1、 创建app

> ttk a bovms/bovms-app-sale-list

- 2、 创建模块

> ttk mo inv

- 3、 删除模块inv

> 手动删除 inv 目录下 除theme以外的文件夹
> ttk dmo inv

- 4、 props style

> style:'{{{return{width:800}}}}'

- 5、事件传参

> function(){$hander('arg')}

- 6、子app的data来自父级app，无法动态更新页面

> 需在子app上的componentWillReceiveProps中动态绑定，或者使用react原生组件
> componentWillReceiveProps 需先判断前后值是否相同，不同时才sf

- 7、一个页面同时加载2个相同app，传不同属性，会被第二个的属性覆盖

> ttk 使用了全局store，没有组件的概念，只能自行将属性改为数组

- 8、 字符串长度，中文2个，str.replace(/[\u0391-\uFFE5]/g,"aa").length

## 菜单appName

inv-app-batch-sale-list
销项
inv-app-batch-purchase-list
进项
inv-app-custom-list
批量采集
inv-app-fastAuthentication

inv-app-sales-zzsfp
销项-增值税专用发票
inv-app-sales-jdcxsfp
销项-机动车销售发票
inv-app-sales-zzsptfp
销项-增值税普通发票
inv-app-sales-ptjdfp
销项-普通机打发票
inv-app-sales-nsjctz
销项-纳税检查调整
inv-app-sales-wkjfp
销项-未开具发票
inv-app-sales-collect-card
一键读取销项
inv-app-sales-export-card
导出销项发票
inv-app-sales-batch-update-card
批量修改销项发票
inv-app-product-select
商品信息
调用方式：

> component: 'AppLoader',
> appName: 'inv-app-product-select',

1、单户
1）票据－发票采集，参数待定
inv-app-custom-list
2）发票认证－快速认证
inv-app-fastAuthentication-list
3）发票认证－勾选认证
inv-app-check-certification-list
4）发票认证－抵扣统计
inv-app-deduct-list
5）发票认证－认证结果查询
第三方地址－暂无
2、批量－发票采集
inv-app-custom-list

## 现有问题

1. 分页目前无法做到全部（北京那边回应：分页显示全部，蚂蚁金服不支持，暂时没办法实现）

产品方面：

1、评审后定版的需求，在开发过程中，存在多次修改追加需求情况；
2、升级性质产品需求，过度依赖老版使用形成的默认规则，在需求文档中，却没有这些规则说明；
3、缺少可交互的产品原型，影响了整个开发设计和实现；

项目分工合作方面：

1、多个项目组分工合作，每个组都需要多线联系，每个开发人员，沟通协调占用的比开发所耗的时间都长；
2、测试人员，测试检验和开发参照的标准不一致，对开发造成极大影响；
3、环境不稳定，上周四，基本每分钟一次服务器正在维护中，极其浪费时间影响进度；
4、测试环境发布更新周期长，发布时间久（不能及时进行发布测试，说是环境脆弱）；

前端开发方面：

1、ttk技术框架
1）（ttk内js/react语法、业务组件、redux等）开发使用说明文档缺乏，需开发人员自行摸索前进，希望能尽快补充好文档；
2）开发调试，错误定位太模糊，尤其是josn化的页面方面，需开发人员自行凭经验凭记忆判断问题产生原因；
3）架构升级维护人员少，只是内部开源，缺少外部参与者，长远发展受阻；
4）开发人员对ttk实际使用时间短，熟练程度不足支撑极短时间内的项目开发；
5）脚手架功能还比较弱，开发占用内存高、app删除/重命名命令缺少；
6）热更新速度慢，每次修改后都要重新编译运行（传统的只要不是修改配置文件，大部分的js和页面修改都是热更新的，耗时是传统的几十到上百倍）；
7）语法比较奇特，偏离主流的思想还有绕弯才能实现；例如modal对话框，对最主要的两个回调函数进行了改造，改造的方式不是遵循他ttk的语法，很难在这种没文档的条件下快速的使用；
8）很难对data.js进行维护（不接受反驳）；
9）对一些功能样式进行了全局修改（如input，datePicker的清空功能进行了隐藏等等）

2、项目时间紧，前端开发人员资源少，加班都不能解决开发资源短缺问题；

## 模块说明：

1. invoices 票据
2. bovms 业务
   ttk mo bovms

## 已确认需求

1. 如果用户未选择辅助项目点击【确定】，提示“必须选择辅助项目才可保存”，界面停留在选择辅助项目弹窗，这个提示确定为必填项模式。
2. 借方科目都可以编辑。
3. 设置相同档案中，列表翻页后，清除已选项。
4. 进项列表－－已生成凭证的发票不可编辑。屏蔽【编辑】按钮
5. 设为相同科目，打开【设为相同科目】弹窗。将明细的借方科目设为同一个科目。同时将明细的【是否存货】设为【否】
6. 设为相同档案，打开【设为相同档案】弹窗，将明细的存货档案设为同一个。同时将明细的【是否存货】设为【是】

## ttk app之间的调用

1. 1级页签切换

> this.component.props.setPortalContent

1. 2级页签切换

> this.component.props.setGlobalContent({
>           name: '页签名称',
>           appName: appName,
>           params: {},
>           orgId: 
>           showHeader:true
>       })

1. 页面替换

> this.component.props.onRedirect