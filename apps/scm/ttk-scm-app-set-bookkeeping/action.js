import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Radio, Select } from 'edf-component'
import { fromJS, toJS } from 'immutable'
import config from './config'
const RadioGroup = Radio.Group;
const Option = Select.Option;
class action {
    constructor(option) {
        this.metaAction = option.metaAction
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
        this.load()
    }
    load = async () => {
        const res = await this.webapi.initKeepAccount({ vatOrEntry: 0 });
        this.injections.reduce('load', { ...res });
    }
    onBookWayChange = (e) => {
        const bankAccount = this.metaAction.gf('data.bankAccount').toJS();

        this.metaAction.sf('data.form.settlement', e.target.value);
        const bank = bankAccount.find(x => x.bankAccountTypeId == e.target.value);
        if (bank) {
            this.metaAction.sf('data.form.bankAccountId', bank.id)
        } else {
            this.metaAction.sf('data.form.bankAccountId', null)
        }

        // if (e.target.value == '3000050002') {
        //     const bank = bankAccount.filter((x) => { return x.bankAccountTypeName == '银行' });
        //     this.metaAction.sf('data.form.bankAccountId', bank[0].id)
        // } else if (e.target.value == '3000050003') {
        //     const wechat = bankAccount.filter((x) => { return x.bankAccountTypeName == '微信' });
        //     this.metaAction.sf('data.form.bankAccountId', wechat[0].id)
        // } else if (e.target.value == '3000050004') {
        //     const alipay = bankAccount.filter((x) => { return x.bankAccountTypeName == '支付宝' });
        //     this.metaAction.sf('data.form.bankAccountId', alipay[0].id)
        // } else if (e.target.value == '3000050009') {
        //     const impose= bankAccount.filter((x) => { return x.bankAccountTypeName == '支付宝' });
        //     this.metaAction.sf('data.form.bankAccountId', 9)
        // } else {
        //     this.metaAction.sf('data.form.bankAccountId', null)
        // }

    }
    onBookDateChange = (e) => {
        this.metaAction.sf('data.form.accountDateSet', e.target.value)
    }
    onAccountChange = (value) => {
        this.metaAction.sf('data.form.bankAccountId', value)
    }
    renderBookWay = () => {
        const data = this.metaAction.gf('data').toJS();
        const bankAccount = data.bankAccount;
        const settlement = data.form.settlement;
        const bankAccountId = data.form.bankAccountId

        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px',
            marginRight: '0px'
        };

        const bank = bankAccount.filter((x) => { return x.bankAccountTypeName == '银行' });
        const alipay = bankAccount.filter((x) => { return x.bankAccountTypeName == '支付宝' });
        const wechat = bankAccount.filter((x) => { return x.bankAccountTypeName == '微信' });

        return <RadioGroup
            onChange={this.onBookWayChange}
            value={`${settlement}`}
        >
            <Radio style={radioStyle} value='3000050006'>暂未收款</Radio>
            <Radio style={radioStyle} value='3000050001'>现金</Radio>
            <Radio style={radioStyle} value='3000050009'>冲减预收款</Radio>
            {bank.length > 0 && <div style={{ display: 'flex' }}>
                <Radio style={radioStyle} value='3000050002'>
                    银行
                </Radio>
                {settlement == '3000050002' ?
                    <Select showSearch={false} style={{ width: 181, marginLeft: 10, fontSize: '12px' }}
                        onChange={this.onAccountChange.bind(this)}
                        value={bankAccountId}>
                        {bank.map((item, index) => {
                            return <Option value={item.id} key={index}>{item.name}</Option>
                        })}
                    </Select>
                    : null}
            </div>
            }

            {wechat.length > 0 && <div style={{ display: 'flex' }}>
                <Radio style={radioStyle} value='3000050003'>
                    微信
                </Radio>
                {settlement == '3000050003' ? <Select showSearch={false} style={{ width: 181, marginLeft: 10, fontSize: '12px' }} onChange={this.onAccountChange.bind(this)} value={bankAccountId}>
                    {wechat.map((item, index) => {
                        return <Option value={item.id} key={index}>{item.name}</Option>
                    })}
                </Select> : null}
            </div>}

            {
                alipay.length > 0 && <div style={{ display: 'flex' }}>
                    <Radio style={radioStyle} value='3000050004'>
                        支付宝
                    </Radio>
                    {settlement == '3000050004' ? <Select showSearch={false} style={{ width: 169, marginLeft: 10, fontSize: '12px' }} onChange={this.onAccountChange.bind(this)} value={bankAccountId}>
                        {alipay.map((item, index) => {
                            return <Option value={item.id} key={index}>{item.name}</Option>
                        })}
                    </Select> : null}
                </div>
            }
        </RadioGroup>

    }
    renderBookDate = () => {
        const bookDate = this.metaAction.gf('data.form.accountDateSet');
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px'
        };

        return <RadioGroup onChange={this.onBookDateChange} value={bookDate}>
            <Radio style={radioStyle} value={1}>发票日期</Radio>
            <Radio style={radioStyle} value={0}>发票日期所在月最后一天</Radio>
        </RadioGroup >

    }
    onOk = async () => {
        const params = this.metaAction.gf('data.form').toJS();
        const res = await this.webapi.update({ ...params });
        return res;
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

