export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-batch-update-card',
        children: [{
            name: 'type-action',
            component: 'Radio.Group',
            className: 'radio-group',
            _visible: false,
            value: '{{data.typeAction}}',
            onChange: "{{function(e){$sf('data.typeAction',e.target.value)}}}",
            children: [{
                name: 'item1',
                component: 'Radio',
                value: 1,
                children: '一般纳税人',
                className: 'radio'
            }, {
                name: 'item2',
                component: 'Radio',
                value: 2,
                children: '小规模',
                className: 'radio'
            }]
        }, {
            name: 'tab1',
            component: '::div',
            className: 'tab',
            _visible: '{{data.typeAction ===1}}',
            children: [
               
                {
                name: 'row3',
                component: '::div',
                className: 'row',
                children: {
                    name: 'checkbox',
                    component: 'Checkbox',
                    className: 'cbx',
                    children: '计税方式',
                    checked: '{{data.taxWay}}',
                    disabled: '{{data.taxWayDisable}}',
                    onChange: "{{function(e){$handerTaxWay(e.target.checked)}}}",
                }
            },
                {
                name: 'row4',
                component: '::div',
                className: 'row son',
                children: {
                    name: 'type-action',
                    component: 'Radio.Group',
                    className: 'radio-group',
                    value: '{{data.taxWay?data.taxWayRadio:null}}',
                    disabled: '{{!data.taxWay}}',
                    onChange: "{{function(e){$handerTaxWayRadio(e.target.value)}}}",
                    children: [{
                        name: 'item1',
                        component: 'Radio',
                        value: '0',
                        children: '一般计税',
                        _visible: '{{data.generalTaxation}}',
                        className: 'radio'
                    }, {
                        name: 'item2',
                        component: 'Radio',
                        value: '1',
                        children: '简易征收',
                        _visible: '{{data.simpleExpropriation}}',
                        className: 'radio'
                    }, {
                        name: 'item3',
                        component: 'Radio',
                        value: '2',
                        children: '免抵退',
                        _visible: '{{data.offsetFree}}',
                        className: 'radio'
                    }, {
                        name: 'item4',
                        component: 'Radio',
                        value: '3',
                        children: '免税',
                        _visible: '{{data.dutyFree}}',
                        className: 'radio'
                    }]
                }
            },
                {
                name: 'row5',
                component: '::div',
                className: 'row son',
                children: [{
                    name: 'col1',
                    component: '::span',
                    className: 'lable',
                    children: '温馨提示：'
                }, {
                    name: 'col2',
                    component: '::span',
                    className: 'tips',
                    children: '如同一张发票中有多种计税方式，请打开发票手工修改'
                }]
            },
                {
                name: 'row6',
                component: '::div',
                className: 'row',
                children: {
                    name: 'checkbox',
                    component: 'Checkbox',
                    className: 'cbx',
                    children: '货物类型',
                    checked: '{{data.cargoType}}',
                    onChange: "{{function(e){$handerImmediateWithdrawalOrCargoType(e.target.checked,2)}}}",
                    // onChange: "{{function(e){$sf('data.cargoType',e.target.checked)}}}",
                }
            },
                {
                name: 'row7',
                component: '::div',
                className: 'row son',
                children: {
                    name: 'goods-type',
                    component: 'Radio.Group',
                    className: 'radio-group',
                    value: '{{data.cargoType?data.cargoTypeRadio:null}}',
                    disabled: '{{!data.cargoType}}',
                    onChange: "{{function(e){$sf('data.cargoTypeRadio',e.target.value)}}}",
                    children: [{
                        name: 'item1',
                        component: 'Radio',
                        value: '0004',
                        children: '货物',
                        className: 'radio'
                    }, {
                        name: 'item2',
                        component: 'Radio',
                        value: '0001',
                        children: '劳务',
                        className: 'radio'
                    }, {
                        name: 'item3',
                        component: 'Radio',
                        value: '0002',
                        children: '服务',
                        className: 'radio'
                    }, {
                        name: 'item4',
                        component: 'Radio',
                        value: '0005',
                        children: '无形资产',
                        className: 'radio'
                    }, {
                        name: 'item5',
                        component: 'Radio',
                        value: '0003',
                        children: '不动产',
                        className: 'radio'
                    }]
                }
            },
                {
                    name: 'row1',
                    component: '::div',
                    className: 'row line',
                    children: {
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'cbx',
                        children: '即征即退标识',
                        checked: '{{data.immediateWithdrawal}}',
                        onChange: "{{function(e){$handerImmediateWithdrawalOrCargoType(e.target.checked,1)}}}",
                    }
                },
                {
                    name: 'row2',
                    component: '::div',
                    className: 'row son',
                    children: [{
                        name: 'type-action',
                        component: 'Radio.Group',
                        className: 'radio-group',
                        value: '{{data.immediateWithdrawal?data.immediateWithdrawalRadio:null}}',
                        disabled: '{{!data.immediateWithdrawal}}',
                        onChange: "{{function(e){$sf('data.immediateWithdrawalRadio',e.target.value)}}}",
                        children: [{
                            name: 'item1',
                            component: 'Radio',
                            value: 'Y',
                            children: '是',
                            className: 'radio'
                        }, {
                            name: 'item2',
                            component: 'Radio',
                            value: 'N',
                            children: '否',
                            className: 'radio'
                        }]
                    }]
                },
            ]
        },
            {
            name: 'tab2',
            component: '::div',
            className: 'tab',
            _visible: '{{data.typeAction ===2}}',
            children: [
                {
                name: 'row3',
                component: '::div',
                className: 'row',
                children: {
                    name: 'checkbox',
                    component: 'Checkbox',
                    className: 'cbx',
                    children: '计税方式',
                    checked: '{{data.taxWaySmall}}',
                    disabled: '{{data.taxWaySmallDisable}}',
                    onChange: "{{function(e){$handerTaxWaySmall(e.target.checked)}}}",
                }
            },
                {
                name: 'row4',
                component: '::div',
                className: 'row son',
                children: {
                    name: 'type-action',
                    component: 'Radio.Group',
                    className: 'radio-group',
                    value: '{{data.taxWaySmall?data.taxWaySmallRadio:null}}',
                    disabled: '{{!data.taxWaySmall}}',
                    onChange: "{{function(e){$sf('data.taxWaySmallRadio',e.target.value)}}}",
                    children: [{
                        name: 'item2',
                        component: 'Radio',
                        value: '1',
                        children: '简易征收',
                        className: 'radio'
                    }, {
                        name: 'item4',
                        component: 'Radio',
                        value: '3',
                        children: '免税',
                        _visible: '{{data.dutyFreeSmall}}',
                        className: 'radio'
                    }]
                }
            },
                {
                name: 'row5',
                component: '::div',
                className: 'row son',
                children: [{
                    name: 'col1',
                    component: '::span',
                    className: 'lable',
                    children: '温馨提示：'
                }, {
                    name: 'col2',
                    component: '::span',
                    className: 'tips',
                    children: '如同一张发票中有多种计税方式，请打开发票手工修改'
                }]
            },
                {
                name: 'row6',
                component: '::div',
                className: 'row',
                children: {
                    name: 'checkbox',
                    component: 'Checkbox',
                    className: 'cbx',
                    children: '货物类型',
                    checked: '{{data.cargoTypeSmall}}',
                    onChange: "{{function(e){$test(e.target.checked)}}}",
                }
            },
                {
                name: 'row7',
                component: '::div',
                className: 'row son',
                children: {
                    name: 'goods-type',
                    component: 'Radio.Group',
                    className: 'radio-group',
                    value: '{{data.cargoTypeSmall?data.cargoTypeSmallRadio:null}}',
                    disabled: '{{!data.cargoTypeSmall}}',
                    onChange: "{{function(e){$sf('data.cargoTypeSmallRadio',e.target.value)}}}",
                    children: [{
                        name: 'item1',
                        component: 'Radio',
                        value: '0004',
                        children: '货物',
                        className: 'radio'
                    }, {
                        name: 'item2',
                        component: 'Radio',
                        value: '0001',
                        children: '劳务',
                        className: 'radio'
                    }, {
                        name: 'item3',
                        component: 'Radio',
                        value: '0002',
                        children: '服务',
                        className: 'radio'
                    }, {
                        name: 'item4',
                        component: 'Radio',
                        value: '0005',
                        children: '无形资产',
                        className: 'radio'
                    }, {
                        name: 'item5',
                        component: 'Radio',
                        value: '0003',
                        children: '不动产',
                        className: 'radio'
                    }]
                }
            },
                {
                    name: 'row1',
                    component: '::div',
                    className: 'row line',
                    children: {
                        name: 'checkbox',
                        component: 'Checkbox',
                        className: 'cbx',
                        children: '即征即退标识',
                        checked: '{{data.immediateWithdrawal}}',
                        onChange: "{{function(e){$handerImmediateWithdrawalOrCargoType(e.target.checked,1)}}}",
                    }
                },
                {
                    name: 'row2',
                    component: '::div',
                    className: 'row son',
                    children: [{
                        name: 'type-action',
                        component: 'Radio.Group',
                        className: 'radio-group',
                        value: '{{data.immediateWithdrawal?data.immediateWithdrawalRadio:null}}',
                        disabled: '{{!data.immediateWithdrawal}}',
                        onChange: "{{function(e){$sf('data.immediateWithdrawalRadio',e.target.value)}}}",
                        children: [{
                            name: 'item1',
                            component: 'Radio',
                            value: 'Y',
                            children: '是',
                            className: 'radio'
                        }, {
                            name: 'item2',
                            component: 'Radio',
                            value: 'N',
                            children: '否',
                            className: 'radio'
                        }]
                    }]
                },
            ]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            typeAction: 1, //1:一般纳税人，2:小规模
            // immediateWithdrawal: null, //即征即退
            // immediateWithdrawalRadio: 'Y',
            // taxWay: null, //计税方式
            // taxWayRadio: '0',
            // cargoType: null, //货物类型
            // cargoTypeRadio: '0004',
            // taxWaySmall: null, //计税方式-小规模
            // taxWaySmallRadio: '1',
            // cargoTypeSmall: null, //货物类型－小规模
            // cargoTypeSmallRadio: '0004',
            // generalTaxation: true, //一般计税
            // simpleExpropriation: true, //简易征收
            // offsetFree: true, //免抵退
            // dutyFree: true, //免税
            // dutyFreeSmall: true, //免税－小规模
        }
    }
}