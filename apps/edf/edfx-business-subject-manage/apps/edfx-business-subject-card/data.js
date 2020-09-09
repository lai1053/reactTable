import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'edfx-subject-card',
        children: {
            name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
            spinning: '{{data.other.loading}}',
            children:{
                name: 'form',
                component: 'Form',
				className: 'edfx-subject-card-form',
                children:[{
                    name: 'asset',
					component: 'Form.Item',
					_visible: '{{data.other.isBatch}}',
					label: '{{data.other.influenceList && data.other.influenceList[_rowIndex].influence }}',
					children: '{{data.other.influenceList && data.other.influenceList[_rowIndex].influenceValue }}',
					_power: 'for in data.other.influenceList'
                },{
					name: 'subject',
					component: 'Form.Item',
					label: '对应科目',
					required: '{{data.other.isBatch}}',
					children: [{
						name: 'subject',
						component: 'Select',
						value: '{{data.form.glAccountId}}',
						showSearch: '{{true}}',
						optionFilterProp:"children",
						filterOption: '{{$filterOptionSubject}}',
						allowClear: false,
						dropdownStyle: { width:400 },
                        dropdownMatchSelectWidth: false,
						onChange: `{{function(v){$selectSubject(v)}}}`,
						help: '{{data.other.error.glAccountId}}',
						children: {
							name: 'option',
							component: 'Select.Option',
							title: '{{data.other.subjectList && data.other.subjectList[_rowIndex].label }}',
							value: '{{data.other.subjectList && data.other.subjectList[_rowIndex].value }}',
							children: '{{data.other.subjectList && data.other.subjectList[_rowIndex].label }}',
							_power: 'for in data.other.subjectList'
						},
						dropdownClassName: 'edfx-business-subject-manage-selects',
						dropdownFooter: {
							name: 'add',
							component: 'Button',
							type: 'primary',
							style: { width: '100%', borderRadius: '0' },
							onClick: '{{$addSubject}}',
							children: '新增科目'
						},
					}]
				}
                ]
            }
        }
    }
}

export function getInitState() {
	return {
		data: {
			form: {	
                codeAndName: '1234-对应科目'
			},
			other: {
				error: {},
				loading: false,
				isBatch: true,
				assetAttribute: '固定资产',
				assetClass: '房屋建筑物',
                subjects:[{
                    id: 1,
                    name: '科目1'
                },{
                    id: 2,
                    name: '科目2'
                },{
                    id: 3,
                    name: '科目3'
                },{
                    id: 4,
                    name: '科目4'
                }]
			},
			
		}
	}
}
