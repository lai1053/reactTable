export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-yyhome-no-disk-authentication',
        children:'{{$renderAuthenticationChildren()}}'
    }
}

export function getInitState() {
    return {
        data:{

        }
    }
}