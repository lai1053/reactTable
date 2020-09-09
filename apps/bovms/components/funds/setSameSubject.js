import React from 'react'
// import { DatePicker } from 'edf-component'
import { Select, Form } from 'antd'
const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 16 },
    },
};

class SetSameSubject extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            optionList: [],
            form: {
                kjkm: undefined,
            },
            labelOption: {
                'customer': '客户',
                'supplier': '供应商',
                'project': '项目',
                'department': '部门',
                'person': '人员',
                'inventory': '存货',
                'exCalc1': '',
                'exCalc2': '',
                'exCalc3': '',
                'exCalc4': '',
                'exCalc5': '',
                'exCalc6': '',
                'exCalc7': '',
                'exCalc8': '',
                'exCalc9': '',
                'exCalc10': '',
            },
            archives: {
                'customer': [],
                'supplier': [],
                'project': [],
                'department': [],
                'person': [],
                'inventory': [],
                'exCalc1': [],
                'exCalc2': [],
                'exCalc3': [],
                'exCalc4': [],
                'exCalc5': [],
                'exCalc6': [],
                'exCalc7': [],
                'exCalc8': [],
                'exCalc9': [],
                'exCalc10': [],
            },
            formItems: [],
        }
        if (props.setOkListener) {
            props.setOkListener(this.handleSubmit)
        }
        this.webapi = props.webapi || {};
    }

    handleSubmit = e => {
        e && e.preventDefault && e.preventDefault();
        let selectedValues;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                selectedValues = values;
            }
        });
        // console.log('Received values of form: ', selectedValues);
        if (selectedValues) {
            const { archives, optionList } = this.state;
            let result = [],
                kjkmItem = optionList.find(f => f.id === selectedValues.kjkm) || {};
            delete selectedValues.kjkm;
            Object.keys(selectedValues).forEach(key => {
                if (archives[key]) {
                    result.push({
                        ...archives[key].find(f => String(f.id) === selectedValues[key]),
                        archivesType: key.indexOf('isExCalc') > -1 ? key.replace('isEx', 'ex') : `calc${key.substr(0, 1).toLocaleUpperCase()}${key.slice(1)}`,
                    })
                }
            })
            result = result.map(m => ({ id: m.id, name: m.name, type: m.archivesType }))
            return { ...kjkmItem, assistList: result };
        }
        return false;
    }
    componentDidMount() {
        this.initKjkm(); //会计科目
        this.getAllArchive();
    }
    initKjkm = async () => {
        const { webapi, metaAction } = this.props;
        // console.log('webapi:', webapi, this.props)
        if (webapi && webapi.funds ) {
            const res = await webapi.funds.getFundChildAccountCodeList({ module: 'fund' });
            if (res) {
                this.setState({ optionList: res })
            }

        }
    }
    getAllArchive = async () => {
        const res = await this.webapi.funds.allArchive({ isEnable: true })
        if (res) {
            const { labelOption, archives } = this.state

            archives.customer = res['客户'] || [];
            archives.supplier = res['供应商'] || [];
            archives.project = res['项目'] || [];
            archives.department = res['部门'] || [];
            archives.person = res['人员'] || [];
            archives.inventory = res['存货'] || [];
            res['自定义档案'] && res['自定义档案'].forEach(item => {
                labelOption[item.calcName] = item.name;
                archives[item.calcName] = item.userDefineArchiveDataList || [];
            });
            this.setState({ labelOption, archives })
        }
    }
    archiveFocus = async (archiveName) => {
        // console.log('archiveFocus:', archiveName);
        let params, response;

        if (archiveName == 'department') {
            params = { entity: { isEnable: true, isEndNode: true } }
        } else {
            params = { entity: { isEnable: true } } //获取没有停用基础档案
        }

        if (archiveName.indexOf('exCalc') > -1) {
            let index = archiveName.substr(archiveName.length - 1, 1)
            const parmasObj = { entity: { calcName: `isExCalc${index}`, isEnable: true } }
            response = await this.webapi.funds.userDefineItem(parmasObj)
        } else {
            response = await this.webapi.funds.fixedArchive(params, archiveName)
        }
        if (response) {
            const { archives } = this.state;
            archives[archiveName] = response.list;
            this.setState({ archives });
        }
    }
    handleSubjectChange = (value, option) => {
        // console.log(e);
        const item = option.props.item;
        let formItems = [];
        if (item && item.isCalc) {
            formItems = Object.keys(item).filter(f => (f !== 'isCalc' && f.indexOf('Calc') > 0 && item[f] === true)).map(m => m.replace('isCalc', '').toLocaleLowerCase()) || []
        }
        this.setState({ formItems })
    }
    render() {
        const { optionList, labelOption, archives, formItems, form } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="bovms-app-purchase-list-set-same-subject">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="会计科目" {...formItemLayout}>
                        {getFieldDecorator('kjkm', {
                            rules: [{ required: true, message: `会计科目不能为空！` }],
                            initialValue: form.kjkm,
                        })(<Select
                                onChange={this.handleSubjectChange}
                                style={{ width: '100%'}}
                                dropdownMatchSelectWidth={true}
                                dropdownClassName="bovms-select-subject-dropdown no-add"
                                notFoundContent='无匹配结果'
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                            {
                                optionList.map(item=>(
                                    <Option value={item.id} key={item.id} item={item}>{item.codeAndName}</Option>
                                ))
                            }
                        </Select>
                        )
                    }
                    </Form.Item>
                    {formItems&&formItems.length>0?<p style={{color:'rgba(0, 0, 0, 0.85)'}}>辅助项目</p>:null}
                    {
                        formItems.map(item=>{
                            if(!archives[item])
                            return null
                            return  (
                                <Form.Item key={item} label={labelOption[item]} {...formItemLayout}>
                                    {getFieldDecorator(item, {
                                        rules: [{ required: true, message: `${labelOption[item]}不能为空！` }],
                                        initialValue: form[item],
                                    })(<Select
                                        dropdownClassName="bovms-select-subject-dropdown"
                                        // onFocus={()=>this.archiveFocus(item)}
                                        showSearch
                                        style={{width:'100%'}}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {archives[item].map(op=>(
                                            <Option key={op.id}>{op.name}</Option>
                                        ))}
                                    </Select>)}
                                </Form.Item>
                            )})
                    }
                </Form>
            </div>
        )
    }
}

export default Form.create({ name: 'bovms_app_set_same_subject' })(SetSameSubject);