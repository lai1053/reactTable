
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-dzgl-app-no-company',
		children: [{
			name: 'header',
			className: 'ttk-dzgl-app-no-company-header',
			component: 'Layout',
			children: [{
				name: 'header-left',
				component: 'Layout',
				className: 'ttk-dzgl-app-no-company-header-left',
				children: [{
					name: 'logo',
					component: '::img',
					className: 'ttk-dzgl-app-no-company-header-left-logo',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login_jc.png'}}"
				}, {
					name: 'split',
					component: '::div',
					className: 'ttk-dzgl-app-no-company-header-left-split',
				}, {
					name: 'item',
					className: 'ttk-dzgl-app-login-header-left-login',
					component: '::span',
					children: '企业登录'
				}, {
					name: 'gzlogo',
					component: '::img',
					className: 'ttk-dzgl-app-login-header-left-logo',
					// onClick:'{{$goLanding}}',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login.png'}}"
				}]
			}]
		}, {
			name: 'content',
			className: 'ttk-dzgl-app-no-company-content',
			component: 'Layout',
			children: [
                {
                    name:'title',
                    component: '::div',
                    className: 'ttk-dzgl-app-no-company-content-title',
                    children: [{
                        name: 'yesIcon',
                        component: 'Icon',
                        style: {fontSize:'40px',fontWeight: '800'},
                        fontFamily: 'edficon',
                        type: 'gaojichaxunlideduigou'
                    },{
                        name:'label1',
                        component: '::span',
                        className: 'ttk-dzgl-app-no-company-content-title-label1',
                        children: '账号登录成功'
                    }]
                },{
                    name:'titleLable',
                    component: '::div',
                    className: 'ttk-dzgl-app-no-company-content-content',
                    children: [{
                        name:'titleLable1',
                        component: '::span',
                        children: '您还没有加入任何机构，您可以：'
                    }]
                },{
                    name:'list1',
                    component: '::div',
                    className: 'ttk-dzgl-app-no-company-content-content',
                    children: [{
                        name:'list1-1',
                        component: '::span',
                        children: '1）注册新机构，开始使用金财代账产品'
                    },{
                        name:'list1-2',
                        component: '::span',
                        className: 'ttk-dzgl-app-no-company-content-content-login',
                        children: '立即注册',
                        onClick: '{{$register}}'
                    }]
                },{
                    name:'list2',
                    component: '::div',
                    className: 'ttk-dzgl-app-no-company-content-content',
                    children: [{
                        name:'list2-1',
                        component: '::span',
                        children: '2）联系您所在机构的系统管理员，将您加入到机构中，然后您就可以使用金财代账产品了'
                    }]
                },
            ]
		},
            {
			name: 'footer',
			className: 'ttk-dzgl-app-no-company-footer',
			component: 'Layout',
			children: [{
				name: 'item1',
				component: '::p',
				children: [{
					name: 'item1',
					component: '::span',
					children: '{{appBasicInfo.name}}'
				}, {
					name: 'version',
					id: 'lbl-version',
					component: '::span',
					children: '{{data.other.version}}'
				}, {
					name: 'item2',
					component: '::span',
					children: '{{" 版权所有 © 2018 " + (appBasicInfo.companyName || "") +" "}}'
				}, {
					name: 'item3',
					component: '::span',
					children: '{{appBasicInfo.copyright1}}'
				}, {
					name: "item4",
					component: "::a",
					target: "_blank",
					style: { color: "#a1a1a1" },
					href: '{{appBasicInfo.beianDomain}}',
					children: '{{appBasicInfo.copyright2}}'
				}, {
					name: 'item5',
					component: '::span',
					children: '{{appBasicInfo.copyright3}}'
				}]
			}
			]
		}
		]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				account: '',
				password: '',
				mobile: '',
				remember: false,
			},
			other: {
				error: {},
				selectedImgIndex: 0,
				imgs: [],
				userInput: false,
				checkTips: false,
				version: '',
			}
		}
	}
}
