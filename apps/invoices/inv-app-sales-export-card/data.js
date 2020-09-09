export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-sales-export-card',
        children: [{
            name: 'radio',
            component: 'Radio.Group',
            className: 'radio-group',
            value: '{{data.typeAction}}',
            onChange: "{{function(e){$sf('data.typeAction',e.target.value)}}}",
            children: [{
                name: 'item1',
                component: 'Radio',
                value: 1,
                children: '导出明细发票数据(一条明细一条记录)',
                className: 'radio'
            }, {
                name: 'item2',
                component: 'Radio',
                value: 2,
                children: '导出汇总发票数据(一张发票一条记录)',
                className: 'radio'
            }]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            typeAction: 1,
        }
    }
}