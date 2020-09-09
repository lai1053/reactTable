// import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-financeinit-success',
        children: [{
            name: 'content',
            component: '::div',
            className: 'ttk-gl-app-financeinit-success-content',
            children: [{
                    name: 'container',
                    component: '::div',
                    className: 'bgImgContainer',
                    children: {
                        name: 'success',
                        component: 'Icon',
                        fontFamily: 'edficon',
                        className: 'success',
                        type: 'chenggongtishi',
                    }
                },{
                    component: '::div',
                    className: 'ttk-gl-app-financeinit-success-content-tips',
                    children: '恭喜您，初始化成功！'
                }
                ,{
                    component: 'Button',
                    children: '确定',
                    type: 'primary',
                    className:'btn',
                    onClick: '{{$close}}'
                }

            ]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            other: {
            }
        }
    }
}