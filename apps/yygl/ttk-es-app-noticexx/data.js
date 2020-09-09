export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-noticexx',
		children: [{
			name: 'wrap',
			component: '::div',
			className: 'ttk-es-app-noticexx-div',
			children: [{
				name: 'tips',
				component: '::div',
                className: 'ttk-es-app-noticexx-div-tips',
				children: '{{data.ggxx.title}}'
			}, {
				name: 'des',
				component: '::div',
                className: 'ttk-es-app-noticexx-div-des',
				children: [
					{
						name:'dateIcon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        className: 'icon-jilu-yonghu',
                        type: 'jilu'
					},
                    {
                        name:'date',
                        component: '::span',
                        className: 'ttk-es-app-noticexx-div-des-date',
						children:'{{data.ggxx.sendTime}}'
                    },
                    {
                        name:'dateIcon',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        className: 'icon-jilu-yonghu',
                        type: 'yonghu'
                    },
                    {
                        name:'role',
                        component: '::span',
                        className: 'ttk-es-app-noticexx-div-des-date',
                        children:''
                    }
				]
			},
			{
				name:'ggcontent',
				component:'::div',
				className:'ttk-es-app-noticexx-div-nr',
				children:'{{$getMessageContent(data.ggxx.content)}}',
				// dangerouslySetInnerHTML={_html: 'xxxxxxxxxx'}
			}
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			ggxx:{
                title: '升级公告',
                sendTime: '2019-6-13',
                role: '系统管理员',
                content:'系统升级公告',
			}
		}
	}
}