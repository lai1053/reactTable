import React from "react"
// import { findDOMNode } from 'react-dom';
import { Divider, Button, Form, Select, Icon, Tooltip } from "antd"
// import { Select } from 'edf-component';
const Option = Select.Option
const formItemLayout = {
    labelCol: {
        xs: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 16 }
    }
}
const initAssistForm = props => {
    if (props.item && props.item.assistList) {
        let obj = {}
        props.item.assistList.forEach(item => {
            let key =
                item.type && item.type.replace("calc", "").toLocaleLowerCase()
            if (key) obj[key] = (item.id && String(item.id)) || undefined
        })
        return obj
    }
    return {}
}
/**
 * 选择辅助核算项目
 * item：科目信息，必传项
 * store：必传项
 * module: 模块 ，非必传 默认bomvs
 * metaAction：必传项
 * webapi：必传项
 * subjectName：新增客户辅助核算时，需传入的科目名称
 * isNeedQuerySubject：是否需要查询科目，选填
 * disabledInventory：警用存货，选填
 */
class SelectAssist extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            formItems: [],
            labelOption: {
                customer: "客户",
                supplier: "供应商",
                project: "项目",
                department: "部门",
                person: "人员",
                inventory: "存货",
                excalc1: "",
                excalc2: "",
                excalc3: "",
                excalc4: "",
                excalc5: "",
                excalc6: "",
                excalc7: "",
                excalc8: "",
                excalc9: "",
                excalc10: ""
            },
            archives: {
                customer: [],
                supplier: [],
                project: [],
                department: [],
                person: [],
                inventory: [],
                excalc1: [],
                excalc2: [],
                excalc3: [],
                excalc4: [],
                excalc5: [],
                excalc6: [],
                excalc7: [],
                excalc8: [],
                excalc9: [],
                excalc10: []
            },
            form: {},
            modalsWidth: {
                customer: 700,
                vendor: 700,
                project: 400,
                department: 400,
                person: 720,
                inventory: 800,
                userdefinecard: 400
            }
        }
        this.module = props.module || "bovms"
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        props.setOkListener && props.setOkListener(this.handleSubmit)
    }

    handleSubmit = e => {
        if (e && e.persist) e.persist()
        let selectedValues
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                selectedValues = values
            }
        })
        if (selectedValues) {
            const { archives } = this.state
            let result = []
            Object.keys(selectedValues).forEach(key => {
                if (archives[key]) {
                    const item = archives[key].find(
                        f => String(f.id) === selectedValues[key]
                    )
                    // 添加辅助类型
                    const archivesType =
                        key.indexOf("excalc") > -1
                            ? key.replace("excalc", "exCalc")
                            : `calc${key
                                .substr(0, 1)
                                .toLocaleUpperCase()}${key.slice(1)}`
                    result.push({ ...item, archivesType })
                }
            })
            result = result.map(m => ({
                id: m.id,
                name: String(m.name).replace(/\"/g, '\\"'),
                type: m.archivesType
            }))
            return { assistList: result }
        }
        return false
    }
    onAdd = async field => {
        const { labelOption, archives, form, modalsWidth } = this.state,
            appParam = {
                store: this.props.store
            }
        let appName = field
        if (field.indexOf("excalc") > -1) {
            appName = "userdefinecard"
            appParam.activeKey = labelOption[field]
        }
        if (field === "supplier") {
            appName = "vendor"
        }
        if (appName === "inventory") {
            const retInventory = await this.metaAction.modal("show", {
                title: "新增存货档案",
                wrapClassName: "card-archive",
                style: { top: 5 },
                width: 700,
                height: 520,
                footer: "",
                closeModal: this.close,
                closeBack: back => {
                    this.closeTip = back
                },
                children: this.metaAction.loadApp("ttk-app-inventory-card", {
                    store: this.props.store,
                    initData: null,
                    moduleYW: {
                        invenName: undefined, //rowData.goodsName,
                        invenSpecification: undefined //rowData.specification,
                    }
                })
            })
            return
        }
        if (appName === "customer") {
            appParam.formName = this.props.subjectName
        }
        const ret = await this.metaAction.modal("show", {
            title: "新增" + labelOption[field],
            style: { top: 5 },
            width: modalsWidth[appName],
            children: this.metaAction.loadApp(`app-card-${appName}`, appParam)
        })

        if (ret && ret.isEnable) {
            archives[field].push(ret)
            form[field] = String(ret.id)
            this.setState({ form, archives })
            this.props.form.setFieldsValue({
                [field]: String(ret.id)
            })
        }
    }
    close = ret => {
        this.closeTip && this.closeTip()
        if (ret && ret.id) {
            const { archives, form } = this.state,
                field = "inventory"
            archives[field].push(ret)
            form[field] = String(ret.id)
            this.setState({ form, archives })
            this.props.form.setFieldsValue({
                [field]: String(ret.id)
            })
        }
    }
    selectChange = (value, option, archiveName) => {
        if (archiveName && (value === "add" || option.key === "add")) {
            const { form } = this.state
            form[archiveName] = undefined
            this.setState({ form })
        }
    }
    archiveFocus = async archiveName => {
        let params, response
        if (archiveName == "department") {
            params = { entity: { isEnable: true, isEndNode: true } }
        } else {
            params = { entity: { isEnable: true } } //获取没有停用基础档案
        }
        if (archiveName.indexOf("excalc") > -1) {
            let index = archiveName.substr(archiveName.length - 1, 1)
            const parmasObj = {
                entity: { calcName: `isExCalc${index}`, isEnable: true }
            }
            response = await this.webapi[this.module].userDefineItem(parmasObj)
        } else {
            response = await this.webapi[this.module].fixedArchive(
                params,
                archiveName
            )
        }
        if (response) {
            const { archives } = this.state
            archives[archiveName] = response.list
            this.setState({ archives })
        }
    }
    componentDidMount = async () => {
        const { labelOption, archives } = this.state
        let propsItem = {},
            form = initAssistForm(this.props),
            { isNeedQuerySubject, item } = this.props
        if ((isNeedQuerySubject || item.isCalc === undefined) && item.id) {
            const subjectRes = await this.webapi[this.module].getAccountById({
                id: item.id
            })
            propsItem = (subjectRes && subjectRes.glAccount) || {}
        } else {
            propsItem = item
        }
        const formItems =
            (propsItem &&
                Object.keys(propsItem)
                    .filter(
                        f =>
                            f !== "isCalc" &&
                            f.indexOf("Calc") > 0 &&
                            propsItem[f] === true
                    )
                    .map(m =>
                        m
                            .replace("isCalc", "")
                            .replace("isExCalc", "ExCalc")
                            .toLocaleLowerCase()
                    )) ||
            []
        const res = await this.webapi[this.module].allArchive({
            isEnable: true
        })
        if (res) {
            archives.customer = res["客户"] || []
            archives.supplier = res["供应商"] || []
            archives.project = res["项目"] || []
            archives.department = res["部门"] || []
            archives.person = res["人员"] || []
            archives.inventory = res["存货"] || []
            res["自定义档案"] &&
                res["自定义档案"].forEach(o => {
                    labelOption[
                        o.calcName
                            .replace("isExCalc", "exCalc")
                            .toLocaleLowerCase()
                    ] = o.name
                    archives[
                        o.calcName
                            .replace("isExCalc", "exCalc")
                            .toLocaleLowerCase()
                    ] = o.userDefineArchiveDataList || []
                })
        }
        this.setState({ formItems, labelOption, archives, form })
    }
    getOptionText(item) {
        return `${item.code || ""}-${item.name || ""}${
            item.specification ? "-" : ""
            }${item.specification || ""}${item.unitName ? `-${item.unitName}` : ""}`
    }
    render() {
        const { disabledInventory } = this.props,
            { getFieldDecorator } = this.props.form,
            { form, archives, formItems, labelOption } = this.state
        //转换
        Object.keys(form).forEach(e => {
            if (e.indexOf('iscalc') !== -1) {
                let key = e.replace(/iscalc/, '')
                form[key] = form[e]
            }
            if (e.indexOf('isexcalc') !== -1) {
                let key = e.replace(/is/, '')
                form[key] = form[e]
            }
        })
        // console.log('form', form)
        // console.log('archives', archives)
        // console.log('formItems', formItems)
        return (
            <Form
                onSubmit={this.handleSubmit}
                className="bovms-app-select-assist-card"
            >
                {formItems.map(item => {
                    if (!archives[item]) return null
                    return (
                        <Form.Item
                            key={item}
                            label={labelOption[item]}
                            {...formItemLayout}
                        >
                            {getFieldDecorator(item, {
                                rules: [
                                    {
                                        required: true,
                                        message: `${labelOption[item]}不能为空！`
                                    }
                                ],
                                initialValue: form[item]
                            })(
                                <Select
                                    dropdownClassName="bovms-select-subject-dropdown"
                                    onFocus={() => this.archiveFocus(item)}
                                    onChange={(value, option) =>
                                        this.selectChange(value, option, item)
                                    }
                                    style={{ width: "100%" }}
                                    disabled={
                                        item === "inventory" &&
                                            disabledInventory
                                            ? disabledInventory
                                            : false
                                    }
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        if (
                                            option.props.children &&
                                            typeof option.props.children !==
                                            "string"
                                        ) {
                                            return true
                                        }
                                        return option.props.children &&
                                            typeof option.props.children ===
                                            "string"
                                            ? option.props.children
                                                .toLowerCase()
                                                .indexOf(
                                                    input.toLowerCase()
                                                ) >= 0
                                            : false
                                    }}
                                >
                                    {archives[item].map(op => (
                                        <Option key={op.id}>
                                            {item === "inventory"
                                                ? this.getOptionText(op)
                                                : op.name}
                                        </Option>
                                    ))}
                                    <Option
                                        key="add"
                                        value={undefined}
                                        className="select-subject-add"
                                    >
                                        <Button
                                            icon="plus"
                                            type="primary"
                                            onClick={() => this.onAdd(item)}
                                        >
                                            新增
                                        </Button>
                                    </Option>
                                </Select>
                            )}
                            {item === "inventory" && disabledInventory ? (
                                <Tooltip
                                    placement="bottomLeft"
                                    title="固定为已选择的存货档案，不可修改"
                                    overlayClassName="bovms-app-footer-tool"
                                >
                                    <Icon
                                        type="question"
                                        className="-help-icon"
                                    />
                                </Tooltip>
                            ) : null}
                        </Form.Item>
                    )
                })}
            </Form>
        )
    }
}
export default Form.create({ name: "bovms_app_select_assist" })(SelectAssist)
