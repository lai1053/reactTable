export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        // className: 'ttk-stock-app-inventory-select',
        // key: '{{"ttk-stock-app-inventory-select-layout"+(new Date().getTime())}}',
        className: 'ttk-stock-app-inventory-select',
        children: [{
            name: 'input',
            component: '::div',
            className: 'input',
            children:[
                {
                    name: 'input',
                    component: 'Select',
                    showSearch: true,
                    dropdownMatchSelectWidth:false,
                    dropdownStyle:{
                        width: '500px'
                    },
                    filterOption: '{{$filterIndustry}}',
                    value: '{{data.value}}',
                    onSelect: "{{function(e){$selectOption(e)}}}",
                    children: '{{$getSelectOption()}}'
                },
                {
                    name: 'btn',
                    component: '::span',
                    className: 'btn',
                    children: '...',
                    disabled: '{{data.disabled}}',
                    onClick: '{{$btnClick}}',
                }
            ],
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
            value: '222',
            init: true,
            error: true,
            errorMsg: '不能为空',
            disabled: false,
        }
    }
}