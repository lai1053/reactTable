export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'inv-app-single-custom-list',
        children: {
            name: 'currentApp',
            component: 'AppLoader',
            appName: '{{data.currentAppName}}',
        }
    }
}

export function getInitState() {
    return {
        data: {
            currentAppName: ''
        }
    }
}