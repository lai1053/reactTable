export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        // className: 'inv-app-product-select',
        className: '{{$getLayoutClass()}}',
        children: [{
            name: 'input',
            component: 'Input',
            type: 'text',
            className: 'input',
            // onBlur: '{{$onBlur}}',
            // autoFocus: true,
            disabled: '{{data.disabled}}',
            value: '{{data.value}}',
            onChange: '{{$onChange}}',
            addonAfter: {
                name: 'btn',
                component: '::span',
                className: 'btn',
                children: '...',
                disabled: '{{data.disabled}}',
                onClick: '{{$btnClick}}',
            }
        }, {
            name: 'div',
            component: '::div',
            children: '{{$renderModal()}}',
            _visible: '{{data.visible}}'
        }]
    }
}

export function getInitState() {
    return {
        data: {
            spbmList: [],
            spbmFilterList: [],
            selectedRowKeys: [],
            visible: false,
            value: '',
            init: true,
            error: true,
            errorMsg: '不能为空',
            disabled: false,
        }
    }
}