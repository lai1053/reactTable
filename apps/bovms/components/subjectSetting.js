import React from 'react'
import { Table, Input, Row, Col, Radio, Button, Select, Icon } from 'edf-component'
import { Map, fromJS } from 'immutable'
import SelectSubject from './selectSubject/index';
import FundSelectSubject from './funds/selectSubject';
const { Option } = Select;

class SubjectSelector extends React.Component {
    state = {
        editing: false,
    }
    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    };
    handleGetPopupContainer = () => {
        return document.querySelector(".ant-modal")
    }
    render() {
        const { editing } = this.state;
        const { module, metaAction, store, webapi, record, index, apiModule } = this.props;
        let defaultItem = {
            id: record.destAcctId,
            codeAndName: record.destAcctCodeName
        },
            subjectName = record.acctNamell;
        return editing ? (
            <div>
                {
                    module == 'fund'
                        ? <FundSelectSubject
                            ref={node => (this.input = node)}
                            onBlur={this.toggleEdit}
                            metaAction={metaAction}
                            store={store}
                            webapi={webapi}
                            autoExpand={true}
                            getPopupContainer={this.handleGetPopupContainer}
                            onChange={value => this.props.onSubjectChange(value, index, record)}
                            value={record.destAcctId}
                            defaultItem={defaultItem}
                            subjectName={subjectName}
                            isInDropdown
                        ></FundSelectSubject>
                        : <SelectSubject
                            ref={node => (this.input = node)}
                            selectType='2221'
                            onBlur={this.toggleEdit}
                            module={module}
                            metaAction={metaAction}
                            getPopupContainer={this.handleGetPopupContainer}
                            store={store}
                            webapi={webapi}
                            apiModule={apiModule}
                            autoExpand={true}
                            onChange={value => this.props.onSubjectChange(value, index, record)}
                            value={record.destAcctId}
                            defaultItem={defaultItem}
                            subjectName={subjectName}
                        />
                }
            </div>


        ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                    title={record.destAcctCodeName}
                >
                    {record.destAcctCodeName || ''}
                </div>
            );
    }
}

class SubjectSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: 1,
            sourceData: [],
            tableData: [],
            allCount: 0,
            notSettingCount: 0,
            loading: true
        }

        this.module = undefined;
        this.apiModule = ''

        switch (this.props.module) {
            case 'cg':
                this.module = 2
                this.apiModule = 'bovms'
                break
            case 'xs':
                this.module = 1
                this.apiModule = 'bovms'
                break
            case 'fund':
                this.module = 4
                this.apiModule = 'funds'
                break
            case 'stockCg':
                this.module = 2
                this.apiModule = 'operation'
                break
            case 'stockXs':
                this.module = 1
                this.apiModule = 'operation'
                break
            default:
                break
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async () => {
        const { sourceData } = this.state;
        let needFill = false, params = []
        Object.keys(sourceData).forEach(e => {
            if (sourceData[e].some(e => !e.destAcctId)) {
                needFill = true
            }
        })

        if (needFill) {
            this.props.metaAction.toast('error', '请设置科目');
            return false
        } else {
            Object.keys(sourceData).forEach(e => {
                sourceData[e].forEach(de => {
                    params.push(de)
                })
            })
        }

        // let res = await this.props.webapi[this.apiModule].updateSubjectMatch(params);
        // if (res) {
        //     this.props.metaAction.toast('success', '设置成功');
        //     return true
        // } else {
        //     this.props.metaAction.toast('error', '设置失败');
        //     return false
        // }
        // }

        // let params = []
        // Object.keys(sourceData).forEach(e => {
        //     sourceData[e].forEach(de => {
        //         params.push(de)
        //     })
        // })


        let res = await this.props.webapi[this.apiModule].updateSubjectMatch(params);
        if (res === null) {
            this.props.metaAction.toast('success', '设置成功');
            return params
        } else {
            this.props.metaAction.toast('error', '设置失败');
            return false
        }
    }

    componentDidMount() {

        this.getSubjectMatchList(false)
    }
    //自动匹配
    autoMatch() {
        this.getSubjectMatchList(true)
    }
    //获取数据
    async getSubjectMatchList(flag) {
        let res = await this.props.webapi[this.apiModule].getSubjectMatchList({yearPeriod:this.props.yearPeriod, module: this.module, flag: flag });
        if(res) {
            let obj = {}
            let allCount = 0
            Object.keys(res.data).map((e, i) => {
                allCount += res.data[e].length
                obj[e] = res.data[e].map((de, di) => {
                    de.type = e
                    de.key = i + '' + di
                    return de
                })
            })
            if(this.props.module == 'stockCg' && allCount) {
                obj['1税金科目'] = [obj['1税金科目'][0]]
                allCount = 1
            }
            this.setState({
                sourceData: obj,
                tableData: obj,
                notSettingCount: res.xppNum,
                allCount: allCount,
                loading: false
            })
        }
    }
    onChange(e) {
        let { sourceData } = this.state
        //切换数据
        if (e.target.value == 1) {
            this.setState({
                tableData: sourceData,
                filter: e.target.value
            })
        } else {
            let newData = {}
            Object.keys(sourceData).forEach(e => {
                let filterData = sourceData[e].filter(de => de.isMatched == 0);
                if (filterData.length) {
                    newData[e] = filterData
                }
            })

            this.setState({
                tableData: newData,
                filter: e.target.value
            })
        }
    }
    //设置科目
    onSubjectChange(val, index, record) {
        if (!val) return
        let data = this.state.sourceData

        let dItem = data[record.type].find(f => f.key === record.key)
        dItem.destAcctId = val.id;
        dItem.destAcctCodeName = val.codeAndName;
        dItem.isAuto = 0;
        dItem.isMatched = 1;
        this.setState({
            sourceData: data
        })
    }
    getNotSettingCount() {
        let count = 0
        let { sourceData } = this.state

        Object.keys(sourceData).forEach(e => {
            sourceData[e].forEach(de => {
                if (de.isMatched == 0) {
                    count++
                }
            })
        })
        return count
    }
    render() {
        const { tableData } = this.state;
        const { module, metaAction, store, webapi } = this.props;
        let localeModule = ''
        switch (module) {
            case 'stockCg':
                localeModule = 'cg'
                break
            case 'stockXs':
                localeModule = 'xs'
                break
            default:
                localeModule = module
                break
        }
        const columns = [{
            title: '业务性质',
            dataIndex: 'acctName',
            key: 'acctName',
            align: 'center'
        },
        {
            title: '会计科目',
            dataIndex: 'subject',
            key: 'subject',
            align: 'center',
            width: 300,
            render: (text, record, index) => {
                return (
                    <SubjectSelector
                        module={localeModule}
                        metaAction={metaAction}
                        store={store}
                        webapi={webapi}
                        record={record}
                        index={index}
                        apiModule={this.apiModule}
                        onSubjectChange={this.onSubjectChange.bind(this)}>
                    </SubjectSelector>
                )
            },
        },
        {
            title: '设置状态',
            dataIndex: 'isMatched',
            key: 'isMatched',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <div>
                        {
                            text ?
                                <Icon type="check-circle" style={{ color: 'green', fontSize: '18px' }} /> :
                                <Icon type="exclamation-circle" style={{ color: 'red', fontSize: '18px' }} />
                        }
                    </div>
                )
            }
        },
        {
            title: '设置方式',
            dataIndex: 'isAuto',
            key: 'isAuto',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return text ? (
                    <div>自动</div>
                ) : (
                        <div>手动</div>
                    )
            }
        }
        ]
        return (
            <div className="subject-setting">
                <div className='subject-setting-header'>
                    <Row>
                        <Col span={12}>
                            {this.apiModule == 'funds' && <Radio.Group onChange={this.onChange.bind(this)} value={this.state.filter} className='subject-setting-header-filter'>
                                <Radio value={1}>全部（{this.state.allCount}）</Radio>
                                <Radio value={2}>未设置（{this.getNotSettingCount()}）</Radio>
                            </Radio.Group>}
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type='primary' onClick={this.autoMatch.bind(this)}>自动设置</Button>
                        </Col>
                    </Row>
                </div>
                <div className='subject-setting-body' style={{ margin: '16px 0', padding: '0 16px', maxHeight: '500px', overflow: 'auto' }}>
                    {Object.keys(tableData).map(e => {
                        return (
                            <div class='subject-setting-body-section' style={{ marginTop: '16px' }}>
                                {this.apiModule == 'funds' && <h1>
                                    <span>{e}</span>
                                </h1>}
                                <Table columns={columns} dataSource={tableData[e]} bordered pagination={false}></Table>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default SubjectSetting