import { List, Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

const DEFAULT_COL_COUNT = 3

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, option) => {
    	state = this.metaReducer.sf(state, 'data.other.value', fromJS(option))
      	return state
    }

  	initTemplate = (state, allTemplates) => {
  	    let templateGrid = List(),
  	        i = 0,
  	        templateGridRow

  	    //把服务端返回的list, 转换成为每行四列的格式
  	    for (let template of allTemplates) {
  	        if (i == 0) {
  	            templateGridRow = Map()
  	        }
  	        templateGridRow = templateGridRow.set('col' + i, template)

  	        if ((i + 1) % DEFAULT_COL_COUNT == 0) {
  	            templateGrid = templateGrid.push(templateGridRow)
  	            templateGridRow = undefined
  	            i = 0
  	        } else {
  	            i++
  	        }
  	    }
  	    if (templateGridRow) {
  	        templateGrid = templateGrid.push(templateGridRow)
  	    }

  	    state = this.metaReducer.sf(state, 'data.other.templateDataSource', allTemplates)
  	    return this.metaReducer.sf(state, 'data.templateList', templateGrid)
  	}

  	//编辑模板名称 + 编码后,刷界面
  	modifyTemplate = (state, editResult) => {
        let templateDataSource = this.metaReducer.gf(state, 'data.other.value')
  	    for (let i = 0; i < templateDataSource.size; i++) {
  	        let item = templateDataSource.get(i)
  	        if (item.get('docTemplateId') == editResult.get('docTemplateId')) {
  	            item = item.set('docTemplateName', editResult.get('docTemplateName'))
  	            item = item.set('docTemplateCode', editResult.get('docTemplateCode'))

  	            state = this.metaReducer.sf(state, 'data.other.value', templateDataSource.set(i, item))
  	            break
  	        }
  	    }

  			return state
  	}

  	//删除模板
  	deleteTemplate = (state, delTemplate) => {
  	    let templateDataSource = this.metaReducer.gf(state, 'data.other.value')
  	    templateDataSource = templateDataSource.filter(item => item.get('docTemplateId') != delTemplate.docTemplateId)
  	    return this.load(state, templateDataSource)
  	}

  	//选中模板,保存选中项
  	selectTemplate = (state, path, template) => {
  	    let templateDataSource = this.metaReducer.gf(state, 'data.other.templateDataSource')
  	    for (let i = 0; i < templateDataSource.size; i++) {
  	        templateDataSource = templateDataSource.update(i, item => item.set('selectedTemplateId', template.get('docTemplateId')))
  	    }

  	    state = this.initTemplate(state, templateDataSource)
  	    return this.metaReducer.sf(state, 'data.other.selectedTemplate', template)
  	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
