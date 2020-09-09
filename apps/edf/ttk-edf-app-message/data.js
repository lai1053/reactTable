export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-message',
		children: [{
			name: 'list',
			component: '::div',
			className: 'ttk-edf-app-message-list',
			children: [{
				name: 'top',
				className: 'ttk-edf-app-message-list-top',
				component: '::div',
				children: [{
					name: 'title',
					component: '::span',
					className: 'ttk-edf-app-message-list-top-title',
					children: '系统消息'
				}, {
					name: 'batch',
					component: '::div',
					className: 'ttk-edf-app-message-list-top-batch',
					children: [{
						name: 'tagread',
						component: 'Button',
						onClick: '{{$markRead}}',
						className: 'ttk-edf-app-message-list-top-batch-read',
						type: 'primary',
						children:'标记已读'
					}, {
						name: 'batchDelete',
						component: 'Button',
						onClick: '{{$deleteMsg}}',
						className: 'ttk-edf-app-message-list-top-batch-delete',
						children: '批量删除'
					}]
				}]
			}, {
				name: 'content',
				className: 'ttk-edf-app-message-list-main',
				component: '::div',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-edf-app-message-list-main-top',
					checked: '{{data.checkedAll}}',
					children: [{
						name: 'left',
						component: '::div',
						className: 'ttk-edf-app-message-list-main-top-left',
						children: [{
							name: 'checkall',
							component: 'Checkbox',
							children: '全部',
							onChange: '{{function(e){$checkAll(e)}}}'
						}]
					}]
				}, {
					name: 'messagelist',
					component: '::div',
					className: 'ttk-edf-app-message-list-main-messagelist',
					children: [{
						name: 'message',
						component: '::div',
						children: [{
							name: 'check',
							component: 'Checkbox',
							checked: '{{data.messages[_rowIndex].checked}}',
							onChange: '{{function(e){$markCheck(e,_rowIndex)}}}'
						}, {
							name: 'state',
							component: 'Icon',
							fontFamily: 'edficon',
							className: '{{data.messages[_rowIndex].isRead ? "yidu" : "weidu"}}',
							type: '{{data.messages[_rowIndex].isRead ? "yidu" : "weidu"}}'
						}, {
							name: 'content',
							component: '::span',
							className: '{{data.messages[_rowIndex].isRead ? "messageTitle" : "messageTitle unread"}}',
							onClick: '{{function(){$showModal(_rowIndex)}}}',
							children: {
								name: 'item',
								component: '::span',
								children:'{{"[" + $getMessageType(data.messages[_rowIndex].messageType) + "]" + data.messages[_rowIndex].title}}'
							}
						}, {
							name: 'date',
							component: '::span',
							className: 'messageDate',
							children: '{{data.messages[_rowIndex].sendTime}}'
						}],
						_power: 'for in data.messages'
					}],
				}]
			}]
		}, {
			name: 'pagination',
			component: '::div',
			className: 'ttk-edf-app-message-pagination',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}, {
			name: 'modalcontainer',
			component: '::div',
			_visible: '{{data.showModal}}',
			className: 'ttk-edf-app-message-modalContainer',
			children: [{
				name: 'shandow',
				component:'::div',
				className: 'ttk-edf-app-message-modalContainer-shadow',
				onClick: '{{$hideModal}}',
			}, {
				name: 'modal',
				component: '::div',
				className: 'ttk-edf-app-message-modalContainer-modal',
				children: [{
					name: 'modalTitle',
					component: '::div',
					className: 'modalTitle',
					children: [{
						name: 'title',
						component: '::span',
						className: 'title',
						children: '{{data.msgTitle}}',
					}, {
						name: 'close',
						component: 'Icon',
						className: 'close',
						fontFamily: 'edficon',
						type: 'guanbi',
						onClick: '{{$hideModal}}'
					}]
				}, {
					name: 'modalBody',
					component: '::div',
					className: 'modalBody',
					children: '{{$getMessageContent()}}'
				}, {
					name: 'modalFooter',
					component: '::div',
					className: 'modalFooter',
					children: [{
						name: 'close',
						component: 'Button',
						type: 'primary',
						children: '关闭',
						onClick: '{{$hideModal}}'
					}]
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			msgContent: '',
			messages:[],
			checkedAll: false,
			pagination: { 
				currentPage: 1,
				pageSize: 50,
			},
			showModal: false		
		}
	}
}