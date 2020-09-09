export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-final-cetficate',
		children: [{
			name: 'header',
			component: '::div',
			className: 'app-account-final-cetficate-header',
			children: [{
				name: 'date',
				allowClear: false,
				component: 'DatePicker.MonthPicker',
				className: 'app-account-final-cetficate-header-left',
				value: '{{$stringToMoment(data.other.period)}}',
				onChange: `{{function(d){$setField('data.other.settedPeriod', $momentToString(d,'YYYY-MM'))}}}`,
				disabledDate: `{{function(current){ var disabledDate = new Date(data.other.disabledDate)
					return current && current.valueOf() < disabledDate
				}}}`,
			},
			{
				name:'btn',
				component:'::div',
				className: 'app-account-final-cetficate-header-right',
				children: [{
					name: 'create',
					component: 'Button',
					className: 'create',
					type: 'primary',
					children: '一键生成'
				}]
			}
		]
			
		},
		{
			name: 'content',
			component: '::div',
			className: 'app-account-final-cetficate-content',
			children:[
				{
					name: 'sub',
					component: '::div',
					className: 'app-account-final-cetficate-content-list',
					children: [
						{
							name: 'div',
							component: '::div',
							className: 'item',
							key: '{{_rowIndex}}',
							children: [
								{
									name: 'header',
									component: '::div',
									className: 'header',
									children: [
										{
											name: 'header1',
											component: '::div',
											className: 'headerLeft',
											children: '{{data.list[_rowIndex].title}}'
										},
										{
											name: 'header2',
											component: '::div',
											className: 'headerRight',
											children: [
												{
													name: 'btn1',
													component: 'Icon',
													fontFamily: 'edficon',
													type: 'gerenshezhi',
													className: 'settingIcon',
													onClick: '{{function(){$setting(data.list[_rowIndex])}}}'
												},{
													name: 'btn2',
													component: 'Icon',
													fontFamily: 'edficon',
													type: 'guanbi',
													className: 'closeIcon',
													onClick: '{{function(){$delTemplate(data.list[_rowIndex])}}}'
												}
											]
										}
									]
								},
								{
									name: 'body',
									component: '::div',
									className: 'content',
									children: [
										{
											name: 'sub',
											component: '::div',
											className: 'subContent',
											children: [
												{
													name: 'amount',
													component: '::div',
													className: 'amount',
													children: [
														{
															name: 'subAmount1',
															component: '::span',
															children: '金额：'
														},{
															name: 'subAmount2',
															component: '::span',
															children: '{{data.list && data.list[_rowIndex].amount}}'
														}
													]
												},
												{
													name: 'code',
													component: '::div',
													className: 'code',
													children: {
														name: 'div',
														component: '::span',
														children: '{{data.list && data.list[_rowIndex].docCode?data.list[_rowIndex].docCode:""}}'
													}
												}
											]
											
										},
										
									]
								},{
									name: 'footer',
									component: '::div',
									className: 'footer',
									children: {
										name: 'footer1',
										component: 'Button',
										className: 'link',
										children: '查看凭证',
										_visible: '{{data.list&&data.list[_rowIndex].docId}}',
										onClick: '{{function(){$linkProofList( data.list[_rowIndex].docId)}}}'
									}
								}
							],
							_power: 'for in data.list'
						}
					]
			},{
				name: 'add',
				component: '::div',
				className: 'app-account-final-cetficate-content-add',
				children: {
					name:'div',
					component: '::div',
					className: 'app-account-final-cetficate-content-add-container',
					onClick: '{{$addModal}}',
					children: [{
						name: 'helpIcon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'gaojichaxunlidejia',
						className: 'addIcon'
	
					},{
						name: 'span',
						component: '::span',
						children: '添加',
						className: 'addTitle'
					}]
				}
			}]				
			
		}]
	}
}
export function getInitState(option) {
	return {
		data: {
			other: {
				period: ''
			}
		}
	}
}
export function addThousandsPosition(input, isFixed) {
	// if (isNaN(input)) return null
	if (isNaN(input)) return ''
	let num

	if (isFixed) {
		num = parseFloat(input).toFixed(2)
	} else {
		num = input.toString()
	}
	let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

	return num.replace(regex, "$1,")
}

