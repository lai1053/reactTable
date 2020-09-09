import React from 'react'
import { Select, DataGrid, Table } from 'edf-component'
import { Map, fromJS } from 'immutable'
import SelectSubject from './selectSubject';
import SelectAssist from '../../../../bovms/components/selectAssist'
import renderDataGridCol from '../../../../bovms/components/column/index'
import SubjectSelector from './subjectSelector'
const { Option } = Select;


class SubjectSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tableData: [],
            loading: false
        }

        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async () => {
        const { tableData } = this.state;
        let flag = false
        let params = {
            module: 1,
            acctCodeDtoList: tableData.map(e => {
                if(!e.destAcctId) {flag = true}
                e.type = 'zangu'
                return e
            })
        }
        if(flag) {
            this.props.metaAction.toast('error', '会计科目不能为空');
            return false
        }
        let res = await this.props.webapi.operation.saveOrUpdateAcctCode(params);
        const ret = (res === null)
        if(this.props.genVoucher){
            return ret

        }else{
            const tips = (res === null) ? '设置成功' : '设置失败'
            const tipType = (res === null) ? 'success' : 'error'
            this.props.metaAction.toast(tipType, tips)
            return ret
        }
        // if (res === null) {
        //     this.props.metaAction.toast('success', '设置成功');
        //     return true
        // } else {
        //     this.props.metaAction.toast('error', '设置失败');
        //     return false
        // }
    }

    componentDidMount() {
        this.getSubjectMatchList(false)
    }

    //获取数据
    async getSubjectMatchList(flag) {
        this.setState({ loading: true })
        let res = await this.props.webapi.operation.queryAcctCodeByModule({ module: 1, type: "zangu" });
        this.setState({ loading: false })
        this.setState({
            tableData: res,
            loading: false
        })
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    }

    //设置科目
    onSubjectChange(index, value) {
        if (!value) return

        const isObject = this.isObject(value);
        const json =
            isObject && value.assistList
                ? JSON.stringify({ assistList: value.assistList })
                : "";

        let data = this.state.tableData
        let dItem = data[index]
        dItem.destAcctId = isObject ? value.id : undefined;
        dItem.destAcctName = isObject ? value.gradeName : undefined;
        dItem.destAcctCode = isObject ? value.code : undefined;
        dItem.assistCiName = isObject ? json : undefined;

        this.setState({
            tableData: data
        })
    }

    getColumns() {
        let { tableData } = this.state,
            dataSource = tableData,
            colOption = { 
                dataSource, 
                width: 100, 
                fixed: false, 
                align: 'center', 
                className: '', 
                flexGrow: 1, 
                lineHeight: 37, 
                isResizable: false, 
                noShowDetailList: true 
            }
        let { metaAction, store, webapi } = this.props;
        let columns = [{
            title: '成本项目',
            dataIndex: 'acctName',
            key: 'acctName',
            align: 'center',
        },
        {
            title: '成本科目',
            dataIndex: 'destAcctId',
            key: 'destAcctId',
            align: 'center',
            render: (text, record, index) => (<SubjectSelector
                value={text}
                metaAction={metaAction}
                store={store}
                webapi={webapi}
                record={record}
                index={index}
                onSubjectChange={this.onSubjectChange.bind(this, index)}>
            </SubjectSelector>)
        }]
        return columns
    }

    render() {
        const { tableData, loading } = this.state;
        const { metaAction, store, webapi } = this.props;
        const columns = [{
            title: '业务性质',
            dataIndex: 'acctName',
            key: 'acctName',
            align: 'center',
        },
        {
            title: (
                <span>
                    <span style={{color: 'red', verticalAlign: 'middle', margin: '0 4px'}}>*</span>
                    会计科目
                </span>
            ),
            dataIndex: 'destAcctId',
            key: 'destAcctId',
            align: 'center',
            render: (text, record, index) => (<SubjectSelector
                value={text}
                metaAction={metaAction}
                store={store}
                webapi={webapi}
                record={record}
                index={index}
                onSubjectChange={this.onSubjectChange.bind(this, index)}>
            </SubjectSelector>)
        },
        ]

        return (
            <div className="stock-subject-setting">
                <div className='stock-subject-setting-body bovms-app-purchase-list-table-row-edit' 
                    // style={{ margin: '16px 0', padding: '0 16px'}}
                    >
                    <Table
                        loading={loading}
                        className="bovms-common-table-style"
                        style={{ width: '100%', height: '200px',}}
                        columns={columns}
                        dataSource={tableData}
                        bordered
                        pagination={false}
                    ></Table>
                </div>
            </div>
        )
    }
}

export default SubjectSetting