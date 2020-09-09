export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-yyhome-function-introduction',
        children:'{{$renderIntroductionChildren()}}'
    }
}

export function getInitState() {
    return {
        data:{

        }
    }
}