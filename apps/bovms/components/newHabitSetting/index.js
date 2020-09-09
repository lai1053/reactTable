import React from "react";
import TypeSetting from './typeSetting'
import { Input, Tabs, Radio, Row, Col, Checkbox, Icon, Popover, Form, Select, Switch } from "antd";
import { purchaseTransType, saleTransType } from './typeSettingData';
const { TabPane } = Tabs;

class HabitSetting extends React.Component {
    constructor(props) {
        super(props);
        this.typesSettingArr = []
        this.detailObject = {
            transTypeValue: null,            // 业务类型（即销售类型，或者采购、费用类型）分类
            selfDefinedContent: "",     // 自定义摘要内容
            settlement: "0",                // 结算方式，1：选中；0（或者null）：未选中
            invKindCode: "0",               // 发票类型，1：选中；0（或者null）：未选中
            invNo: "1",                     // 发票号码，1：选中；0（或者null）：未选中
            custName: "0",                  // 客户名称（即购方名称，或者销方名称），1：选中；0（或者null）：未选中
            goodsName: "0",                 // 商品或服务名称，1：选中；0（或者null）：未选中
            acctCodeName: "0",              // 科目名称，1：选中；0（或者null）：未选中
            specification: "0",             // 规格型号，1：选中；0（或者null）：未选中
            unitPrice: "0",                 // 单价，1：选中；0（或者null）：未选中
            transType: "0"                  // 业务类型（即销售业务类型，或者采购、费用类型），1：选中；0（或者null）：未选中
        }
        //销项选着类型弹窗默认值
        this.saleTransTypeSetup = {
            goods: "1",                 // 销售货物，1：已选中；0（或者null）：未选中
            labour: "0",                // 销售劳务，1：已选中；0（或者null）：未选中
            service: "0",               // 销售服务，1：已选中；0（或者null）：未选中
            intangibleAssets: "0",      // 销售无形资产，1：已选中；0（或者null）：未选中
            realEstate: "0",            // 销售不动产，1：已选中；0（或者null）：未选中
            other: "1"
        }
        //进项选着类型弹窗默认值
        this.purchaseTransTypeSetup = {
            rawMaterials: "1",                    // 采购原材料，1：已选中；0（或者null）：未选中
            inventoryGoods: "1",                    // 采购库存商品，1：已选中；0（或者null）：未选中
            commissionedProcessingMaterials: "0",   // 采购委托加工物资，1：已选中；0（或者null）：未选中
            turnoverMaterials: "0",                 // 采购周转材料，1：已选中；0（或者null）：未选中
            fixedAssets: "0",                       // 采购固定资产，1：已选中；0（或者null）：未选中
            intangibleAssets: "0",                  // 采购无形资产，1：已选中；0（或者null）：未选中
            costOfSales: "1",                       // 销售费用，1：已选中；0（或者null）：未选中
            managementFees: "1",                    // 管理费用，1：已选中；0（或者null）：未选中
            financeCharges: "0",                    // 财务费用，1：已选中；0（或者null）：未选中
            other: "1"
        }
        this.state = {
            data: {
                dljgId: 6993719449523200,
                orgId: 240506772694272,
                module: "purchase",
                voucherDateRule: "2",
                purchaseTaxProcessType: "1",
                firstMergeRule: {
                    fpMergerule: "2",
                    hongchongFpMerge: '1',
                    sameTypeAndSameStateFpMerge: "0",
                    maxFpNum: null
                },
                secondMergeRule: {
                    sameAccount10Merge: "1",
                    sameAccount20Merge: "1",
                    sameAccountAndSameSummaryMerge: "1",
                },
                summaryRule: {
                    isQuickSummary: "1",               //摘要类型，是否为快速摘要？1：是快速摘要；0（或者null）：不是快速摘要，即自定义摘要
                    quickSummary: {},                    // 快速摘要
                    selfDefinedSummary: {                  // 自定义摘要
                        same10And20Summary: "1",          // 借方、贷方摘要是否相同，1：相同；0（或者null）：不相同
                        setupSummaryByTransType: "0",     // 是否按业务类型（即销售类型，或者采购、费用类型）分别设置摘要，1：按业务类型分别设置摘要；0（或者null）：不按业务类型分别设置摘要
                    }
                }
            },
            module: props.module == "cg" ? "purchase" : "sale",
        };

        if (props.setOkListener) {
            props.setOkListener(this.onOk);
        }
    }

    onOk = async e => {
        e && e.preventDefault && e.preventDefault();
        let { data, module } = this.state;
        let data1 = JSON.parse(JSON.stringify(data));
        let objectNameArr = [
            "acct20SummaryDetail",
            "acct10SummaryDetail",
            "acct10And20SummaryDetail",
            "acct10SummaryDetailList",
            "acct20SummaryDetailList",
            "acct10And20SummaryDetailList"
        ]
        let notFill = false;
        let valueLength = false;
        if (data1.firstMergeRule.maxLimitRuleValue == "1") {
            let maxLimitVal = this.props.form.getFieldValue("maxLimit");
            if (maxLimitVal) {
                maxLimitVal += "";
                if (maxLimitVal.match(/^[1-9]\d*$/g)) {
                    if (parseInt(maxLimitVal) > 50 || parseInt(maxLimitVal) <= 0) {
                        return false;
                    }
                    data1.firstMergeRule.maxFpNum = parseInt(maxLimitVal);
                } else {
                    return false;
                }
            } else {
                this.props.metaAction.toast("error", "请输入凭证最大的发票数量");
                return false;
            }
        }

        if (data1.summaryRule.isQuickSummary == "1") {
            data1.summaryRule.selfDefinedSummary = null;
            let selfDefinedContent = this.props.form.getFieldValue("quickSummary");
            if (!selfDefinedContent) {
                let notFillAll = Object.keys(data1.summaryRule.quickSummary).some(e => {
                    return data1.summaryRule.quickSummary[e] == "1"
                });
                if (!notFillAll) {
                    notFill = true;
                }
            } else {
                let passValueLength = selfDefinedContent.length < 21 ? false : true;
                if (passValueLength) {
                    valueLength = true;
                }
            }
        } else {
            data1.summaryRule.quickSummary = null;
            if (data1.summaryRule.selfDefinedSummary.setupSummaryByTransType == "0") {
                module == "purchase" ?
                    data1.summaryRule.selfDefinedSummary.purchaseTransTypeSetup = null :
                    data1.summaryRule.selfDefinedSummary.saleTransTypeSetup = null
                if (data1.summaryRule.selfDefinedSummary.same10And20Summary == "0") {
                    objectNameArr.map(item => {
                        if (item !== "acct10SummaryDetail" && item !== "acct20SummaryDetail") {
                            data1.summaryRule.selfDefinedSummary[item] = null
                        } else {
                            let selfDefinedContent = this.props.form.getFieldValue(item);
                            if (!selfDefinedContent) {
                                let notFillAll = Object.keys(data1.summaryRule.selfDefinedSummary[item]).some(e => {
                                    return data1.summaryRule.selfDefinedSummary[item][e] == "1"
                                })
                                if (!notFillAll) {
                                    notFill = true;
                                }
                            } else {
                                let passValueLength = selfDefinedContent.length < 21 ? false : true;
                                if (passValueLength) {
                                    valueLength = true;
                                }
                            }
                        }
                    })
                } else {
                    objectNameArr.map(item => {
                        if (item !== "acct10And20SummaryDetail") {
                            data1.summaryRule.selfDefinedSummary[item] = null
                        } else {
                            let selfDefinedContent = this.props.form.getFieldValue(item);
                            if (!selfDefinedContent) {
                                let notFillAll = Object.keys(data1.summaryRule.selfDefinedSummary[item]).some(e => {
                                    return data1.summaryRule.selfDefinedSummary[item][e] == "1"
                                });
                                if (!notFillAll) {
                                    notFill = true;
                                }
                            } else {
                                let passValueLength = selfDefinedContent.length < 21 ? false : true;
                                if (passValueLength) {
                                    valueLength = true;
                                }
                            }
                        }
                    })
                }
            } else {
                if (this.typesSettingArr.length < 2) {
                    this.props.metaAction.toast("error", "保存失败：请选择至少2个项目");
                    return false;
                }
                if (data1.summaryRule.selfDefinedSummary.same10And20Summary == "0") {
                    objectNameArr.map(item => {
                        if (item !== "acct10SummaryDetailList" && item !== "acct20SummaryDetailList") {
                            data1.summaryRule.selfDefinedSummary[item] = null
                        } else {
                            let index = 1
                            if (item == "acct10SummaryDetailList") {
                                index = 1;
                            } else if (item == "acct20SummaryDetailList") {
                                index = 2;
                            }
                            data1.summaryRule.selfDefinedSummary[item].map(item => {
                                let selfDefinedContent = this.props.form.getFieldValue(`SummaryDetailList-${index}-${item.transTypeValue}`);
                                if (!selfDefinedContent) {
                                    let notFillAll = Object.keys(item).some(e => {
                                        return item[e] == "1";
                                    });
                                    if (!notFillAll) {
                                        notFill = true;
                                    }
                                } else {
                                    let passValueLength = selfDefinedContent.length < 21 ? false : true;
                                    if (passValueLength) {
                                        valueLength = true;
                                    }
                                }
                            })
                        }
                    })
                } else {
                    objectNameArr.map(item => {
                        if (item !== "acct10And20SummaryDetailList") {
                            data1.summaryRule.selfDefinedSummary[item] = null
                        } else {
                            data1.summaryRule.selfDefinedSummary[item].map(item => {
                                let selfDefinedContent = this.props.form.getFieldValue(`SummaryDetailList-3-${item.transTypeValue}`);
                                if (!selfDefinedContent) {
                                    let notFillAll = Object.keys(item).some(e => {
                                        return item[e] == "1"
                                    });
                                    if (!notFillAll) {
                                        notFill = true;
                                    }
                                } else {
                                    let passValueLength = selfDefinedContent.length < 21 ? false : true;
                                    if (passValueLength) {
                                        // debugger;
                                        valueLength = true;
                                    }
                                }
                            })
                        }
                    })
                }
            }
        }
        if (notFill) {
            this.props.metaAction.toast("error", "摘要内容未设置。请设置摘要内容");
            return false;
        }
        if (valueLength) {
            this.props.metaAction.toast("error", "保存失败：请按界面提示修改");
            return false;
        }

        let res = await this.props.webapi.bovms.updateVoucherRule(data1);

        this.props.metaAction.toast("success", "保存成功");


    };
    componentDidMount() {
        this.getVoucherRule();
    }
    getVoucherRule = async () => {
        let res = await this.props.webapi.bovms.getVoucherRule({
            module: this.state.module
        });
        if (res.firstMergeRule.maxFpNum) {
            res.firstMergeRule.maxLimitRuleValue = "1";
        }
        let selfDefinedSummary = {              //自定义摘要默认值
            same10And20Summary: "1",
            setupSummaryByTransType: "0",
            acct10SummaryDetail: { ...this.detailObject },
            acct20SummaryDetail: { ...this.detailObject },
            acct10And20SummaryDetail: { ...this.detailObject },
            acct10SummaryDetailList: [],
            acct20SummaryDetailList: [],
            acct10And20SummaryDetailList: [],
        }
        this.state.module == "purchase" ?
            selfDefinedSummary.purchaseTransTypeSetup = this.purchaseTransTypeSetup :
            selfDefinedSummary.saleTransTypeSetup = this.saleTransTypeSetup;

        if (!res.summaryRule.selfDefinedSummary) {
            res.summaryRule.selfDefinedSummary = selfDefinedSummary;
        } else {
            let newSelfDefinedSummary = res.summaryRule.selfDefinedSummary;
            Object.keys(selfDefinedSummary).map(item => {
                Object.keys(newSelfDefinedSummary).indexOf(item) > -1 ? selfDefinedSummary[item] = newSelfDefinedSummary[item] : null;
            })
            res.summaryRule.selfDefinedSummary = selfDefinedSummary;
        }
        if (!res.summaryRule.quickSummary) {
            let quickSummary = { ...this.detailObject }
            quickSummary.transType = "1";
            quickSummary.settlement = "1";
            res.summaryRule.quickSummary = quickSummary;
        }
        this.setState({
            data: res
        });
        this.setDefaultTypes(res);

    };

    //初始化选择类型弹窗对应的数据
    setDefaultTypes = (data) => {
        let { module } = this.state;
        let { acct10SummaryDetailList,
            acct20SummaryDetailList,
            acct10And20SummaryDetailList,
        } = data.summaryRule.selfDefinedSummary;
        let saleOrPurchaseTypes = [];
        if (module == "purchase") {
            saleOrPurchaseTypes = purchaseTransType;
            Object.keys(data.summaryRule.selfDefinedSummary.purchaseTransTypeSetup).map(val => {
                data.summaryRule.selfDefinedSummary.purchaseTransTypeSetup[val] == "1" ?
                    this.typesSettingArr.push(val) : null;
            })
        } else {
            saleOrPurchaseTypes = saleTransType;
            Object.keys(data.summaryRule.selfDefinedSummary.saleTransTypeSetup).map(val => {
                data.summaryRule.selfDefinedSummary.saleTransTypeSetup[val] == "1" ?
                    this.typesSettingArr.push(val) : null;
            })
        }
        Object.keys(data.summaryRule.selfDefinedSummary).map(item => {
            if (item == "acct10SummaryDetailList" || item == "acct20SummaryDetailList" || item == "acct10And20SummaryDetailList") {
                if (data.summaryRule.selfDefinedSummary[item].length == 0) {
                    this.typesSettingArr.map(val => {
                        let detailObject2 = { ...this.detailObject };
                        detailObject2.transTypeValue = saleOrPurchaseTypes.find(item => val == item.value).id;
                        detailObject2.selfDefinedContent = "";
                        data.summaryRule.selfDefinedSummary[item].push(detailObject2);
                    })
                }
            }
        })
        this.setState({
            data: data,
        });
    }
    onTabsChange(val) { }
    //发票合并生成凭证
    onMergeValueChange(e) {
        let data = this.state.data;
        data.firstMergeRule.fpMergerule = e.target.value;
        if (e.target.value == 1) {
            data.firstMergeRule.sameTypeAndSameStateFpMerge = "0";
            data.firstMergeRule.maxLimitRuleValue = "0";
            data.firstMergeRule.maxFpNum = "";
            this.props.form.setFieldsValue({ maxLimit: "" });
            this.props.form.resetFields();
        } else if (e.target.value == 4) {
            data.firstMergeRule.sameTypeAndSameStateFpMerge = "0";
        }
        this.setState({
            data: data
        });
    }
    onTaxHandleChange(e) {
        let data = this.state.data;
        data.purchaseTaxProcessType = e.target.value;
        this.setState({
            data: data
        });
    }
    onMergeRuleChange(e) {
        let data = this.state.data;
        e.target.checked
            ? (data.firstMergeRule.sameTypeAndSameStateFpMerge = "1")
            : (data.firstMergeRule.sameTypeAndSameStateFpMerge = "0");
        this.setState({
            data: data
        });
    }
    onHongchongMergeRuleChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.firstMergeRule.hongchongFpMerge = "1") : (data.firstMergeRule.hongchongFpMerge = "0");
        this.setState({
            data: data
        });
    }
    onDebitMergeRuleChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.secondMergeRule.sameAccount10Merge = "1") : (data.secondMergeRule.sameAccount10Merge = "0");
        this.setState({
            data: data
        });
    }
    onLoanMergeRuleChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.secondMergeRule.sameAccount20Merge = "1") : (data.secondMergeRule.sameAccount20Merge = "0");
        this.setState({
            data: data
        });
    }
    onMaxLimitRuleChange(e) {
        let data = this.state.data;
        if (e.target.checked) {
            data.firstMergeRule.maxLimitRuleValue = "1";
            // data.firstMergeRule.maxFpNum = 1
        } else {
            data.firstMergeRule.maxLimitRuleValue = "0";
            data.firstMergeRule.maxFpNum = "";
            this.props.form.setFieldsValue({ maxLimit: "" });
            this.props.form.resetFields();
        }
        this.setState({
            data: data
        });
    }
    onLoanMergeRuleChangeA(e) {
        let data = this.state.data;
        if (e) {
            data.secondMergeRule.sameAccountAndSameSummaryMerge = "1";
        } else {
            data.secondMergeRule.sameAccountAndSameSummaryMerge = "0";
        }
        e ? (data.secondMergeRule.sameAccountAndSameSummaryMerge = "1") : (data.secondMergeRule.sameAccountAndSameSummaryMerge = "0");
        if (data.secondMergeRule.sameAccount10Merge == "0" && data.secondMergeRule.sameAccount20Merge == "0") {
            data.secondMergeRule.sameAccountAndSameSummaryMerge = "0";
        }
        this.setState({
            data: data
        });
    }
    onSummaryRuleOneChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.transType = "1") : (data.summaryRule.quickSummary.transType = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleTwoChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.invKindCode = "1") : (data.summaryRule.quickSummary.invKindCode = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleThreeChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.invNo = "1") : (data.summaryRule.quickSummary.invNo = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleFourChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.custName = "1") : (data.summaryRule.quickSummary.custName = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleFiveChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.goodsName = "1") : (data.summaryRule.quickSummary.goodsName = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleSixChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.specification = "1") : (data.summaryRule.quickSummary.specification = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleSevenChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.unitPrice = "1") : (data.summaryRule.quickSummary.unitPrice = "0");
        this.setState({
            data: data
        });
    }
    onSummaryRuleEightChange(e) {
        let data = this.state.data;
        e.target.checked ? (data.summaryRule.quickSummary.settlement = "1") : (data.summaryRule.quickSummary.settlement = "0");
        this.setState({
            data: data
        });
    }
    onDateRuleChange(e) {
        let data = this.state.data;
        data.voucherDateRule = e.target.value;
        this.setState({
            data: data
        });
    }
    onSummaryRuleTypeChange(e) {
        let { data, detailObject } = this.state;
        data.summaryRule.isQuickSummary = (e == 0) ? "0" : "1"
        this.setState({
            data: data
        });
    }
    onSame10And20SummaryChange(e) {
        let data = this.state.data;
        data.summaryRule.selfDefinedSummary.same10And20Summary = e ? "1" : "0";
        this.setState({
            data: data,
        });
    }
    onSetupSummaryByTransTypeChange(e) {
        let data = this.state.data;
        data.summaryRule.selfDefinedSummary.setupSummaryByTransType = e ? '1' : '0'
        this.setState({
            data: data
        });
    }
    //输入框双向绑定
    handleMaxlimit = (rule, value, callback) => {
        let data = this.state.data;
        let { isQuickSummary, quickSummary } = data.summaryRule;
        let { setupSummaryByTransType } = data.summaryRule.selfDefinedSummary;
        let fullField = rule.fullField;

        if (isQuickSummary == "1") {
            quickSummary.selfDefinedContent = value;
        } else if (isQuickSummary == "0" && setupSummaryByTransType == "1") {
            let [name, index, id] = fullField.split("-");
            if (index == "1") {
                data.summaryRule.selfDefinedSummary.acct10SummaryDetailList.map((item, ind) => {
                    if (item.transTypeValue == id) {
                        data.summaryRule.selfDefinedSummary.acct10SummaryDetailList[ind].selfDefinedContent = value;
                    }
                })
            } else if (index == "2") {
                data.summaryRule.selfDefinedSummary.acct20SummaryDetailList.map((item, ind) => {
                    if (item.transTypeValue == id) {
                        data.summaryRule.selfDefinedSummary.acct20SummaryDetailList[ind].selfDefinedContent = value;
                    }
                })
            } else if (index == "3") {
                data.summaryRule.selfDefinedSummary.acct10And20SummaryDetailList.map((item, ind) => {
                    if (item.transTypeValue == id) {
                        data.summaryRule.selfDefinedSummary.acct10And20SummaryDetailList[ind].selfDefinedContent = value;
                    }
                })
            }
        } else {
            data.summaryRule.selfDefinedSummary[fullField].selfDefinedContent = value;
        }
        this.setState({
            data: data
        });
        callback();
    };
    handleMaxlimit1 = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        if (value) {
            if (value.match(/^[1-9]\d*$/g)) {
                if (parseInt(value) > 50 || parseInt(value) <= 0) {
                    callback("可输入区间1~50");
                }
            } else {
                callback("请输入正整数！");
            }
        } else {
            callback("不可为空！");
        }
        callback();
    };
    //打开类型选择弹窗
    TypeSettingModal = () => {
        const { metaAction, webapi, store, module } = this.props;
        let title = module == "cg" ? "采购、费用类型设置" : "销售类型设置";
        this.props.metaAction.modal("show", {
            title: title,
            style: { top: 5 },
            okText: "确定",
            width: 410,
            wrapClassName: "bovms-app-purchase-list-habit-setting",
            children: (
                <TypeSetting
                    module={module}
                    metaAction={metaAction}
                    webapi={webapi} store={store}
                    typesCheckboxOk={this.typesCheckboxChange}
                    typesSettingArr={this.typesSettingArr}
                ></TypeSetting>
            )
        });
    };
    checkboxGroupChange(accountTransType, checkItem, id, e) {
        let { data } = this.state;
        let value = e.target.value;
        let checked = e.target.checked;
        let checkedData = data.summaryRule.selfDefinedSummary[accountTransType];
        if (Array.isArray(checkedData)) {
            checkedData.map((item, index) => {
                if (item.transTypeValue == id) {
                    Object.keys(checkItem).map(item => {
                        if (item == value) {
                            checkItem[item] = checked ? "1" : "0";
                        }
                    })
                    checkedData[index] = checkItem;
                    data.summaryRule.selfDefinedSummary[accountTransType] = checkedData;
                }
            })
        } else {
            Object.keys(checkItem).map(item => {
                if (item == value) {
                    checkItem[item] = checked ? "1" : "0";
                }
            })
            data.summaryRule.selfDefinedSummary[accountTransType] = checkItem;
        }
        this.setState({
            data: data
        })
    }
    //类型选择回调
    typesCheckboxChange = (transType) => {
        let { data, module } = this.state;
        let { setupSummaryByTransType,
            acct10SummaryDetailList,
            acct20SummaryDetailList,
            acct10And20SummaryDetailList } = data.summaryRule.selfDefinedSummary;
        let saleOrPurchaseTypes = [];
        if (module == "purchase") {
            saleOrPurchaseTypes = purchaseTransType;
            Object.keys(data.summaryRule.selfDefinedSummary.purchaseTransTypeSetup).map(val => {
                transType.indexOf(val) > -1 ?
                    data.summaryRule.selfDefinedSummary.purchaseTransTypeSetup[val] = "1" :
                    data.summaryRule.selfDefinedSummary.purchaseTransTypeSetup[val] = "0";
            })
        } else {
            saleOrPurchaseTypes = saleTransType;
            Object.keys(data.summaryRule.selfDefinedSummary.saleTransTypeSetup).map(val => {
                transType.indexOf(val) > -1 ?
                    data.summaryRule.selfDefinedSummary.saleTransTypeSetup[val] = "1" :
                    data.summaryRule.selfDefinedSummary.saleTransTypeSetup[val] = "0";
            })
        }

        if (setupSummaryByTransType == "1") {
            if (acct10And20SummaryDetailList.length > 0) {
                transType.map(val => {
                    if (this.typesSettingArr.indexOf(val) == -1) {
                        let detailObject1 = { ...this.detailObject };
                        detailObject1.transTypeValue = saleOrPurchaseTypes.find(item => val == item.value).id;
                        detailObject1.selfDefinedContent = "";
                        acct10SummaryDetailList.push(detailObject1);
                        acct20SummaryDetailList.push(detailObject1);
                        acct10And20SummaryDetailList.push(detailObject1);
                    }
                })
                this.typesSettingArr.map(val => {
                    if (transType.indexOf(val) == -1) {
                        let id = saleOrPurchaseTypes.find(item => val == item.value).id;
                        acct10SummaryDetailList.map((item, index) => {
                            if (item.transTypeValue == id) {
                                acct10SummaryDetailList.splice(index, 1);
                            }
                        })
                        acct20SummaryDetailList.map((item, index) => {
                            if (item.transTypeValue == id) {
                                acct20SummaryDetailList.splice(index, 1);
                            }
                        })
                        acct10And20SummaryDetailList.map((item, index) => {
                            if (item.transTypeValue == id) {
                                acct10And20SummaryDetailList.splice(index, 1);
                            }
                        })
                    }
                })
            } else {
                transType.map(val => {
                    let detailObject1 = { ...this.detailObject };
                    detailObject1.transTypeValue = saleOrPurchaseTypes.find(item => val == item.value).id;
                    detailObject1.selfDefinedContent = "";
                    acct10SummaryDetailList.push(detailObject1);
                    acct20SummaryDetailList.push(detailObject1);
                    acct10And20SummaryDetailList.push(detailObject1);
                })
            }
            data.summaryRule.selfDefinedSummary.acct10SummaryDetailList = acct10SummaryDetailList;
            data.summaryRule.selfDefinedSummary.acct20SummaryDetailList = acct20SummaryDetailList;
            data.summaryRule.selfDefinedSummary.acct10And20SummaryDetailList = acct10And20SummaryDetailList;
            this.typesSettingArr = transType
            this.setState({
                data: data,
            })
        }
    }
    getTransTypeMes = (transType) => {
        let module = this.state.module;
        let typesSetting = [];
        let saleOrPurchaseTypes = module == "purchase" ? purchaseTransType : saleTransType;
        transType.map(val => {
            typesSetting.push(saleOrPurchaseTypes.find(item => val == item.value))
        })
        return typesSetting.sort(this.compare('id'));
    }
    compare = (property) => {
        return (a, b) => {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    }
    getInitialValue = (SummaryDetailList, id) => {
        let initialValue = "";
        SummaryDetailList.map(item => {
            item.transTypeValue == id ? initialValue = item.selfDefinedContent : null;
        })
        return initialValue
    }
    renderCheckbox = (accountTransType, isTransType, id) => {
        let { data, module } = this.state;
        let checkItem = {};
        let checkedData = data.summaryRule.selfDefinedSummary[accountTransType];
        if (Array.isArray(checkedData)) {
            checkedData.map((item, index) => {
                if (item.transTypeValue == id) {
                    checkItem = { ...checkedData[index] };
                }
            })
        } else {
            checkItem = { ...checkedData };
        }
        return (
            <div>
                <Col span={3} style={{ marginLeft: '20px' }}>
                    <Checkbox
                        checked={checkItem.invNo == "1" ? true : false}
                        onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                        value="invNo"
                    >
                        发票号码
                    </Checkbox>
                </Col>
                <Col span={3}>
                    <Checkbox
                        checked={checkItem.custName == "1" ? true : false}
                        onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                        value="custName"
                    >
                        {module == "purchase" ? "销方名称" : "购方名称"}
                    </Checkbox>
                </Col>
                <Col span={3}>
                    <Checkbox
                        checked={checkItem.invKindCode == "1" ? true : false}
                        onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                        value="invKindCode"
                    >
                        发票类型
                    </Checkbox>
                </Col>
                {
                    module == "purchase" && id ?
                        <Col>
                            {id == 207 || id == 208 || id == 209 ?
                                <Checkbox
                                    checked={checkItem.acctCodeName == "1" ? true : false}
                                    onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                                    value="acctCodeName"
                                >
                                    科目名称
                                </Checkbox> :
                                <Checkbox
                                    checked={checkItem.goodsName == "1" ? true : false}
                                    onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                                    value="goodsName"
                                >
                                    商品或服务名称
                                </Checkbox>
                            }
                        </Col> :
                        <Col>
                            {isTransType ?
                                <Checkbox
                                    checked={checkItem.settlement == "1" ? true : false}
                                    onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                                    value="settlement"
                                >
                                    结算方式
                            </Checkbox> :
                                <Checkbox
                                    checked={checkItem.goodsName == "1" ? true : false}
                                    onChange={this.checkboxGroupChange.bind(this, accountTransType, checkItem, id)}
                                    value="goodsName"
                                >
                                    商品或服务名称
                            </Checkbox>
                            }
                        </Col>
                }
            </div>
        )
    }

    render() {
        let { data, module } = this.state;
        const { getFieldDecorator } = this.props.form;
        let mergerule = data.firstMergeRule.fpMergerule;
        let { quickSummary, isQuickSummary, selfDefinedSummary } = data.summaryRule;
        let { sameAccount10Merge, sameAccount20Merge } = data.secondMergeRule;
        let { same10And20Summary, setupSummaryByTransType } = selfDefinedSummary; //自定义摘要开关
        let mergeDisabled = false;
        let maxLimitDisabled = false;

        if (sameAccount10Merge == false && sameAccount20Merge == false) {
            data.secondMergeRule.sameAccountAndSameSummaryMerge = "0";
        }
        //判断发票类型相同、认证状态相同的发票才可合并Checkbox状态
        if (mergerule == "1" || mergerule == "4") {
            mergeDisabled = true;
        } else {
            mergeDisabled = false;
        }
        if (mergerule == "1") {
            maxLimitDisabled = true;
        } else {
            maxLimitDisabled = false;
        }
        let summaryTitle = [3]; //1为借方摘要，2为贷方摘要 3借贷摘要
        if (same10And20Summary == '1') {
            summaryTitle = [3];
        } else {
            summaryTitle = [1, 2];
        }
        let typesSettingGroup = this.getTransTypeMes(this.typesSettingArr);
        return (
            <div className="habit-setting">
                <Tabs defaultActiveKey="1" onChange={this.onTabsChange} className="bovms-app-popup-content no-top-padding">
                    <TabPane tab="凭证习惯设置" key="1">
                        <div className="habit-setting-wrap" style={{ height: "475px", overflow: "auto" }}>
                            <div className="habit-setting-sec">
                                <h4 className="habit-setting-sec-title"><span>发票合并生成凭证</span></h4>
                                <div className="habit-setting-sec-content">
                                    <Radio.Group onChange={this.onMergeValueChange.bind(this)} value={data.firstMergeRule.fpMergerule} style={{ width: "100%" }}>
                                        <Row gutter={16} style={{ marginTop: "8px" }}>
                                            <Col span={12}>
                                                <Radio value="1">单张发票生成凭证</Radio>
                                            </Col>
                                            <Col span={12}>
                                                <Radio value="6">{module == "purchase" ? "销方" : '购方'}名称相同的发票合并</Radio>
                                            </Col>
                                        </Row>
                                        <Row gutter={16} style={{ marginTop: "16px" }}>
                                            <Col span={12}>
                                                <Radio value="2">借方科目相同的发票合并</Radio>
                                            </Col>
                                            <Col span={12}>
                                                <Radio value="3">贷方科目相同的发票合并</Radio>
                                            </Col>

                                        </Row>
                                        <Row gutter={16} style={{ marginTop: "16px" }}>
                                            <Col span={12}>
                                                <Radio value="4">选中的发票合并</Radio>
                                            </Col>
                                            <Col span={12}>
                                                <Radio value="5">开票日期相同的发票合并</Radio>
                                            </Col>
                                        </Row>
                                    </Radio.Group>

                                    <div style={{ marginTop: "32px" }}>
                                        <Checkbox
                                            onChange={
                                                this.onMergeRuleChange.bind(this)
                                            }
                                            disabled={
                                                mergeDisabled
                                            }

                                            checked={
                                                data.firstMergeRule.sameTypeAndSameStateFpMerge == "1" ? true : false
                                            }
                                        >
                                            {this.props.nsrxz == "2000010001" ? "发票类型相同、认证状态相同的发票才可合并" : "发票类型相同才可合并"}
                                        </Checkbox>
                                    </div>
                                    <div style={{ marginTop: "16px" }}>
                                        <Checkbox
                                            onChange={
                                                this.onHongchongMergeRuleChange.bind(this)
                                            }

                                            checked={
                                                data.firstMergeRule.hongchongFpMerge == "1" ? true : false
                                            }
                                        >
                                            红字发票合并<Popover
                                                placement="topLeft"
                                                className="habit-setting-tooltip"
                                                arrowPointAtCenter
                                                content={
                                                    <div>
                                                        选中时，按合并规则将红字发票合并生成凭证，未选中时，每张红字发票单独生成一张凭证
                                                    </div>
                                                }
                                            >
                                                <Icon type="question" className="bovms-help-icon" />
                                            </Popover>
                                        </Checkbox>
                                    </div>
                                    <div style={{ marginTop: "16px" }}>
                                        <span style={{ position: "relative" }}>
                                            <Checkbox
                                                checked={
                                                    data.firstMergeRule.maxLimitRuleValue == "1" ? true : false
                                                }
                                                onChange={
                                                    this.onMaxLimitRuleChange.bind(this)
                                                }
                                                disabled={
                                                    maxLimitDisabled
                                                }
                                            >
                                                限制每张凭证包含的最大发票数量:
                                            </Checkbox>
                                            <Form.Item style={{ width: "60px", display: "inline-block", position: "absolute", top: "-8px" }}>
                                                {getFieldDecorator(`maxLimit`, {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            validator: this.handleMaxlimit1.bind()
                                                        }
                                                    ],
                                                    initialValue: data.firstMergeRule.maxFpNum
                                                })(
                                                    <Input disabled={data.firstMergeRule.maxLimitRuleValue == "1" ? false : true} />
                                                )}
                                            </Form.Item>
                                        </span>

                                        {/* <Input
                                            type='text'
                                            value={data.firstMergeRule.maxFpNum}
                                            style={{ width: '60px' }}
                                            onChange={this.onQuantChange.bind(this)}
                                            disabled={data.firstMergeRule.maxLimitRuleValue == '1' ? false : true}
                                        /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="habit-setting-sec">
                                <h4 className="habit-setting-sec-title">
                                    <span>
                                        凭证摘要
                                    </span>
                                </h4>
                                <div className="habit-setting-sec-content">
                                    <Row gutter={16} style={{ marginBottom: "20px" }}>
                                        <Col span={3}>
                                            <span>
                                                摘要类型
                                            </span>
                                        </Col>
                                        <Col span={8}>
                                            <Select
                                                value={data.summaryRule.isQuickSummary}
                                                onChange={this.onSummaryRuleTypeChange.bind(this)}
                                                style={{ width: "100%" }}
                                            >
                                                <Select.Option key="1" value="1">
                                                    快速摘要
                                                </Select.Option>
                                                <Select.Option key="0" value="0">
                                                    自定义摘要
                                                </Select.Option>
                                            </Select>
                                        </Col>
                                        <Col span={1}>
                                            <Popover
                                                className="habit-setting-tooltip"
                                                content={
                                                    <div>
                                                        <div>快速摘要：借、贷方科目摘要相同，合并后的科目取第1条科目的摘要</div>
                                                        {module == "purchase" ? <div>自定义摘要：内容可定制、可按采购类型分别设置摘要</div> : <div>自定义摘要：内容可定制、可按销售类型分别设置摘要</div>}
                                                    </div>
                                                }
                                            >
                                                <Icon type="question" className="bovms-help-icon" />
                                            </Popover>
                                        </Col>
                                    </Row>
                                    {
                                        isQuickSummary == 0 ? (
                                            <div>
                                                <Row gutter={16} style={{ marginBottom: "20px" }}>
                                                    <Col span={8}>
                                                        <span>借、贷方摘要相同</span>
                                                    </Col>
                                                    <Col span={3}>
                                                        <Switch
                                                            checked={
                                                                same10And20Summary == "1" ? true : false
                                                            }
                                                            onChange={this.onSame10And20SummaryChange.bind(this)}
                                                            style={{ float: 'right' }}
                                                        ></Switch>
                                                    </Col>
                                                </Row>
                                                <Row gutter={16} style={{ marginBottom: "25px" }}>
                                                    <Col span={8}>
                                                        {module == "purchase" ? <span>按采购、费用类型分别设置摘要</span> : <span>按销售类型分别设置摘要</span>}
                                                    </Col>
                                                    <Col span={3}>
                                                        <Switch
                                                            checked={
                                                                setupSummaryByTransType == "1" ? true : false
                                                            }
                                                            onChange={this.onSetupSummaryByTransTypeChange.bind(this)}
                                                            style={{ float: 'right' }}
                                                        ></Switch>
                                                    </Col>
                                                    <Col span={5} style={{ marginLeft: '10px' }}>
                                                        {setupSummaryByTransType == '1' ? <a onClick={this.TypeSettingModal}>
                                                            {module == "purchase" ? "采购、费用类型设置" : "销售类型设置"}
                                                        </a> : null}
                                                    </Col>
                                                </Row>
                                            </div>
                                        ) : null
                                    }

                                    {(same10And20Summary == '1' && setupSummaryByTransType == '0') || isQuickSummary == 1 ?
                                        (<Row gutter={16}>
                                            <Col span={3}>
                                                <span>
                                                    摘要内容
                                                </span>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item style={{ width: "100%", top: "-8px", marginBottom: '0px' }}>
                                                    {getFieldDecorator(isQuickSummary == 0 ? `acct10And20SummaryDetail` : `quickSummary`, {
                                                        rules: [
                                                            {
                                                                min: 0, max: 20,
                                                                message: "不可超过20个字符",

                                                            }, {
                                                                validator: this.handleMaxlimit.bind()
                                                            }
                                                        ],
                                                        initialValue: isQuickSummary == 0 ?
                                                            selfDefinedSummary.acct10And20SummaryDetail.selfDefinedContent :
                                                            data.summaryRule.quickSummary.selfDefinedContent
                                                    })(
                                                        <Input placeholder="自定义内容，不多于20个字符" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            {isQuickSummary == 0 ?
                                                this.renderCheckbox("acct10And20SummaryDetail", false) :
                                                (<Col span={1}>
                                                    <Popover
                                                        className="habit-setting-tooltip"
                                                        content={
                                                            <div>
                                                                <div>请输入或选择至少一项，组合生成凭证摘要</div>
                                                            </div>
                                                        }
                                                    >
                                                        <Icon type="question" className="bovms-help-icon" />
                                                    </Popover>
                                                </Col>)}
                                        </Row>) : null}

                                    {(isQuickSummary == '0' && setupSummaryByTransType == '1') ?
                                        summaryTitle.map(title => {
                                            return (<div>
                                                <p style={{ display: (same10And20Summary == '1' && setupSummaryByTransType == '1') ? 'none' : 'block' }}> {title == '1' ? '借方摘要' : '贷方摘要'} </p>
                                                {typesSettingGroup.map((item) =>
                                                    <Row gutter={16} style={{ marginTop: "16px" }} key={title + '-' + item.id}>
                                                        <Col span={3}>
                                                            <span>
                                                                {item.name}
                                                            </span>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item style={{ width: "100%", top: "-8px", marginBottom: '0px' }}>
                                                                {getFieldDecorator(`SummaryDetailList-${title}-${item.id}`, {
                                                                    rules: [
                                                                        {
                                                                            min: 0, max: 20,
                                                                            message: "不可超过20个字符",
                                                                        }, {
                                                                            validator: this.handleMaxlimit.bind()
                                                                        }
                                                                    ],
                                                                    initialValue: same10And20Summary == "1" ?
                                                                        this.getInitialValue(selfDefinedSummary.acct10And20SummaryDetailList, item.id) :
                                                                        title == '1' ? this.getInitialValue(selfDefinedSummary.acct10SummaryDetailList, item.id) :
                                                                            this.getInitialValue(selfDefinedSummary.acct20SummaryDetailList, item.id)

                                                                })(
                                                                    <Input placeholder="自定义内容，不多于20个字符" type='text' />
                                                                )}
                                                            </Form.Item>
                                                        </Col>
                                                        {same10And20Summary == "1" ? this.renderCheckbox("acct10And20SummaryDetailList", false, item.id) : title == '1' ? this.renderCheckbox("acct10SummaryDetailList", true, item.id) : this.renderCheckbox("acct20SummaryDetailList", false, item.id)}
                                                    </Row>
                                                )}
                                            </div>
                                            )
                                        }) : null}

                                    {(isQuickSummary == '0' && same10And20Summary == '0' && setupSummaryByTransType == '0') ? (
                                        <div>
                                            <Row gutter={16} style={{ marginTop: "16px" }}>
                                                <Col span={3}>
                                                    <span>
                                                        借方摘要
                                                </span>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item style={{ width: "100%", top: "-8px", marginBottom: '0px' }}>
                                                        {getFieldDecorator(`acct10SummaryDetail`, {
                                                            rules: [
                                                                {
                                                                    min: 0, max: 20,
                                                                    message: "不可超过20个字符",
                                                                }, {
                                                                    validator: this.handleMaxlimit.bind()
                                                                }
                                                            ],
                                                            initialValue: selfDefinedSummary.acct10SummaryDetail.selfDefinedContent
                                                        })(
                                                            <Input placeholder="自定义内容，不多于20个字符" type='text' />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                {this.renderCheckbox("acct10SummaryDetail", true)}
                                            </Row>
                                            <Row gutter={16} style={{ marginTop: "10px" }}>
                                                <Col span={3}>
                                                    <span>
                                                        贷方摘要
                                                </span>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item style={{ width: "100%", top: "-8px", marginBottom: '0px' }}>
                                                        {getFieldDecorator(`acct20SummaryDetail`, {
                                                            rules: [
                                                                {
                                                                    min: 0, max: 20,
                                                                    message: "不可超过20个字符",
                                                                }, {
                                                                    validator: this.handleMaxlimit.bind()
                                                                }
                                                            ],
                                                            initialValue: selfDefinedSummary.acct20SummaryDetail.selfDefinedContent
                                                        })(
                                                            <Input placeholder="自定义内容，不多于20个字符" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                {this.renderCheckbox("acct20SummaryDetail", false)}
                                            </Row>
                                        </div>
                                    ) : null
                                    }

                                    {isQuickSummary == '1' ? (
                                        <div>
                                            <Row gutter={16} style={{ marginTop: "16px" }}>
                                                <Col span={3}></Col>
                                                <Col span={5}>
                                                    {this.state.module == "purchase" ? (
                                                        <Checkbox
                                                            checked={
                                                                quickSummary.transType == "1" ? true : false
                                                            }
                                                            onChange={this.onSummaryRuleOneChange.bind(this)}
                                                        >
                                                            采购、费用类型
                                                            <Popover
                                                                className="habit-setting-tooltip"
                                                                content={
                                                                    <div>
                                                                        <div>由借方科目确定的采购、费用类型，例：</div>
                                                                        <div>1403 采购原材料</div>
                                                                        <div>1405 采购库存商品</div>
                                                                        <div>1411 采购周转材料</div>
                                                                        <div>......</div>
                                                                    </div>
                                                                }
                                                            >
                                                                <Icon type="question" className="bovms-help-icon" />
                                                            </Popover>
                                                        </Checkbox>
                                                    ) : (
                                                            <Checkbox
                                                                checked={quickSummary.settlement == "1" ? true : false}
                                                                onChange={this.onSummaryRuleEightChange.bind(this)}
                                                            >
                                                                结算方式
                                                                <Popover
                                                                    className="habit-setting-tooltip"
                                                                    content={
                                                                        <div>
                                                                            <div>借方科目确定的结算方式，例:</div>
                                                                            <div>1001 现金结算</div>
                                                                            <div>1002 银行存款结算</div>
                                                                            <div>1122 往来结算</div>
                                                                            <div>......</div>
                                                                        </div>
                                                                    }
                                                                >
                                                                    <Icon type="question" className="bovms-help-icon" />
                                                                </Popover>
                                                            </Checkbox>
                                                        )}
                                                </Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={
                                                            quickSummary.invKindCode == "1" ? true : false
                                                        }
                                                        onChange={this.onSummaryRuleTwoChange.bind(this)}
                                                    >
                                                        发票类型
                                            </Checkbox>
                                                </Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={quickSummary.invNo == "1" ? true : false}
                                                        onChange={this.onSummaryRuleThreeChange.bind(this)}
                                                    >
                                                        发票号码
                                            </Checkbox>
                                                </Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={
                                                            quickSummary.custName == "1" ? true : false
                                                        }
                                                        onChange={this.onSummaryRuleFourChange.bind(this)}
                                                    >
                                                        {this.props.module == "cg" ? "销方名称" : "购方名称"}
                                                    </Checkbox>
                                                </Col>
                                            </Row>
                                            <Row gutter={16} style={{ marginTop: "16px" }}>
                                                <Col span={3}></Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={
                                                            quickSummary.goodsName == "1" ? true : false
                                                        }
                                                        onChange={this.onSummaryRuleFiveChange.bind(this)}
                                                    >
                                                        商品或服务名称
                                            </Checkbox>
                                                </Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={
                                                            quickSummary.specification == "1" ? true : false
                                                        }
                                                        onChange={this.onSummaryRuleSixChange.bind(this)}
                                                    >
                                                        规格型号
                                            </Checkbox>
                                                </Col>
                                                <Col span={5}>
                                                    <Checkbox
                                                        checked={
                                                            quickSummary.unitPrice == "1" ? true : false
                                                        }
                                                        onChange={this.onSummaryRuleSevenChange.bind(this)}
                                                    >
                                                        单价
                                            </Checkbox>
                                                </Col>
                                                <Col span={5}>
                                                    {this.state.module == "purchase" ? (
                                                        <Checkbox
                                                            checked={
                                                                quickSummary.settlement == "1"
                                                                    ? true
                                                                    : false
                                                            }
                                                            onChange={this.onSummaryRuleEightChange.bind(this)}
                                                        >
                                                            结算方式
                                                            <Popover
                                                                className="habit-setting-tooltip"
                                                                content={
                                                                    <div>
                                                                        <div>贷方科目确定的结算方式，例:</div>
                                                                        <div>1001 现金结算</div>
                                                                        <div>1002 银行存款结算</div>
                                                                        <div>1122 往来结算</div>
                                                                        <div>......</div>
                                                                    </div>
                                                                }
                                                            >
                                                                <Icon type="question" className="bovms-help-icon" />
                                                            </Popover>
                                                        </Checkbox>
                                                    ) : (
                                                            <Checkbox
                                                                checked={
                                                                    quickSummary.transType == "1"
                                                                        ? true
                                                                        : false
                                                                }
                                                                onChange={this.onSummaryRuleOneChange.bind(this)}
                                                            >
                                                                销售业务类型
                                                                <Popover
                                                                    className="habit-setting-tooltip"
                                                                    content={
                                                                        <div>
                                                                            <div>由商品或服务类型确定的销售业务类型，例:</div>
                                                                            <div>销售货物收入</div>
                                                                            <div>销售劳务收入</div>
                                                                            <div>销售服务收入</div>
                                                                            <div>......</div>
                                                                        </div>
                                                                    }
                                                                >
                                                                    <Icon type="question" className="bovms-help-icon" />
                                                                </Popover>
                                                            </Checkbox>
                                                        )}
                                                </Col>
                                            </Row>
                                        </div>) : null}
                                </div>
                            </div>
                            <div className="habit-setting-sec">
                                <h4 className="habit-setting-sec-title">
                                    <span>凭证内科目的合并</span>
                                </h4>
                                <div className="habit-setting-sec-content">
                                    <Row gutter={16} style={{ marginTop: "8px" }}>
                                        <Col span={12}>
                                            <Checkbox checked={data.secondMergeRule.sameAccount10Merge == "1" ? true : false} onChange={this.onDebitMergeRuleChange.bind(this)}>相同的借方科目合并</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox checked={data.secondMergeRule.sameAccount20Merge == "1" ? true : false} onChange={this.onLoanMergeRuleChange.bind(this)}>相同的贷方科目合并</Checkbox>
                                        </Col>
                                    </Row>
                                    {((data.secondMergeRule.sameAccount10Merge == "1" || data.secondMergeRule.sameAccount20Merge == "1") &&
                                        <Row gutter={16} style={{ marginTop: "8px" }}>
                                            <Col span={12}>
                                                <div style={{ marginLeft: "25px", marginRight: "20px", display: "inline-block" }}>摘要相同的科目才可合并</div>
                                                <Switch
                                                    checked={data.secondMergeRule.sameAccountAndSameSummaryMerge == "1" ? true : false}
                                                    onChange={this.onLoanMergeRuleChangeA.bind(this)}
                                                    style={{ marginRight: "20px" }}
                                                ></Switch>
                                                <Popover
                                                    className="habit-setting-tooltip"
                                                    content={
                                                        <div>
                                                            <div>
                                                                打开时，科目相同且摘要相同的科目合并；
                                                            </div>
                                                            <div>
                                                                关闭时，相同的科目合并，摘要为合并前第一个科目的摘要
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <Icon type="question" className="bovms-help-icon" />
                                                </Popover>
                                            </Col>
                                        </Row>)}
                                </div>
                            </div>
                            <div className="habit-setting-sec">
                                <h4 className="habit-setting-sec-title">
                                    <span>凭证日期</span>
                                </h4>
                                <div className="habit-setting-sec-content">
                                    <Radio.Group
                                        onChange={this.onDateRuleChange.bind(this)}
                                        value={data.voucherDateRule}
                                        style={{ width: "100%" }}
                                    >
                                        <Row gutter={16} style={{ marginTop: "8px" }}>
                                            <Col span={12}>
                                                <Radio value="1">按开票日期</Radio>
                                            </Col>
                                            <Col span={12}>
                                                <Radio value="2">按月末最后一天</Radio>
                                            </Col>
                                        </Row>
                                    </Radio.Group>
                                </div>
                            </div>
                        </div>
                    </TabPane>
                    {this.props.module != "xs" && this.props.nsrxz != 2000010002 && (
                        <TabPane tab="进项税额处理" key="2">
                            <div
                                className="habit-setting-wrap"
                                style={{ height: "475px", overflow: "auto" }}
                            >
                                <div className="habit-setting-sec">
                                    <div
                                        className="habit-setting-sec-content"
                                        style={{ padding: "0 32px" }}
                                    >
                                        <Radio.Group
                                            onChange={this.onTaxHandleChange.bind(this)}
                                            value={data.purchaseTaxProcessType}
                                            style={{ width: "100%" }}
                                        >
                                            <Radio value={"1"} style={{ marginTop: "24px", display: 'block' }}>
                                                已认证税额记入进项税额科目，未认证税额记入待认证进项税额科目，待抵扣税额记入待抵扣税额科目
                                            </Radio>
                                            <Radio value={"2"} style={{ marginTop: "24px", display: 'block' }}>
                                                全部税额记入待认证进项税额科目
                                            </Radio>
                                        </Radio.Group>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                    )}
                </Tabs>
            </div>
        );
    }
}

export default Form.create({ name: "bovms_app_habit_setting" })(HabitSetting);
