export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-ledger-list',
        children: '{{$renderChildren()}}',
    }
}

export function getInitState() {
    return {
        data: {
            content: '发票采集、认证页面临时入口',
            version: 'v0.0.1',
            selectedRowKeys: [],
        }
    }
}