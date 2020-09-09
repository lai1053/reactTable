import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, Popover, Radio, Select, FormDecorator, Tree } from 'edf-component'
import config from './config'
import extend from './extend'
import { fromJS } from 'immutable'

const RadioGroup = Radio.Group;
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.tabarr = ["1"];
        this.load1()
        this.load2()
        this.load3()
    }

    load1 = async () => {
        const res = await this.webapi.bookkeeping.initKeepAccount({ vatOrEntry: 1 });
        this.injections.reduce('load1', { ...res });
    }
    onBookWayChange = (e) => {
        const bankAccount = this.metaAction.gf('data.bankAccount').toJS();
        const bank = bankAccount.find(o => o.bankAccountTypeId == e.target.value);
        this.metaAction.sf('data.form1.settlement', e.target.value)
        if (bank) {
            this.metaAction.sf('data.form1.bankAccountId', bank.id)
        } else {
            this.metaAction.sf('data.form1.bankAccountId', null)
        }
        // const bank = bankAccount.filter((x) => { return x.bankAccountTypeName == '银行' });
        // const alipay = bankAccount.filter((x) => { return x.bankAccountTypeName == '支付宝' });
        // const wechat = bankAccount.filter((x) => { return x.bankAccountTypeName == '微信' });

      
        // if (e.target.value == '3000050002') {
        //     this.metaAction.sf('data.form1.bankAccountId', bank[0].id)
        // } else if (e.target.value == '3000050003') {
        //     this.metaAction.sf('data.form1.bankAccountId', wechat[0].id)
        // } else if (e.target.value == '3000050004') {
        //     this.metaAction.sf('data.form1.bankAccountId', alipay[0].id)
        // } else {
        //     this.metaAction.sf('data.form1.bankAccountId', null)
        // }

    }
    onBookDateChange = (e) => {
        this.metaAction.sf('data.form1.accountDateSet', e.target.value)
    }
    onAccountChange = (value) => {
        this.metaAction.sf('data.form1.bankAccountId', value)
    }
    renderBookWay = () => {
        const data = this.metaAction.gf('data').toJS();
        const bankAccount = data.bankAccount;
        const settlement = data.form1.settlement;
        const bankAccountId = data.form1.bankAccountId;

        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px'
        };

        const bank = bankAccount.filter((x) => { return x.bankAccountTypeName == '银行' });
        const alipay = bankAccount.filter((x) => { return x.bankAccountTypeName == '支付宝' });
        const wechat = bankAccount.filter((x) => { return x.bankAccountTypeName == '微信' });

        return <RadioGroup onChange={this.onBookWayChange} value={`${settlement}`}>

            <Radio style={radioStyle} value='3000050006'>暂未付款</Radio>
            <Radio style={radioStyle} value='3000050001'>现金</Radio>
            <Radio style={radioStyle} value='3000050010'>冲减预付款</Radio>
            {bank.length > 0 && <Radio style={radioStyle} value='3000050002'>
                银行
            {settlement == '3000050002' ? <Select showSearch={false} style={{ width: '100%', marginLeft: 10, fontSize: '12px' }} onChange={this.onAccountChange.bind(this)} value={bankAccountId}>
                    {bank.map((item, index) => {
                        return <Option value={item.id} key={index}>{item.name}</Option>
                    })}
                </Select> : null}
            </Radio>
            }
            {wechat.length > 0 && <Radio style={radioStyle} value='3000050003'>
                微信
            {settlement == '3000050003' ? <Select showSearch={false} style={{ width: 105, marginLeft: 10, fontSize: '12px' }} onChange={this.onAccountChange.bind(this)} value={bankAccountId}>
                    {wechat.map((item, index) => {
                        return <Option value={item.id} key={index}>{item.name}</Option>
                    })}
                </Select> : null}
            </Radio>}
            {
                alipay.length > 0 && <Radio style={radioStyle} value='3000050004'>
                    支付宝
                {settlement == '3000050004' ? <Select showSearch={false} style={{ width: 105, marginLeft: 10, fontSize: '12px' }} onChange={this.onAccountChange.bind(this)} value={bankAccountId}>
                        {alipay.map((item, index) => {
                            return <Option value={item.id} key={index}>{item.name}</Option>
                        })}
                    </Select> : null}
                </Radio>
            }
        </RadioGroup>
    }
    renderBookDate = () => {
        const bookDate = this.metaAction.gf('data.form1.accountDateSet');
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px'
        };

        return <div style={{ position: 'relative' }}>
            <RadioGroup onChange={this.onBookDateChange} value={bookDate}>
                <Radio style={radioStyle} value={1}>开票日期/认证日期</Radio>
                <Radio style={radioStyle} value={0}>采集发票所在月最后一天</Radio>
            </RadioGroup >
            <Popover
                content={<div style={{ width: 250 }}>开票日期是本月的发票，单据日期默认是发票日期，跨月认证的发票，单据日期默认认证月份的第一天</div>}
                placement='rightTop'
                overlayClassName='collect-set-popover'
            >
                <Icon type='bangzhutishi' fontFamily='edficon' className='collect-set-bangzhutishi'></Icon>
            </Popover>
        </div>
    }
    onOk1 = async () => {
        const params = this.metaAction.gf('data.form1').toJS();
        const res = await this.webapi.bookkeeping.update({ ...params });
        return res;
    }

    load2 = async () => {

        this.metaAction.sf('data.other.loading2', true);
        let res = await this.webapi.handleRule.getMatchingRule();
        // 进项
        let inventory = await this.webapi.handleRule.queryInventory()
        let account = await this.webapi.bookkeeping.accountQuery({ isEnable: true, isEndNode: true });
        account = account.glAccounts.filter(o => o.isEnable === true && o.isEndNode === true);
        let response = { res, inventory, account }

        if (res) {
            res.invoiceInventoryList.forEach((el) => {
                if (el.businessTypeName && !el.name) {
                    el.name = el.businessTypeName
                }
            }
            )
            this.metaAction.sf('data.other.loading2', false)
            this.injections.reduce('load2', response)
        }
    }

    setInventory = (path, value) => {
        this.injections.reduce('upDate', { path, value })
    }
    isNormal = () => {
        if (this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002) {
            return true
        } else {
            return false
        }
    }

    //进项
    onFieldChange = (value, index) => {
        if (!value) {
            this.injections.reduce('upDateSfs', {
                [`data.form2.details.${index}.inventoryId`]: null,
                [`data.form2.details.${index}.name`]: null,
                [`data.form2.details.${index}.businessTypeId`]: null,
                [`data.form2.details.${index}.businessTypeName`]: null
            });
        } else {
            let detail = this.metaAction.gf('data.other.inventory').toJS()
            let inventory = detail.find(item => item.id == value)

            if (inventory.propertyId == 4001001) {
                //费用时
                this.injections.reduce('upDateSfs', {
                    [`data.form2.details.${index}.businessTypeId`]: inventory.id,
                    [`data.form2.details.${index}.businessTypeName`]: inventory.fullName,
                    [`data.form2.details.${index}.inventoryId`]: null,
                    [`data.form2.details.${index}.name`]: inventory.fullName
                });
            } else {
                this.injections.reduce('upDateSfs', {
                    [`data.form2.details.${index}.businessTypeId`]: null,
                    [`data.form2.details.${index}.businessTypeName`]: null,
                    [`data.form2.details.${index}.inventoryId`]: inventory.id,
                    [`data.form2.details.${index}.name`]: inventory.fullName
                });
            }
        }
    }
    onAccountFieldChange = (value, index) => {
        if (!value) {
            this.injections.reduce('upDateSfs', {
                [`data.form2.details.${index}.inventoryRelatedAccountId`]: null,
                [`data.form2.details.${index}.inventoryRelatedAccountName`]: null,
            });
        } else {
            let account = this.metaAction.gf('data.other.account').toJS()
            let item = account.find(item => item.id == value);
            this.injections.reduce('upDateSfs', {
                [`data.form2.details.${index}.inventoryRelatedAccountId`]: item.id,
                [`data.form2.details.${index}.inventoryRelatedAccountName`]: item.codeAndName
            });
        }
    }

    //新增档案
    addRecordClick = async (index) => {

        const ret = await this.metaAction.modal('show', {
            title: '新增存货',
            width: 750,
            children: this.metaAction.loadApp(
                'app-card-inventory', {
                    store: this.component.props.store
                }
            )
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            ret.fullName = ret.fullname;//接口返回有问题
            const inventory = this.metaAction.gf('data.other.inventory').toJS();
            inventory.push(ret);

            this.injections.reduce('upDateSfs', {
                [`data.form2.details.${index}.inventoryId`]: ret.id,
                [`data.form2.details.${index}.name`]: ret.fullname,
                'data.other.inventory': fromJS(inventory)
            })
        }
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
            const account = this.metaAction.gf('data.other.account').toJS();
            account.push(ret);
            this.injections.reduce('upDateSfs', {
                [`data.form2.details.${index}.inventoryRelatedAccountId`]: ret.id,
                [`data.form2.details.${index}.inventoryRelatedAccountName`]: ret.codeAndName,
                'data.other.account': fromJS(account)
            })
        }
    }
    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false

        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
        } if ((parmasName.indexOf('account') != -1)) {
            parmasName = 'account'
        }
        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`),
            value = option.props.value
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }
        if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
            let regExp = new RegExp(inputValue, 'i')
            return paramsValue.get('code').search(regExp) != -1
        }
        let regExp = new RegExp(inputValue, 'i')
        if (paramsValue.get('fullName')) {
            return paramsValue.get('fullName').search(regExp) != -1
                || paramsValue.get('helpCode').search(regExp) != -1
                || paramsValue.get('helpCodeFull').search(regExp) != -1
        }

        if (paramsValue.get('codeAndName')) {
            return paramsValue.get('codeAndName').search(regExp) != -1
                || paramsValue.get('helpCode').search(regExp) != -1
                || paramsValue.get('helpCodeFull').search(regExp) != -1
        }

        // TODO 只支持助记码搜索，简拼
    }

    onOk2 = async () => {
        this.metaAction.sf('data.other.loading2', true)
        let { details: detail, id, ts, supplierAccountSet } = this.metaAction.gf('data.form2').toJS();
        //接口返回数据没有propertyId所以出现bug
        detail.forEach((el) => {
            if (el.businessTypeId) {
                el.name = null
                el.inventoryId = null
            }

            if (el.inventoryId) {
                el.businessTypeName = null
                el.businessTypeId = null
            }
            if (!el.businessTypeId && !el.inventoryId) {
                el.name = null
                el.inventoryId = null
                el.businessTypeName = null
                el.businessTypeId = null
            }
            el.inventoryRelatedAccountId = el.inventoryRelatedAccountId || null;
            el.inventoryRelatedAccountName = el.inventoryRelatedAccountName || null;
        })

        let filter = {
            invoiceInventoryList: detail,
            vatOrEntry: 1,
            achivalRuleDto: {
                supplierAccountSet: supplierAccountSet ? 1 : 0,
                id,
                ts
            }
        }
        let res = await this.webapi.handleRule.updateMatchingRule(filter)
        return res.result;
    }

    load3 = async () => {
        const res = await this.webapi.handleType.queryCollectParam();
        this.injections.reduce('load3', res);
    }
    handleCheckboxChange = (path, value) => {
        this.injections.reduce('upDate', { path, value: value ? 1 : 0 })
    }
    onOk3 = async () => {
        const params = this.metaAction.gf('data.form3').toJS();
        const res = await this.webapi.handleType.saveCollectParam(params);
        return res;
    }
    onOk = async () => {
        let res1 = true, res2 = true, res3 = true
        if (this.tabarr.includes('1')) {
            res1 = await this.onOk1();
        }
        if (this.tabarr.includes('2')) {
            res2 = await this.onOk2();
        }
        if (this.tabarr.includes('3')) {
            res3 = await this.onOk3();
        }
        if (res1 && res2 && res3) {
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败');
            return false
        }
    }
    changeTabs = (activeKey) => {

        if (!this.tabarr.includes(activeKey)) this.tabarr.push(activeKey)

    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret

}