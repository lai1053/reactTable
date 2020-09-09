export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-es-app-card-department',
        children: [{
            name: 'sjbmmc',
            component: 'Form.Item',
            label: '上级部门',
            required: true,
            _visible:'{{data.other.listsjbm1}}',
            help: '{{data.other.error.sjbmmc}}',
            children: [{
                name: 'sjbmmc',
                component: 'Input',
                disabled:true,
                value: '{{data.form.sjbmmc}}'
            }]
          },
          {
                name: 'sjbmmctree',
                component: 'Form.Item',
                label: '上级部门',
                required: true,
                _visible:'{{data.other.listsjbm2}}',
                children: [{
                    name: 'sjbmmctree',
                    component: 'TreeSelect',
                    style:{ width: '200px' },
                    disabled:true,
                    placeholder:'请选择要调入的部门',
                    //onChange:"{{$handleChange(e)}}",
                    value:'{{data.other.selectDepart}}',
                    onChange:"{{function(e){$handleChange(e)}}}",
                    children:"{{$renderTreeSelectNodes(data.other.tree)}}"
                }]
            },
            {
            name: 'nameItem',
            component: 'Form.Item',
            label: '部门名称',
            required: true,
            validateStatus: "{{data.other.error.name?'error':'success'}}",
            help: '{{data.other.error.name}}',
            children: [{
                name: 'name',
                component: 'Input',
                // maxlength: '100',
                value: '{{data.form.name}}',
                onChange: `{{function(e){$sf('data.form.name',e.target.value);$changeCheck()}}}`,
            }]
         }
      ]
    }
}

export function getInitState() {
    return {
        data: {
            form: {
                sjbmmc:'',
                name: ''
            },
            other: {
                error: {},
                listsjbm1:true,
                listsjbm2:false,
                selectDepart: undefined,
				tree: []
            }
        }
    }
}
