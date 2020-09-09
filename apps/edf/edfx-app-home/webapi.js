import { fetch } from 'edf-utils'

export default {
    desktop: {
        initApp: (option) => fetch.post('/v1/edf/desktopapp/initApp'),
        initAppData: (option) => fetch.post('/v1/edf/desktopapp/initAppData',option),
		saveAppList: (option) => fetch.post('/v1/edf/desktopapp/updateByDragAndClose', option)
    }
}