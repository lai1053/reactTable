import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, Popover, Radio, Select, FormDecorator, Tree, Button } from 'edf-component'
import config from './config'
import { fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {

        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.tabarr = ["1"];
        this.load()
    }

    load = async () => {
        const res = await this.webapi.accountQuery({ isEnable: true });
        const { inventoryNameSet, invAccountList = [], vatOrEntry, isHideUnit } = this.component.props;
        this.metaAction.sfs({
            'data.inventoryNameSet': inventoryNameSet,
            'data.invAccountList': fromJS(invAccountList),
            'data.inventoryAccount': fromJS(res.glAccounts),
            'data.vatOrEntry': vatOrEntry,
            'data.isHideUnit': isHideUnit
        });
        setTimeout(() => {
            this.onResize()
        }, 20)
    }


    // 新增科目
    addSubjects = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            const inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();
            inventoryAccount.push(ret);
            this.metaAction.sfs({
                [`data.invAccountList.${index}.accountId`]: ret.id,
                'data.inventoryAccount': fromJS(inventoryAccount),
            })
        }
    }

    //支持搜索
    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false;

        const paramsValues = this.metaAction.gf(`data.inventoryAccount`);
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }

        let regExp = new RegExp(inputValue, 'i')
        if (paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('fullname') && paramsValue.get('fullname').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('codeAndName') && paramsValue.get('codeAndName').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1) {
            return true
        }

        return false;
    }

    onOk = async () => {
        const inventoryNameSet = this.metaAction.gf('data.inventoryNameSet');
        const invAccountList = this.metaAction.gf('data.invAccountList').toJS();
        const isHideUnit = this.metaAction.gf('data.isHideUnit');
        const isArrival = this.component.props.vatOrEntry ? true : false
        this.metaAction.sf('data.loading2', true)
        const res = await this.webapi.getInvoiceInvSave({
            inventoryNameSet,
            invAccountList,
            isHideUnit,
            isArrival
        })
        this.metaAction.sf('data.loading2', false)
        if (res) {
            return res;
        }
        else {
            return false
        }
    }

    //自动生成存货规则
    handleOnChangeSetType = (e) => {
        const value = e.target.value;
        this.metaAction.sf('data.inventoryNameSet', value);
    }

    //页签切换
    changeTabs = (activeKey) => {
        if (!this.tabarr.includes(activeKey)) this.tabarr.push(activeKey)

    }

    //渲染table列
    renderColumns = () => {
        const inventoryAccount = this.metaAction.gf('data.inventoryAccount').toJS();
        return [
            {
                title: '影响因素',
                key: 'kpfs',
                children: [
                    {
                        title: '存货及服务分类',
                        dataIndex: 'influenceName',
                        width: 102,
                        className: 'table_td_align_right',
                        key: 'influenceName'
                    }
                ]
            },
            {
                title: '对应科目',
                className: 'table_td_align_right',
                dataIndex: 'accountId',
                width: 102,
                key: 'accountId',
                render: (text, record, index) => {
                    return <Select
                        value={text}
                        allowClear={true}
                        onChange={(v) => this.handleChangeInventory(v, index)}
                        className={text ? '' : 'has-error'}
                        dropdownMatchSelectWidth={false}
                        dropdownStyle={{ width: '331px' }}
                        filterOption={this.filterOption}
                        dropdownFooter={
                            <Button
                                type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={() => this.addSubjects(index)}
                            >
                                新增
                </Button>
                        }
                    >
                        {
                            inventoryAccount.map((o, index) => {
                                return <Option key={index} value={o.id}>{o.codeAndName}</Option>
                            })
                        }
                    </Select>
                }
            }
        ];
    }
    handleChangeInventory = (v, index) => {
        v = v || null;
        this.metaAction.sf(`data.invAccountList.${index}.accountId`, v);
    }

    componentDidMount = () => {
        this.onResize()
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }

    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS();
            let tableWrapperDom = document.getElementsByClassName('ttk-scm-inventory-account-set-table-wrapper')[0];
            //tableWrapperDom=ant-table-wrapper包含整个table,table的高度基于这个dom,className保证唯一性

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        y: height - theadDom.offsetHeight,
                        x: width - 20
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: width - 20
                    })
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

    hideUitOnChange = (e) => {
        this.metaAction.sf('data.isHideUnit', e.target.checked)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),

        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret

}