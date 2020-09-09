export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-select-product',
        children: {
            name: 'div',
            component: '::div',
            children: '{{$renderModal()}}',
        }
    }
}

export function getInitState() {
    return {
        data: {
            spbmList: [],
            spbmFilterList: [],
            selectedRowKeys: [],
            value: '',
            init: true,
            error: true,
            errorMsg: '不能为空',
            disabled: false,
            loading: false,
        }
    }
}