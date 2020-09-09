import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Collapse',
		className: 'app-scm-accountdescription-ueight',
		defaultActiveKey: ['1'],
		children: [{
			name: 'step1',
			component: 'Collapse.Panel',
			header: '一、准备工作',
			key: "1",
			children: [{
				name: 'content1',
				component: '::div',
				children: '1、“配置软件”安装位置：需要在U8软件所在机器上（或局域网的机器中），安装“配置软件”。配置正确后，才可以正常使用。'
			},{
				name: 'content2',
				component: '::div',
				children: '2、检查U8的配置：确定U8软件可以正常运行。详见下图'
			},{
				name: 'content3',
				component: '::img',
				className: 'img',
				src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img101.jpg',
			}]
		},{
			name: 'step2',
			component: 'Collapse.Panel',
			header: '二、下载配置软件',
			key: "2",
			children: [{
				name: 'content1',
				component: '::div',
				children: '点击菜单“对接设置--对接财务账套”，点下载配置软件，进行软件下载'
			},{
				name: 'content2',
				component: '::img',
				className: 'img',
				src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img102.png',
			}]
		},{
			name: 'step3',
			component: 'Collapse.Panel',
			header: '三、安装配置软件',
			key: "3",
			children: [{
				name: 'content1',
				component: '::div',
				children: '(1) 下载成功后，双击“金财管家-对接配置工具.exe”，按照向导完成安装即可。'
			},{
				name: 'content2',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img103.png',
			},{
				name: 'content3',
				component: '::div',
				children: [{
					name: 'title',
					component: '::span',
					children: '启动程序：双击桌面快捷方式'
				},{
					name: 'content1',
					component: '::img',
					className: 'img-small',
					src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img104.png',
				},{
					name: 'content2',
					component: '::span',
					children: '，启动程序。弹出管理员权限，请允许'
				}]
			},{
				name: 'content4',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img105.png',
			},{
				name: 'content5',
				component: '::div',
				children: '当出现以下界面时候，表示启动成功：'
			},{
				name: 'content6',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img106.png',
			},{
				name: 'content7',
				component: '::div',
				children: '程序启动，界面打开以后，请不要关闭。'
			}]
		},{
			name: 'step4',
			component: 'Collapse.Panel',
			header: '四、配置',
			key: "4",
			children: [{
				name: 'content1',
				component: '::div',
				children: '点击菜单“对接设置--对接财务账套”,进行对接配置操作：'
			},{
				name: 'content2',
				component: '::div',
				children: '第一步、“连接服务器”：'
			},{
				name: 'content3',
				component: '::div',
				children: '（1）财务软件：输入需要对应的财务软件，软件版本号，数据库版本。'
			},{
				name: 'content4',
				component: '::div',
				children: '（2）配置软件IP地址：配置软件所在的电脑IP地址。 端口号：配置软件的端口号。（默认端口，不需要修改）'
			},{
				name: 'content5',
				component: '::div',
				children: '（3）数据库账号和密码：上方所填财务软件所在的数据库账号和密码。 '
			},{
				name: 'content6',
				component: '::div',
				children: '详见下图'
			},{
				name: 'content7',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img107.png',
			},{
				name: 'content8',
				component: '::div',
				children: '当“配置软件”和U8软件安装在同一台机器上，并且U8打开路径没有端口号，则不需填写“高级”选项，否则请填写高级选项。'
			},{
				name: 'content9',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img108.png',
			},{
				name: 'content10',
				component: '::div',
				children: 'U8数据库默认端口是1433，如果有调整，请按照实际情况填写。如果出现错误信息，请按照错误信息的提示，进行修改。'
			},{
				name: 'content11',
				component: '::div',
				children: '第二步、“连接账套”'
			},{
				name: 'content12',
				component: '::div',
				children: '请填写需要绑定的财务软件的操作员账号、绑定的帐套。'
			},{
				name: 'content13',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img109.png',
			},{
				name: 'content14',
				component: '::div',
				children: '第三步、完成绑定'
			},{
				name: 'content15',
				component: '::div',
				children: ' 绑定完成后，会刷新界面，请稍等数秒。'
			},{
				name: 'content16',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img110.png',
			}]
		},{
			name: 'step5',
			component: 'Collapse.Panel',
			header: '五、生成U8凭证',
			key: "5",
			children: [{
				name: 'content1',
				component: '::div',
				children: '在“业务处理-销项”和“业务处理-进项”，都有“生成U8凭证”的功能'
			},{
				name: 'content2',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img111.png',
			},{
				name: 'content3',
				component: '::div',
				children: '如果U8启用了辅助核算，请选择发票上的客户、供应商，在U8产品的基础档案里的客户和供应商。一次选择以后，会有记忆功能，以后不需要重复选择。'
			},{
				name: 'content4',
				component: '::img',
				className: 'img',
				src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img112.png',
			},{
				name: 'content5',
				component: '::div',
				children: '请根据U8总账模块的科目设置情况，选择各个业务对应的科目。一次选择以后，会记住选择，以后不需要重复选择。'
			},{
				name: 'content6',
				component: '::img',
				className: 'img',
				src: 'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img113.png',
			}]
		},{
			name: 'step6',
			component: 'Collapse.Panel',
			header: '六、打开U8，查看生成效果',
			key: "6",
			children: [{
				name: 'content1',
				component: '::div',
				children: '生成凭证成功以后，进入U8产品，打开查看凭证，即可查询到之前生成的凭证了。'
			},{
				name: 'title',
				component: '::img',
				className: 'img',
				src:  'https://ttk-resource.oss-cn-beijing.aliyuncs.com/help/ueight/img114.jpg',
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			
		}
	}
}
