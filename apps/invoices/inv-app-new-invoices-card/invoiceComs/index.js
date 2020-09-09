import React, { PureComponent } from "react"

import GroupInfo from './groupInfo'
import CommonInfo from './commonInfo'


export default class InvoiceComs extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            purchaseNsrxbh: '',
            name2: '',
            purchaseNsrxbh2: '',
            xsName: '',
            xsNsrxbh: '',
            xsName2: '',
            xsNsrxbh2: '',

            jxfs: '',
            bz: '',
            zf: '',
            kpr: '',
            je: '',
            cllx: false
        }
        if (props.setOkListener) {
            props.setOkListener(:: this.onOk)
        }
    }

    onOk() {
        this.ref.validateFieldsAndScroll((err, values) => {
            console.log('err', err)
            console.log('values', values)
        });

        this.commonRef.validateFieldsAndScroll((err, values) => {
            console.log('commonRefErr', err)
            console.log('commonRefvalues', values)
        });
        return false
    }
    nameChange(e) {
        console.log('nameChange', e)
    }

    getGroupData() {
        const { name, purchaseNsrxbh, name2, purchaseNsrxbh2, xsName, xsNsrxbh, xsName2, xsNsrxbh2 } = this.state
        return [{
            title: '购买方',
            subItem: [
                {
                    key: 'name',
                    value: name,
                    label: '名称',
                    required: true,

                },
                {
                    key: 'purchaseNsrxbh',
                    label: '纳税人识别号',
                    value: purchaseNsrxbh,

                }, {
                    key: 'name2',
                    label: '名称',
                    required: true,
                    value: name2,
                    onChange: (e) => {
                        console.log(e)
                    }

                },
                {
                    key: 'purchaseNsrxbh2',
                    label: '身份证/机构码/购方识别号',
                    required: true,
                    value: purchaseNsrxbh2,


                }
            ]
        }, {
            title: '销售方',
            subItem: [
                {
                    key: 'xsName',
                    label: '名称',
                    required: true,
                    value: xsName,


                },
                {
                    key: 'xsNsrxbh',
                    label: '纳税人识别号',
                    required: true,
                    value: xsNsrxbh,

                },
                {
                    key: 'xsName2',
                    label: '名称',
                    value: xsName2,

                },
                {
                    key: 'xsNsrxbh2',
                    label: '纳税人识别号',
                    required: true,
                    value: xsNsrxbh2,
                    adjustHeight: true
                },
            ]
        }]
    }


    getCommonData() {
        const { jxfs, bz, zf, kpr, je, cllx } = this.state
        const jsfsOptions = [
            {
                value: 1,
                name: '1111'
            }, {
                value: 2,
                name: '2222'
            }
        ]

        return [
            [{
                key: 'jsfs',
                value: jxfs,
                label: '计税方式',
                required: true,
                type: 'select',
                labelWidth: '10%',
                controlWidth: '20%',
                option: jsfsOptions
            }, {
                key: 'bz',
                value: bz,
                label: '备注',
                labelWidth: '10%',
                type: 'input',
            }],
            [
                {
                    key: 'kpr',
                    value: kpr,
                    label: '开票人',
                    required: true,
                    type: 'input',
                    labelWidth: '20%',
                }, {
                    key: 'cllx',
                    value: cllx,
                    required: true,
                    label: '认证状态',
                    labelWidth: '10%',
                    type: 'checkbox',
                    checkBoxLabel:'已认证'
                },
                {
                    key: 'je',
                    value: je,
                    label: '金额',
                    labelWidth: '10%',
                    type: 'input',
                    normalize: (value, prevValue, allValues) => {
                        if (value == "") {
                            return value;
                        }
                        if (String(value).match(/^[0-9||.]*$/)) {
                            return value;
                        } else {
                            return prevValue;
                        }
                    },
                }
            ]
        ]


    }
    render() {
        return (
            <div>
                <GroupInfo ref={ref => this.ref = ref} data={this.getGroupData()} extendable></GroupInfo>
                <CommonInfo ref={ref => this.commonRef = ref} data={this.getCommonData()} ></CommonInfo>
            </div>
        )
    }
}
