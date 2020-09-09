import moment from "moment"
export function getMeta() {
    return {
        name: "root",
        component: "Layout",
        className: "app-balancesum-rpt",
        children: [
            {
                name: "body",
                component: "Layout",
                className: "app-balancesum-rpt-body",
                children: [
                    {
                        name: "tablesetting",
                        component: "TableSettingCard",
                        data: "{{$tableCardList()}}",
                        visible: "{{data.showTableSetting}}",
                        showTitle: "{{false}}",
                        double: "{{true}}",
                        positionClass: "app-balancesum-rpt-table-tbody",
                        confirmClick:
                            "{{function(data){$showTableSetting({value: false, data: data})}}}",
                        cancelClick: "{{function(){$closeTableSetting()}}}",
                        resetClick:
                            "{{function(){$resetTableSetting({data: data})}}}"
                    },
                    {
                        name: "left",
                        component: "::div",
                        className: "app-balancesum-rpt-body-left",
                        // className: '{{$renderTimeLineVisible() ? "app-balancesum-rpt-body-left" :""}}',
                        _visible: "{{$renderTimeLineVisible()}}",
                        children: '{{$renderTimeLine("")}}'
                    },
                    {
                        name: "right",
                        component: "Layout",
                        className: "app-balancesum-rpt-body-right",
                        children: [
                            {
                                name: "accountQuery",
                                title: "accountQuery",
                                component: "SearchCard",
                                refName: "accountQuery",
                                className: "app-balancesum-rpt-search",
                                didMount:
                                    "{{function(childrenRef){$getSearchCard(childrenRef)}}}",
                                searchClick:
                                    '{{function(value){$searchValueChange(value, "highSearch", null)}}}',
                                // cancelClick: '{{function(value){$searchValueChange(value)}}}',
                                clearClick:
                                    "{{function(value){$clearValueChange(value)}}}",
                                onChange:
                                    "{{function(value){$searchValueChange(value)}}}",
                                queryAccountSubjects:
                                    "{{function(){$queryAccountSubjects()}}}",
                                refreshBtn: [
                                    {
                                        name: "subjectName1",
                                        component: "Input.Search",
                                        showSearch: true,
                                        placeholder: "请输入编码/名称",
                                        className:
                                            "ttk-gl-app-finance-periodbegin-header-left-year-search",
                                        // value: '{{data.other.positionCondition}}',
                                        onChange:
                                            "{{function(e){$searchChange(e.target.value)}}}",
                                        onSearch: `{{$fixPosition}}`
                                    },
                                    {
                                        name: "refreshBtn",
                                        component: "Icon",
                                        fontFamily: "edficon",
                                        type: "shuaxin",
                                        title: "刷新",
                                        className: "app-balancesum-rpt-reload",
                                        onClick: "{{$refreshBtnClick}}"
                                    }
                                ],
                                confirmBtn: {
                                    hidden: false,
                                    text: "查询"
                                },
                                cancelBtn: {
                                    hidden: false,
                                    text: "取消"
                                },
                                clearBtn: {
                                    hidden: false,
                                    text: "重置"
                                },
                                menuBtn: [
                                    {
                                        name: "cbShowSubTos1",
                                        component: "Checkbox",
                                        className:
                                            "app-balancesum-rpt-header-cb",
                                        style: '{{$checkBoxisShow("multi")}}',
                                        checked: "{{data.showOption.currency}}",
                                        onChange:
                                            '{{function(e){$showOptionsChange("currency", e.target.checked)}}}',
                                        children: "外币"
                                    },
                                    {
                                        name: "cbShowSubTos",
                                        component: "Checkbox",
                                        className:
                                            "app-balancesum-rpt-header-cb",
                                        style: '{{$checkBoxisShow("num")}}',
                                        checked: "{{data.showOption.quantity}}",
                                        onChange:
                                            '{{function(e){$showOptionsChange("quantity", e.target.checked)}}}',
                                        children: "数量"
                                    },
                                    {
                                        name: "btn",
                                        component: "Button",
                                        onClick: "{{$handleClickShowAccount}}",
                                        disabled:
                                            "{{data.other.showAccountDis}}",
                                        children: "{{data.other.btnContent}}"
                                    },
                                    {
                                        name: "common",
                                        component: "Dropdown",
                                        overlay: {
                                            name: "menu",
                                            component: "Menu",
                                            onClick: "{{$shareClick}}",
                                            children: [
                                                {
                                                    name: "weixinShare",
                                                    component: "Menu.Item",
                                                    key: "weixinShare",
                                                    children: "微信/QQ"
                                                },
                                                {
                                                    name: "mailShare",
                                                    component: "Menu.Item",
                                                    key: "mailShare",
                                                    children: "邮件分享"
                                                }
                                            ]
                                        },
                                        children: {
                                            name: "internal",
                                            component: "Button",
                                            type: "primary",
                                            children: [
                                                "分享",
                                                {
                                                    name: "down",
                                                    component: "Icon",
                                                    type: "down"
                                                }
                                            ]
                                        }
                                    },
                                    // {
                                    //     name: 'print',
                                    //     component: 'Dropdown',
                                    //     overlay: {
                                    //         name: 'menu',
                                    //         component: 'Menu',
                                    //         onClick: '{{$printClick}}',
                                    //         children: [{
                                    //             name: 'setup',
                                    //             component: 'Menu.Item',
                                    //             key: 'setup',
                                    //             children: {
                                    //                 component: '::span',
                                    //                 name: 'setup_btn',
                                    //                 children: '打印设置',
                                    //             }
                                    //         }]
                                    //     },
                                    //     children: {
                                    //         name: 'internal',
                                    //         component: 'Button',
                                    //         // type: 'primary',
                                    //         className: 'app-balancesum-rpt-dayinBut',
                                    //         children: [{
                                    //             name: 'save',
                                    //             component: 'Icon',
                                    //             fontFamily: 'edficon',
                                    //             className: 'app-balancesum-rpt-dayin',
                                    //             type: 'dayin',
                                    //             title: '打印',
                                    //         }, {
                                    //             name: 'down',
                                    //             component: 'Icon',
                                    //             className: 'app-balancesum-rpt-dayin-down',
                                    //             type: 'down'
                                    //
                                    //         }]
                                    //     }
                                    // },
                                    {
                                        name: "printFunction",
                                        component: "Dropdown.AntButton",
                                        onClick: "{{$print}}",
                                        className: "app-balancesum-rpt-print",
                                        style: { marginLeft: "8px" },
                                        overlay: {
                                            name: "menu",
                                            component: "Menu",
                                            onClick: "{{$printClick}}",
                                            children: [
                                                {
                                                    name: "printset",
                                                    component: "Menu.Item",
                                                    key: "printset",
                                                    children: "打印设置"
                                                }
                                            ]
                                        },
                                        children: {
                                            name: "print",
                                            component: "Icon",
                                            fontFamily: "edficon",
                                            className:
                                                "app-balancesum-rpt-dayin",
                                            type: "dayin",
                                            title: "打印"
                                        }
                                    },
                                    {
                                        name: "share",
                                        component: "Icon",
                                        fontFamily: "edficon",
                                        className: "daochu",
                                        type: "daochu",
                                        title: "导出",
                                        onClick: "{{$export}}"
                                    }
                                ],
                                normalSearchValue: `{{$getNormalSearchValue()}}`,

                                normalSearch: [
                                    {
                                        name: "date",
                                        type: "DateRangeMonthPicker",
                                        format: "YYYY-MM",
                                        allowClear: false,
                                        startEnableDate:
                                            "{{data.other.enabledDate}}",
                                        popupStyle: { zIndex: 10 },
                                        mode: ["month", "month"],
                                        onChange: "{{$onPanelChange}}",
                                        value: "{{$getNormalDateValue()}}"
                                    }
                                ],
                                moreSearch: "{{data.searchValue}}",
                                moreSearchItem: [
                                    {
                                        name: "date",
                                        range: true,
                                        label: "会计期间",
                                        centerContent: "－",
                                        isTime: true,
                                        pre: {
                                            name: "date_start",
                                            type: "DatePicker.MonthPicker",
                                            mode: ["month", "month"],
                                            format: "YYYY-MM",
                                            allowClear: false,
                                            decoratorDate:
                                                '{{function(value, value2){ return  $disabledDate(value, value2, "pre")}}}'
                                        },
                                        next: {
                                            name: "date_end",
                                            type: "DatePicker.MonthPicker",
                                            mode: ["month", "month"],
                                            format: "YYYY-MM",
                                            allowClear: false,
                                            decoratorDate:
                                                '{{function(value, value2){return $disabledDate(value, value2, "next")}}}'
                                        }
                                    },
                                    {
                                        name: "accountCode",
                                        range: true,
                                        label: "会计科目",
                                        centerContent: "－",
                                        pre: {
                                            name: "beginAccountCode",
                                            type: "Select",
                                            childType: "Option",
                                            onMouseEnter:
                                                "{{function(){$onFieldFocus(data.other.startAccountList, window.balanceSumAccountList)}}}",
                                            showSearch: "{{true}}",
                                            optionFilterProp: "children",
                                            filterOption: "{{$filterOption}}",
                                            className:
                                                "searchAccountMaxWidthStyle",
                                            option:
                                                "{{data.other.startAccountList}}",
                                            allowClear: true
                                        },
                                        next: {
                                            name: "endAccountCode",
                                            type: "Select",
                                            childType: "Option",
                                            showSearch: "{{true}}",
                                            onMouseEnter:
                                                "{{function(){$onFieldFocus(data.other.startAccountList, window.balanceSumAccountList)}}}",
                                            optionFilterProp: "children",
                                            filterOption: "{{$filterOption}}",
                                            className:
                                                "searchAccountMaxWidthStyle",
                                            option:
                                                "{{data.other.startAccountList}}",
                                            allowClear: true
                                        }
                                    },
                                    {
                                        name: "currencyId",
                                        label: "币别",
                                        type: "Select",
                                        childType: "Option",
                                        option: "{{data.other.currencyList}}",
                                        allowClear: false
                                    },
                                    {
                                        name: "accountDepth",
                                        range: true,
                                        label: "科目级次",
                                        centerContent: "－",
                                        pre: {
                                            name: "beginAccountGrade",
                                            type: "Select",
                                            childType: "Option",
                                            disabled:
                                                "{{data.other.gradeStyleStatus}}",
                                            option:
                                                "{{data.other.startAccountDepthList}}",
                                            allowClear: false
                                        },
                                        next: {
                                            name: "endAccountGrade",
                                            type: "Select",
                                            childType: "Option",
                                            disabled:
                                                "{{data.other.gradeStyleStatus}}",
                                            option:
                                                "{{data.other.endAccountDepthList}}",
                                            allowClear: false
                                        }
                                    },
                                    {
                                        name: "onlyShowEndAccount",
                                        type: "Checkbox.Group",
                                        render: "{{$renderCheckBox1}} "
                                    },
                                    {
                                        name: "showZero",
                                        type: "Checkbox.Group",
                                        render: "{{$renderCheckBox2}} "
                                    },
                                    {
                                        name: "showAuxAccCalc",
                                        type: "Checkbox.Group",
                                        render: "{{$renderCheckBox3}} "
                                    }
                                ]
                            },
                            {
                                name: "rightFiexd",
                                component: "::div",
                                className: "app-balancesum-rpt-rightFiexd",
                                children: [
                                    {
                                        name: "setting",
                                        component: "::div",
                                        className: "setting setting-box",
                                        children: {
                                            name: "columnset",
                                            component: "Icon",
                                            fontFamily: "edficon",
                                            className: "columnset",
                                            type: "youcezhankailanmushezhi",
                                            onClick:
                                                "{{$showTableSettingButton}}"
                                        }
                                    }
                                ]
                            },
                            /*, {
                                            name: 'voucherItems1',
                                            component: '::div',
                                            className: 'app-balancesum-rpt-table',
                                            children: '{{$getVirtualTable(data)}}'
                                        }*/
                            {
                                name: "voucherItems",
                                component: "VirtualTable",
                                pagination: false,
                                // lazyTable: true,
                                className: "app-balancesum-rpt-table-tbody",
                                key: "{{data.tableKey}}",
                                allowColResize: true,
                                id: "app-balancesum-rpt-Body-id",
                                emptyShowScroll: true,
                                enableSequenceColumn: false,
                                loading: "{{data.loading}}",
                                bordered: true,
                                shouldRender: "{{$shouldRender}}",
                                scroll: "{{data.tableOption}}",
                                style: "{{data.tableOption}}",
                                // style: { width: "100%" },
                                // rowHeight:'{{$getRowHeight}}',
                                dataSource: "{{data.list}}",
                                noDelCheckbox: true,
                                matchIndex: "{{data.other.matchIndex}}",
                                // onRow: '{{function(record, index){return $getRow(record, index)}}}',
                                columns: "{{$tableColumns()}}",
                                listRef: "{{$createVtableRef}}",
                                onResizeEnd:
                                    "{{function(param){$resizeEnd(param)}}}"
                            }
                        ]
                    }
                ]
            },
            {
                name: "footer",
                className: "app-balancesum-rpt-footer",
                component: "::div",
                children: [
                    {
                        name: "pagination",
                        component: "Pagination",
                        pageSizeOptions: ["50", "100", "150", "200", "1000"],
                        pageSize: "{{data.pagination.pageSize}}",
                        current: "{{data.pagination.currentPage}}",
                        total: "{{data.pagination.totalCount}}",
                        onChange: "{{$pageChanged}}",
                        onShowSizeChange: "{{$sizePageChanged}}"
                    }
                ]
            }
        ]
    }
}

export function childVoucherItems() {
    return {
        name: "childVoucherItems",
        component: "Table",
        dataSource: "{{data.dataItems}}",
        className: "app-proof-of-list-child-Body",
        columns: [
            {
                title: "摘要1",
                name: "summary1",
                dataIndex: "summary1",
                key: "summary1"
            },
            {
                title: "科目1",
                name: "accountingSubject1",
                dataIndex: "accountingSubject1",
                key: "accountingSubject1"
            },
            {
                title: "借方金额1",
                name: "debitAmount1",
                dataIndex: "debitAmount1",
                key: "debitAmount1",
                render: "{{data.content}}"
            },
            {
                title: "贷方金额1",
                name: "creditAmount1",
                key: "creditAmount1",
                dataIndex: "creditAmount1",
                render: "{{data.content}}"
            }
        ]
    }
}

export function getInitState(option) {
    return {
        data: {
            tableOption: {
                width: "100%",
                x: 1000,
                y: 0,
                h: 139,
                class: "app-balancesum-rpt-body-right"
            },
            showTableSetting: false,
            sort: {
                userOrderField: null,
                order: null
            },
            showOption: {
                multi: false,
                quantity: false,
                currency: false
            },
            showCheckbox: {
                multi: false,
                num: false
            },
            list: [],
            content: "查询条件：",
            searchValue: {
                beginAccountCode: "",
                endAccountCode: "",
                currencyId: "0",
                beginAccountGrade: "1",
                endAccountGrade: "5",
                onlyShowEndAccount: [],
                showZero: ["1"],
                showAuxAccCalc: ["1"],
                printType: 0,
                date_end: option.date_end,
                date_start: option.date_start
            },
            pagination: {
                currentPage: 1,
                totalCount: 0,
                pageSize: 100,
                totalPage: 0
            },
            other: {
                gradeStyleStatus: false,
                currencylist: [],
                startAccountList: [],
                tmpCurrencyList: [],
                startAccountDepthList: [],
                endAccountDepthList: [],
                enabledDate: "",
                changeSipmleDate: false,
                matchIndex: -1,
                // pageSizeOptions: ['50', '100', '150', '200', '600'],
                matchBacktoZero: true,
                currentTime: "",
                timePeriod: {},
                showAccountDis: false,
                btnContent: "显示一级科目",
                // code: 'balanceListNoSelect',
                columnDto: [
                    {
                        id: 50000600001,
                        columnId: 500006,
                        fieldName: "accountCode",
                        caption: "科目编码",
                        idFieldType: 1000040001,
                        width: 78,
                        idAlignType: 1000050001,
                        colIndex: 1,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: true,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600002,
                        columnId: 500006,
                        fieldName: "accountName",
                        caption: "科目名称",
                        idFieldType: 1000040001,
                        width: 186,
                        idAlignType: 1000050001,
                        colIndex: 2,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: true,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600003,
                        columnId: 500006,
                        fieldName: "periodBeginAmountCr_f",
                        caption: "期初余额",
                        idFieldType: 1000040001,
                        width: 255,
                        idAlignType: 1000050001,
                        colIndex: 3,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600004,
                        columnId: 500006,
                        fieldName: "periodBeginAmountDr",
                        caption: "借方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 3,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600003,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600005,
                        columnId: 500006,
                        fieldName: "periodBeginAmountCr",
                        caption: "贷方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 4,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600003,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600006,
                        columnId: 500006,
                        fieldName: "amountCr_f",
                        caption: "本期发生额",
                        idFieldType: 1000040001,
                        width: 252,
                        idAlignType: 1000050001,
                        colIndex: 5,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600007,
                        columnId: 500006,
                        fieldName: "amountDr",
                        caption: "借方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 5,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600006,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600008,
                        columnId: 500006,
                        fieldName: "amountCr",
                        caption: "贷方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 6,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600006,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600009,
                        columnId: 500006,
                        fieldName: "yearAmountCr_f",
                        caption: "本年累计发生额",
                        idFieldType: 1000040001,
                        width: 252,
                        idAlignType: 1000050001,
                        colIndex: 7,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600010,
                        columnId: 500006,
                        fieldName: "yearAmountDr",
                        caption: "借方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 7,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600009,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600011,
                        columnId: 500006,
                        fieldName: "yearAmountCr",
                        caption: "贷方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 8,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600009,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600012,
                        columnId: 500006,
                        fieldName: "periodEndAmountCr_f",
                        caption: "期末余额",
                        idFieldType: 1000040001,
                        width: 252,
                        idAlignType: 1000050001,
                        colIndex: 9,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040001,
                            name: "字符",
                            code: "string",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050001,
                            name: "左对齐",
                            code: "01",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600013,
                        columnId: 500006,
                        fieldName: "periodEndAmountDr",
                        caption: "借方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 9,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600012,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    },
                    {
                        id: 50000600014,
                        columnId: 500006,
                        fieldName: "periodEndAmountCr",
                        caption: "贷方",
                        idFieldType: 1000040002,
                        width: 126,
                        idAlignType: 1000050003,
                        colIndex: 10,
                        idOrderMode: 1000060001,
                        isFixed: false,
                        isVisible: true,
                        isMustSelect: false,
                        isSystem: false,
                        isHeader: false,
                        isTotalColumn: false,
                        isOrderMode: false,
                        parentId: 50000600012,
                        customDecideVisible: true,
                        fieldTypeDTO: {
                            id: 1000040002,
                            name: "数值",
                            code: "decimal",
                            enumId: 100004,
                            showOrder: 0
                        },
                        alignTypeDTO: {
                            id: 1000050003,
                            name: "右对齐",
                            code: "03",
                            enumId: 100005,
                            showOrder: 0
                        },
                        orderModeDTO: {
                            id: 1000060001,
                            name: "升序",
                            code: "01",
                            enumId: 100006,
                            showOrder: 0
                        }
                    }
                ]
            },
            enableDate: null,
            loading: true
        }
    }
}
