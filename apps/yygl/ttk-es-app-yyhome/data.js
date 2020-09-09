import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-yyhome',
		children: [{
		    name:'topclear',
            component:'::div',
            className:'clearfix',
            _visible:'{{data.isPullUp}}',
            children:[{
                name: 'top',
                component: '::div',
                className: 'ttk-es-app-yyhome-top',
                children: [{
                    name: 'chart',
                    component: '::div',
                    className: 'ttk-es-app-yyhome-top-chart',
                    children: [
                        {
                        name: 'title',
                        component: '::div',
                        _visible:false,
                        className: 'ttk-es-app-yyhome-top-chart-title',
                        children: [{
                            name: 'left',
                            component: '::div',
                            className: 'ttk-es-app-yyhome-top-chart-title-left',
                            children: [{
                                name: 'jindutongji',
                                component: '::div',
                                className: 'ttk-es-app-yyhome-top-chart-title-left-jindutongji',
                                children: '进度统计'
                            }, {
                                name: 'select',
                                component: 'Select',
                                onChange: '{{function(value){$searchValueChange(value, "data.searchValue.userId")}}}',
                                value: '{{data.searchValue.userId}}',
                                _visible: '{{$getUserSearchVisible()}}',
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.other.userArr[_rowIndex]&&data.other.userArr[_rowIndex].id}}',
                                    children: '{{data.other.userArr[_rowIndex]&&data.other.userArr[_rowIndex].name}}',
                                    _power: 'for in data.other.userArr'
                                }
                            }, {
                                name: 'date',
                                component: 'DatePicker.MonthPicker',
                                format: 'YYYY年 第MM期',
                                // style: { cursor: 'pointer' },
                                getCalendarContainer: '{{function(){return document.querySelector(".ttk-es-app-yyhome-top-chart-title")}}}',
                                onChange: '{{function(value){$searchValueChange(value, "data.searchValue.date")}}}',
                                value: '{{data.searchValue.date}}'
                            }]
                        }, {
                            name: 'right',
                            component: '::div',
                            className: 'ttk-es-app-yyhome-top-chart-title-right',
                            children: [{
                                name: 'select',
                                component: 'Select',
                                _visible: false,
                                onChange: '{{function(value){$searchValueChange(value, "data.searchValue.userId")}}}',
                                value: '{{data.searchValue.userId}}',
                                children: {
                                    name: 'option',
                                    component: 'Select.Option',
                                    value: '{{data.other.userArr[_rowIndex]&&data.other.userArr[_rowIndex].id}}',
                                    children: '{{data.other.userArr[_rowIndex]&&data.other.userArr[_rowIndex].name}}',
                                    _power: 'for in data.other.userArr'
                                }
                            }, {
                                name: 'date',
                                _visible: false,
                                component: 'DatePicker',
                                onChange: '{{function(value){$searchValueChange(value, "data.searchValue.date")}}}',
                                value: '{{data.searchValue.date}}'
                            }, {
                                name: 'refresh',
                                className: 'refresh-btn',
                                _visible: false,
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'shuaxin',
                                title: '刷新'
                            }]
                        }]
                    }, {
                        name:'chartname',
                        className: 'ttk-es-app-yyhome-top-chart-disc',
                        component:'::div',
                        children:[
                            {
                                name:'chartPro',
                                component:'::p',
                                className: 'ttk-es-app-yyhome-top-chart-disc-pro',
                                children:[
                                    {
                                        name:'provin',
                                        component:'::span',
                                        children:''//广东省
                                    },{
                                        name: 'ywcicon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        className: 'icon-xdzqiehuan',
                                        type: ''//xdzqiehuan
                                    }
                                ]
                            },
                            {
                                name:'chartdate',
                                component:'::section',
                                className: 'ttk-es-app-yyhome-top-chart-disc-date',
                                children:[
                                    {
                                        name:'chartmonth',
                                        component:'::span',
                                        children:'{{data.monthdate}}'
                                    },
                                    {
                                        name:'chartmonth',
                                        component:'::span',
                                        children:'月'
                                    },
                                    {
                                        name:'chartr',
                                        component:'::span',
                                        className: 'ttk-es-app-yyhome-top-chart-disc-date-r',
                                        children:'{{data.rdate}}'
                                    },
                                    {
                                        name:'chartr',
                                        component:'::span',
                                        children:'日'
                                    }

                                ]
                            },
                            {
                                name:'chartPro',
                                component:'::p',
                                className: 'ttk-es-app-yyhome-top-chart-disc-jzrq',
                                children:'申报截止日期'
                            },
                        ]
                    },{
                        name: 'chartmain',
                        component: '::div',
                        className: 'ttk-es-app-yyhome-top-chart-chart',
                        children: [{
                            name: 'chartmain',
                            component: '::div',
                            id: 'biz',
                            _visible:'{{data.isbs}}',
                            className: 'ttk-es-app-yyhome-top-chart-chartmain',
                            children: '{{$setEchart123()}}'
                        }, {
                            name: 'chartmain2',
                            component: '::div',
                            id: 'finance',
                            _visible:'{{data.isjs}}',
                            children: '{{$setEchartbs()}}',
                            className: 'ttk-es-app-yyhome-top-chart-chartmain'
                        },  {
                            name: 'chartmain3',
                            component: '::div',
                            id: 'jz',
                            _visible:'{{data.isjz}}',
                            children: '{{$setEchartjz()}}',
                            className: 'ttk-es-app-yyhome-top-chart-chartmain'
                        }

                        ]
                    },{
                        name:'chartdes',
                        component:'::div',
                        className:'ttk-es-app-yyhome-top-chart-chartdes',
                        children:[
                            {
                                name:'',
                                component:'::div',
                                className:'clearfix',
                                _visible:'{{data.orgDatasourceType==1}}',
                                children:[
                                    {
                                        name:'charchange',
                                        component:'::span',
                                        className:' {{data.bsBtn}}',
                                        onClick:'{{$checkBs}}',
                                        children:'报'
                                    },
                                    {
                                        name:'charchange',
                                        component:'::span',
                                        className:' {{data.jsBtn}}',
                                        onClick:'{{$checkJs}}',
                                        style:{'border': '1px solid #e8e8e8'},
                                        children:'缴'
                                    }
                                ]
                            },
                            {
                                name:'',
                                component:'::div',
                                className:'clearfix',
                                _visible:'{{data.orgDatasourceType==0}}',
                                children:[
                                    {
                                        name:'charchange',
                                        component:'::span',
                                        className:' {{data.jzBtn}}',
                                        onClick:'{{$checkJz}}',
                                        children:'记'
                                    },
                                    {
                                        name:'charchange',
                                        component:'::span',
                                        className:' {{data.bsBtn}}',
                                        onClick:'{{$checkBs}}',
                                        children:'报'
                                    },
                                    {
                                        name:'charchange',
                                        component:'::span',
                                        className:' {{data.jsBtn}}',
                                        onClick:'{{$checkJs}}',
                                        children:'缴'
                                    }
                                ]
                            },
                            {
                                name:'charnrxx',
                                component:'::section',
                                className:'ttk-es-app-yyhome-top-chart-chartdes-section',
                                _visible:'{{data.isjz}}',
                                children:[
                                    {
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode ywc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jzxx.yjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jzxx.yjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wwc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jzxx.wjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jzxx.wjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wrw',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jzxx.wrw.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jzxx.wrw.total}}'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:'charnrxx',
                                component:'::section',
                                className:'ttk-es-app-yyhome-top-chart-chartdes-section',
                                _visible:'{{data.isbs}}',
                                children:[
                                    {
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode ywc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.bsxx.yjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.bsxx.yjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wwc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.bsxx.wjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.bsxx.wjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wrw',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.bsxx.wrw.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.bsxx.wrw.total}}'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name:'charnrxx',
                                component:'::section',
                                className:'ttk-es-app-yyhome-top-chart-chartdes-section',
                                _visible:'{{data.isjs}}',
                                children:[
                                    {
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode ywc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jsxx.yjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jsxx.yjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wwc',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jsxx.wjz.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jsxx.wjz.total}}'
                                            }
                                        ]
                                    },{
                                        name:'charnrxx',
                                        component:'::p',
                                        className:'ttk-es-app-yyhome-top-chart-chartdes-pxx',
                                        children:[
                                            {
                                                name:'icon',
                                                component:'::i',
                                                className:'ttk-es-app-yyhome-top-chart-chartdes-inode wrw',
                                                children:''
                                            },
                                            {
                                                name:'xxname',
                                                component:'::span',
                                                children:'{{data.jsxx.wrw.name}}'
                                            },
                                            {
                                                name:'xxtotal',
                                                component:'::span',
                                                children:'{{data.jsxx.wrw.total}}'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
                },
                    {
                        name: 'gglist',
                        component: '::div',
                        className: 'ttk-es-app-yyhome-top-gglist',
                        children: [
                            {
                                name:'ggtitle',
                                component:'::h4',
                                className:'ttk-es-app-yyhome-top-gglist-title',
                                children:[
                                    {
                                        name: 'ggicon',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        className: 'icon-color-XDZtongzhigonggao',
                                        type: 'XDZtongzhigonggao'
                                    },
                                    {
                                        name:'ggtitleleft',
                                        component:'::span',
                                        children:'通知公告',
                                        // _visible:false
                                    },
                                    {
                                        name:'ggtitleright',
                                        className:'ttk-es-app-yyhome-top-gglist-titleright',
                                        component:'::i',
                                        children:'···',
                                        onClick:'{{$ggList}}'
                                    }
                                ]
                            },
                            {
                                name:'ggxx',
                                component:'::div',
                                className:'ttk-es-app-yyhome-top-gglist-content',
                                children:{
                                    name:'chil',
                                    component:'List.Item',
                                    className:'ttk-es-app-yyhome-top-gglist-content-Item',
                                    onClick: '{{function(){$ggDetail(data.gglistdata[_rowIndex].id)}}}',
                                    title:'{{data.gglistdata[_rowIndex].title}}',//
                                    children:[
                                        {
                                            name:'sfyd',
                                            component:'::i',
                                            className:'{{data.gglistdata[_rowIndex].isRead ? "ttk-es-app-yyhome-top-gglist-content-Item-sfyd not" : "ttk-es-app-yyhome-top-gglist-content-Item-sfyd"}}'
                                        },
                                        {
                                            name:'ggxx',
                                            component:'::span',
                                            className:'{{data.gglistdata[_rowIndex].isRead ? "ttk-es-app-yyhome-top-gglist-content-Item-sfyds not" : "ttk-es-app-yyhome-top-gglist-content-Item-sfyds"}}',
                                            children:'{{data.gglistdata[_rowIndex].title}}'
                                        },
                                        {
                                            name:'sfjj',
                                            component:'::span',// || ""money>=500?total:money
                                            className:'{{data.gglistdata[_rowIndex].messageLevel==1 ? "jjtz" : ""}}',
                                            children:'{{data.gglistdata[_rowIndex].messageLevel==1 ? "急" : ""}}'
                                        }
                                    ],
                                },
                                _power: 'for in data.gglistdata'
                            }
                        ]
                    },
                    {
                        name: 'banner',
                        component: 'Carousel',
                        className: 'ttk-es-app-yyhome-top-date carousel-1',
                        arrows:true,
                        autoplay:true,
                        children: [
                            {
                                name: 'funcSecond',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel5',
                                onClick:'{{$bannerFuncSecondClick}}',
                                _visible:'{{data.orgDatasourceType==0}}'
                            },
                            {
                                name: 'questionnaire',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel7',
                                onClick:'{{$bannerQuestionnaireClick}}'
                            },
                            {
                                name: 'settlement',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel6',
                                onClick:'{{$bannerSettlementClick}}'
                            },
                            {
                                name: 'noDisk',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel4',
                                onClick:'{{$bannerNoDiskClick}}'
                            },
                            {
                                name: 'plqm',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel1',
                                onClick:'{{$bannerClick}}'
                            },
                            {
                                name: 'plsb',
                                component: '::div',
                                className:'ttk-es-app-yyhome-top-date-carousel2',
                                onClick:'{{$bannerSbjdClick}}'
                            },
                            // {
                            //     name: 'funIntro',
                            //     component: '::div',
                            //     className:'ttk-es-app-yyhome-top-date-carousel3',
                            //     onClick:'{{$bannerFuncClick}}'
                            // }
                            // {
                            //     name: 'version',
                            //     component: '::div',
                            // }
                            // 	{
                            // 	name: 'title',
                            // 	component: '::span',
                            // 	className: 'ttk-es-app-yyhome-top-date-title',
                            // 	children: '报税日历'
                            // },
                            // {
                            // name: 'date',
                            // dateFullCellRender: '{{function(time){return $CalendarTime(time)}}}',
                            // component: 'Calendar',
                            // onChange:'{{$onPanelChange}}',
                            // onPanelChange: '{{$onPanelChange}}',
                            // fullscreen: false,
                            // }
                        ]
                    },{
                        name:'ewm',
                        component: '::div',
                        className: 'ttk-es-app-yyhome-top-ewm',
                        children:[
                            {
                                name:'ewmimg',
                                component: '::div',
                                className: 'ttk-es-app-yyhome-top-ewm-img',
                            },{
                                name:'ewmtext',
                                component:"::div",
                                children:"扫一扫联系客服"
                            }
                        ]
                    }
                    /*{
                        name: 'banner',
                        component: '::div',
                        className: 'ttk-es-app-yyhome-top-date carousel-1',
                        onClick:'{{$bannerClick}}',
                        // onClick:'{{$openBatchSignature}}',
                        children: ''
                    }*/
                    ]
            }]
        },
            {//页面列表
			name: 'list',
			component: '::div',
            _visible:'{{data.isVisibleList}}',
            // name: 'tablesetting',
            // component: 'TableSettingCard',
            // data: '{{data.other.columnDto}}',
            // showTitle: '{{data.showTitle}}',
            // positionClass: 'inv-batch-custom-table',
            // visible: '{{data.showTableSetting}}',//显示隐藏控制
            className: 'ttk-es-app-yyhome-list clearfix',
			children: [{
				name: 'form',
				component: '::div',
				className: 'ttk-es-app-yyhome-list-form1',
				children: [{
					name: 'form',
					component: '::div',
					className: 'ttk-es-app-yyhome-list-form',
					children: [
					// {
                        // 	name: 'select',
                        // 	component: 'Select',
                        // 	onChange: '{{function(value){if(value != 1){$searchChange(null)};$statusChange(value, "data.listSearchValue.wayId")}}}',
                        // 	value: '{{data.listSearchValue.wayId}}',
                        // 	children: {
                        // 		name: 'option',
                        // 		component: 'Select.Option',
                        // 		value: '{{data.other.wayList[_rowIndex]&&data.other.wayList[_rowIndex].id}}',
                        // 		children: '{{data.other.wayList[_rowIndex]&&data.other.wayList[_rowIndex].name}}',
                        // 		_power: 'for in data.other.wayList'
                        // 	}
                        // }, {
                        // 	name: 'select2',
                        // 	component: 'Select',
                        // 	_visible: '{{data.listSearchValue.wayId == 1 ? false : true}}',
                        // 	onChange: '{{function(value){$listFormChange(value, "data.listSearchValue.statusId")}}}',
                        // 	value: '{{data.listSearchValue.statusId}}',
                        // 	children: {
                        // 		name: 'option',
                        // 		component: 'Select.Option',
                        // 		_visible: '{{!(data.listSearchValue.wayId == 2 && data.other.statusList[_rowIndex].id == 5)}}',
                        // 		value: '{{data.other.statusList[_rowIndex]&&data.other.statusList[_rowIndex].id}}',
                        // 		children: '{{data.other.statusList[_rowIndex]&&data.other.statusList[_rowIndex].name}}',
                        // 		_power: 'for in data.other.statusList'
                        // 	}
                        // },
                    {
                        name: 'pullUp',
                        component: '::div',
                        className:`{{data.isPullUp?"ttk-es-app-yyhome-list-form-pullUp":"ttk-es-app-yyhome-list-form-pullDown"}}`,
                        onClick:'{{$pullUp}}',
                    },

                    {
                        name: 'tree',
                        component: '::span',
                        style: {
                            verticalAlign: 'middle',
                            marginRight: '8px'
                        },
                        children: '{{$renderTree()}}'
                    },
					{
						name: 'orgName',
						component: 'Input.Search',
						showSearch: true,
						placeholder: '请输入客户名称或助记码查询',
						_visible: '{{data.listSearchValue.wayId == 1 ? true : false}}',
						style: { marginTop: '10px' },
						className: 'ttk-es-app-yyhome-search',
						onSearch: '{{function(){$loadList("sear")}}}',
						value: '{{data.listSearchValue.orgName}}',
						onChange: '{{function(e){$searchChange(e.target.value)}}}'
					},{
                        name: 'popover',
                        component: 'Popover',
                        popupClassName: 'ttk-es-app-yyhome-popover',
                        placement: 'bottom',
                        title: '',
                        content: {
                            name: 'popover-content',
                            component: '::div',
                            className: 'inv-batch-custom-popover-content',
                            children: [
                                {
                                    name: 'mobileItem',
                                    component: 'Form.Item',
                                    label: '客户分类',
                                    children: [{
                                        name: 'filter-content',
                                        component: '::div',
                                        className: 'filter-content',
                                        children: [{
                                            name: 'setting',
                                            component: 'Radio.Group',
                                            style: {marginLeft:'20px'},
                                            // _visible:false,
                                            value: '{{data.isCreatedAccount}}',
                                            children: [{
                                                name: 'borrow',
                                                component: 'Radio',
                                                value: 0,
                                                children: '全部'
                                            }, {
                                                name: 'loan',
                                                component: 'Radio',
                                                value: 2000010001,
                                                children: '一般纳税人'
                                            }, {
                                                name: 'loan',
                                                component: 'Radio',
                                                value: 2000010002,
                                                children: '小规模'
                                            }],
                                            onChange: `{{function(e){$setKhflVal(e.target.value)}}}`,//function(v){$setField('data.isCreatedAccount',v.target.value);$loadList()}
                                        }]
                                    }]
                                }, {
                                    name: 'filter-footer',
                                    component: '::div',
                                    className: 'filter-footer',
                                    children: [
                                        {
                                            name: 'search',
                                            component: 'Button',
                                            type: 'primary',
                                            children: '查询',
                                            onClick: '{{function(){$cxbtn("btn")}}}'
                                        },
                                        {
                                            name: 'reset',
                                            className: 'reset-btn',
                                            component: 'Button',
                                            children: '重置',
                                            onClick: '{{$resetval}}'
                                        }
                                    ]
                                }]
                        },
                        trigger: 'click',
                        visible: '{{data.showPopoverCard}}',
                        onVisibleChange: "{{$handlePopoverVisibleChange}}",
                        children: {
                            name: 'filterSpan',
                            component: '::span',
                            className: 'inv-batch-custom-filter-btn header-item',
                            children: {
                                name: 'filter',
                                component: 'Icon',
                                type: 'filter'
                            }
                        }
                    },
					// {
					// 	name: 'setting',
					// 	component: 'Radio.Group',
                     //    style: {marginLeft:'20px'},
					// 	_visible:false,
					// 	value: '{{data.isCreatedAccount}}',
					// 	children: [{
					// 		name: 'borrow',
					// 		component: 'Radio',
					// 		value: 0,
					// 		children: '未创建账套'
					// 	}, {
					// 		name: 'loan',
					// 		component: 'Radio',
					// 		value: 1,
					// 		children: '已创建账套'
					// 	}],
					// 	onChange: `{{function(v){$setField('data.isCreatedAccount',v.target.value);$loadList()}}}`,
					// }
					]
				},
                    {
					name: 'statusdescription',
					component: '::div',
					className: 'ttk-es-app-yyhome-list-form1-statusdescription',
					children: [{
						name: 'ywcicon',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'icon-color-yiwancheng',
						type: 'XDZzhuangtai-yiwancheng'
					}, {
						name: 'ywcdecs',
						component: '::div',
						children: '已完成',
                        style:{marginRight:'10px'},
						className: 'label-top'
					}, {
						name: 'jxsicon',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'icon-color-jinhangshi',
						type: 'XDZzhuangtai-wurenwu'
					}, {
						name: 'jxsdecs',
						component: '::div',
						children: '未完成',
                        style:{marginRight:'10px'},
						className: 'label-top'
					}, {
						name: 'wksicon',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'icon-color-weikaishi',
						type: 'XDZzhuangtai-weishenbao'
					}, {
						name: 'wksdecs',
						component: '::div',
						children: '无任务',
                        style:{marginRight:'10px'},
						className: 'label-top'
					}]
				},
                //     {
                //         name: 'topright',
                //         component: '::div',
                //         className: 'topright',
                //         style:{marginRight:'20px'},
                //         children:[{
                //             name: 'popover',
                //             component: 'Popover',
                //             content: '{{$renderPopover()}}',
                //             placement: 'left',
                //             overlayClassName: 'ttk-es-app-taxdeclaration-top-helpPopover',
                //             children: {
                //                 name: 'icon',
                //                 component: 'Icon',
                //                 fontFamily: 'edficon',
                //                 type: 'XDZtishi',
                //                 className: 'helpIcon'
                //             }
                //         },
                //             {
                //                 name: 'btn',
                //                 component: 'Button',
                //                 type: 'primary',
                //                 children: '更新状态',
                //                 style:{position:'relative',top:'7px'},
                //                 // onClick: '{{$handleRefreshState}}'
                //             }
                //         ]
                //     }
                    ]
			},
                // {
                //     name: '{{data.TaxpayerNature}}',
                //     // className: 'inv-batch-custom-table',
                //     component: 'Table',
                //     key: '{{data.TaxpayerNature}}',
                //     //loading: '{{data.loading}}',
                //     checkboxChange: '{{$checkboxChange}}',
                //     bordered: true,
                //     scroll: '{{data.list.length?data.tableOption:undefined}}',
                //     dataSource: '{{data.list}}',
                //     columns: '{{$renderColumns()}}',
                //     // checkboxKey: 'qyId',
                //     pagination: false,
                //     rowKey: 'qyId',
                //     checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
                //     // checkboxFixed: true,
                //     emptyShowScroll:true,
                //     delay: 0,
                //     // rowSelection: '{{function(){}}}',
                //     Checkbox: false,
                //     enableSequenceColumn: false,
                //     // allowColResize: true,
                // }, {
                //     name: 'footer',
                //     className: 'inv-batch-custom-footer',
                //     component: '::div',
                //     children: [
                //         {
                //             name: 'pagination',
                //             component: 'Pagination',
                //             pageSizeOptions: ['50', '100', '200', '300'],
                //             pageSize: '{{data.pagination.pageSize}}',
                //             current: '{{data.pagination.currentPage}}',
                //             total: '{{data.pagination.totalCount}}',
                //             onChange: '{{$pageChanged}}',
                //             onShowSizeChange: '{{$pageChanged}}'
                //         }
                //     ]
                // }
            /*{
				name: 'list',
				component: 'DataGrid',
				className: 'ttk-es-app-yyhome-list-datagrid',
                // style: {height: '{{(data.other.dataGridHeight + 1) * 22 + 2}}'},
                style: {height: '{{data.other.dataGridHeight}}'},
                key: '{{data.other.refershDatagrid}}',
				headerHeight: 35,
				rowHeight: 35,
				ellipsis: true,
				//enableSequence: true,
				onRowClick: '{{ $onRowClick }}',
				readonly: true,
				startSequence: 1,
				rowsCount: "{{$getListRowsCount()}}",
                // columns:'{{$loadList}}',
				columns: [{
					name: 'orgName',
					component: 'DataGrid.Column',
					columnKey: 'orgName',
					width: 280,
                    flexGrow: 1,//占用剩余大小
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '客户名称'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						align: 'left',
						className: 'ee {{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						value: '{{data.list[_rowIndex].name}}',
						title: '{{data.list[_rowIndex].name}}',
						_power: '({rowIndex}) => rowIndex',
					}
				}, {
					name: 'currentPeriod',
					component: 'DataGrid.Column',
					columnKey: 'currentPeriod',
					width: 160,
                    align: 'center',
                    header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '助记码'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.TextCell',
						className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						value: '{{data.list[_rowIndex].zjm}}',
						title: '{{data.list[_rowIndex].zjm}}',
						_power: '({rowIndex}) => rowIndex',
					}
				}, {
					name: 'zq',
					component: 'DataGrid.Column',
					columnKey: 'zq',
					// flexGrow: 1,
					width: 160,
					align: 'center',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '当前账期'
					},
					cell: {
						name: 'cell',
						component: '::div',
                        // className:'',
                        style:{
						    position:'relative'
                        },
						className: 'ee {{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						// value: '{{data.list[_rowIndex].zq}}',
						// title: '{{data.list[_rowIndex].zq}}',
						_power: '({rowIndex}) => rowIndex',
                        // onMouseOver:'{{function(e){$handelMouseOver(e,data.list[_rowIndex].zq,_rowIndex)}}}',
                        // onMouseOut:'{{function(e){$handelMouseOut(e,data.list[_rowIndex].zq,_rowIndex)}}}',
                        children:[
                            {
                                name:'wjz',
                                component:'::div',
                                children:'{{data.list[_rowIndex].zq}}',
                                className:'qq',
                                style:{
                                //     display:'inline-block',
                                //     width:'68px',
                                    padding:'0 8px',
                                    fontSize:'12px',
                                    lineHeight:'36px',
                                    cursor:'pointer',
                                //     background:'#0066b3',
                                //     color:'#fff'
                                },
                                // _visible:'{{!data.jzy[_rowIndex].isShow}}'
                            },
                            {
                                name:'wjz',
                                component:'::div',
                                children:'{{data.list[_rowIndex].zq == "未建账" ? "建账" : data.list[_rowIndex].zq}}',
                                className:'{{data.list[_rowIndex].zq == "未建账" ?(data.list[_rowIndex].num == "0" ? "ww" : "tt") : "rr"}}',
                                onClick:'{{$createZt(data.list[_rowIndex],data.list[_rowIndex].zq == "未建账" ? 1 : 2)}}',
                                // _visible:'{{data.jzy[_rowIndex].isShow}}'
                                // _visible:'{{data.list[_rowIndex].zq == "未建账"}}'
                            }
                        ]
					}
				}, {
					name: 'ticketHandleStatus',
					component: 'DataGrid.Column',
					columnKey: 'ticketHandleStatus',
					// flexGrow: 1,
					width: 160,
					align: 'center',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '记账'
					},
					cell: {
						name: 'cell',
						component: '::div',
						className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						children: {
							name: "ticketHandleStatus",
							component: 'Icon',
							fontFamily: 'edficon',
							className: '{{$getStatusClassName(data.list[_rowIndex].jz)}}',
							type: '{{$getIconType(data.list[_rowIndex].jz)}}',//
							value: '{{data.list[_rowIndex].jz}}',
							title: '{{$getStateName(data.list[_rowIndex].jz)}}',
                            //data.gglistdata[_rowIndex].isRead ? "ttk-es-app-yyhome-top-gglist-content-Item-sfyd" : "ttk-es-app-yyhome-top-gglist-content-Item-sfyd not"
						},
						_power: '({rowIndex}) => rowIndex',
					}
				},
                    {
                        name: 'accountHandle',
                        component: 'DataGrid.ColumnGroup',
                        header: '神八',
                        // fixed:true,
                        isColumnGroup:true,
                        children:[
                            {
                                name: 'accountHandleStatus',
                                component: 'DataGrid.Column',
                                columnKey: 'accountHandleStatus',
                                // flexGrow: 1,
                                align: 'center',
                                width: 160,
                                // fixed:true,
                                header: {
                                    name: 'header',
                                    component: 'DataGrid.Cell',
                                    children: '申报'
                                },
                                cell: {
                                    name: 'cell',
                                    component: '::div',
                                    className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
                                    children: {
                                        name: 'accountHandleStatus',
                                        component: 'Icon',
                                        fontFamily: 'edficon',
                                        className: '{{$getStatusClassName(data.list[_rowIndex].sbztDm)}}',
                                        type: '{{$getIconType(data.list[_rowIndex].sbztDm)}}',
                                        value: '{{data.list[_rowIndex].sbztDm}}',
                                        title: '{{$getStateName(data.list[_rowIndex].sbztDm)}}',
                                    },
                                    _power: '({rowIndex}) => rowIndex',
                                }
                            }
                        ]
                    },
                    /!*{
					name: 'accountHandleStatus',
					component: 'DataGrid.Column',
					columnKey: 'accountHandleStatus',
					// flexGrow: 1,
					align: 'center',
					width: 160,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '申报'
					},
					cell: {
						name: 'cell',
						component: '::div',
						className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						children: {
							name: 'accountHandleStatus',
							component: 'Icon',
							fontFamily: 'edficon',
							className: '{{$getStatusClassName(data.list[_rowIndex].sbztDm)}}',
							type: '{{$getIconType(data.list[_rowIndex].sbztDm)}}',
							value: '{{data.list[_rowIndex].sbztDm}}',
							title: '{{$getStateName(data.list[_rowIndex].sbztDm)}}',
						},
						_power: '({rowIndex}) => rowIndex',
					}
				}, *!/
                    {
					name: 'taxHandleStatus',
					component: 'DataGrid.Column',
					columnKey: 'taxHandleStatus',
					// flexGrow: 1,
					width: 160,
					align: 'center',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '缴款'
					},
					cell: {
						name: 'cell',
						component: '::div',
						className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						children: {
							name: 'taxHandleStatus',
							component: 'Icon',
							fontFamily: 'edficon',
							className: '{{$getStatusClassName(data.list[_rowIndex].jkztDm)}}',
							type: '{{$getIconType(data.list[_rowIndex].jkztDm)}}',
							value: '{{data.list[_rowIndex].jkztDm}}',
							title: '{{$getStateName(data.list[_rowIndex].jkztDm)}}',
						},
						_power: '({rowIndex}) => rowIndex',
					}
				}, {
					name: 'action',
					component: 'DataGrid.Column',
					columnKey: 'action',
					width: 160,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '操作'
					},
					cell: {
						name: 'cell',
						component: "::div",
						className: '{{ data.other.onRowIndex==_rowIndex ? "rowfocus" : ""}}',
						children: {
							name: 'dzCustomerOrgId',
							component: "::a",
							href: 'javascript:;',
							className: "ttk-es-app-yyhome-list-datagrid-enterAccount",
							onClick: '{{function(){$toEnterpriseTerminal(data.list[_rowIndex].khorgId,data.list[_rowIndex].name)}}}',
                            // children: "{{data.list[_rowIndex].dzCustomerOrgId ? '进入账套' : '创建账套'}}",
                            children: '进入',
						},
						_power: '({rowIndex}) => rowIndex',
					}
				}]
			},*/
                {
                    name: 'list',
                    component: 'Table',
                    className: 'ttk-es-app-yyhome-list-datagrid',
                    lazyTable: false,
                    emptyShowScroll: true,
                    bordered:true,
                    loading: '{{data.loading}}',
                    delay:1,
                    style: {height: '{{data.other.dataGridHeight}}'},
                    dataSource: '{{data.list}}',
                    columns: '{{$renderColumns()}}',
                    key: '{{data.id}}',
                    scroll:{
                        y:'{{data.other.dataTableHeight}}'
                    },
                    // scroll: '{{data.list.length?data.tableOption:undefined}}',
                    pagination: false,
                    rowKey: 'id',
                    Checkbox: false,
                    enableSequenceColumn: false
                },
                {
				name: 'footer',
				component: '::div',
				className: 'ttk-es-app-yyhome-list-footer',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					pageSizeOptions: ['50', '100'],
					pageSize: '{{data.page.pageSize}}',
					current: '{{data.page.currentPage}}',
					total: '{{data.page.totalCount}}',
					onChange: '{{$pageChanged}}',
					showTotal: '{{$pageTotal}}',
					onShowSizeChange: '{{$pageChanged}}',
				}]
			}
			]
		},
            {
                name:'ss',
                component:'::div',
                className:'ss',
                _visible:'{{data.isVisibleGuid}}',
                children:[
                    {//页面指引
                        name:'second',
                        component:'::div',
                        className:'{{data.orgDatasourceType==0 ? "homeBack secondGuid" : "homeBack1 secondGuid"}}',
                        // style:{
                        //     position:'relative',
                        //     // backgroundImage: `url(${homeBck1})`,
                        //     backgroundImage: `{{$getImgUrl()}}`,
                        //     backgroundRepeat: 'no-repeat',
                        //     // backgroundPosition: '35% 60%',
                        // },
                        children:[
                            {//标题
                                name:'title',
                                component:'::h4',
                                children:'初始工作指引',
                                style:{
                                    width:'100%',
                                    textAlign:'center',
                                    fontSize:'20px',
                                    fontWeight:'bold',
                                    position:'relative',
                                    paddingTop:'0px',
                                    top:'-40px',
                                }
                            },{//温馨提示
                                name:'bottomTitle',
                                component:'::div',
                                style:{
                                    width:'100%',
                                    textAlign:'center',
                                    fontSize:'12px',
                                    position:'absolute',
                                    bottom:'100px'
                                },
                                children:[
                                    {
                                        name:'one',
                                        component:'::span',
                                        children:'温馨提示：',
                                        style:{
                                            color:'#ee7812',
                                        }
                                    },{
                                        name:'two',
                                        component:'::span',
                                        children:'磨刀不误砍柴工！进行记账报税前，还需进行初始工作处理！',
                                        style:{
                                            color:'#666',
                                        },
                                        _visible:'{{data.orgDatasourceType==0}}'
                                    },{
                                        name:'two',
                                        component:'::span',
                                        children:'磨刀不误砍柴工！进行发票采集、报税前，还需进行初始工作处理！',
                                        style:{
                                            color:'#666',
                                        },
                                        _visible:'{{data.orgDatasourceType==1}}'
                                    }
                                ]

                            },{//页面中的链接跳转按钮
                                name:'addB',
                                component:'::a',
                                className:'buttonGo',
                                children:'1.添加部门',
                                style:'{{$getClass(1)}}',
                                _visible:'{{data.showData.addB}}',
                                onClick:'{{function(){$openPage("manage","管理",1)}}}'
                            },{
                                name:'addB',
                                component:'::a',
                                className:'buttonNo',
                                // children:'1.添加部门',
                                style:'{{$getClass(1)}}',
                                onMouseOver:'{{function(e){$sf("data.showData.addBB",!data.showData.addBB)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.addBB",!data.showData.addBB)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'1.添加部门',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.addBB}}'
                                    }
                                ],
                                _visible:'{{!data.showData.addB}}'
                            },{
                                name:'addR',
                                component:'::a',
                                className:'buttonGo',
                                children:'2.添加人员',
                                style:'{{$getClass(2)}}',
                                _visible:'{{data.showData.addR}}',
                                onClick:'{{function(){$openPage("manage","管理",2)}}}'
                            },{
                                name:'addR',
                                component:'::a',
                                className:'buttonNo',
                                // children:'2.添加人员',
                                style:'{{$getClass(2)}}',
                                onMouseOver:'{{function(e){$sf("data.showData.addRR",!data.showData.addRR)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.addRR",!data.showData.addRR)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'2.添加人员',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.addRR}}'
                                    }
                                ],
                                _visible:'{{!data.showData.addR}}'
                            },{
                                name:'addK',
                                component:'::a',
                                className:'buttonGo',
                                children:'1.添加客户',
                                style:'{{$getClass(3)}}',
                                _visible:'{{data.showData.addK}}',
                                onClick:'{{function(){$openPage("customer","客户资料",0)}}}'
                            },{
                                name:'addK',
                                component:'::a',
                                className:'buttonNo',
                                // children:'1.添加客户',
                                style:'{{$getClass(3)}}',
                                onMouseOver:'{{function(e){$sf("data.showData.addKK",!data.showData.addKK)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.addKK",!data.showData.addKK)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'1.添加客户',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.addKK}}'
                                    }
                                ],
                                _visible:'{{!data.showData.addK}}'
                            },{
                                name:'assignK',
                                component:'::a',
                                className:'buttonGo',
                                children:'2.将客户分配给指定会计',
                                style:'{{$getClass(4)}}',
                                _visible:'{{data.showData.assignK}}',
                                onClick:'{{function(){$openPage("assign","客户分配",0)}}}'
                            },{
                                name:'assignK',
                                component:'::a',
                                className:'buttonNo',
                                // children:'2.将客户分配给指定会计',
                                style:'{{$getClass(4)}}',
                                onMouseOver:'{{function(e){$sf("data.showData.assignKK",!data.showData.assignKK)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.assignKK",!data.showData.assignKK)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'2.将客户分配给指定会计',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.assignKK}}'
                                    }
                                ],
                                _visible:'{{!data.showData.assignK}}'
                            },{
                                name:'newZ',
                                component:'::a',
                                className:'buttonGo',
                                children:'1.新建账套',
                                style:{
                                    position: 'absolute',
                                    left: '88.3%',
                                    top: '35.3%',
                                },
                                _visible:'{{data.showData.newZ && data.orgDatasourceType==0}}',
                                onClick:'{{function(){$openPage("newzt","账套管理",0)}}}'
                            },{
                                name:'newZ',
                                component:'::a',
                                className:'buttonNo',
                                // children:'1.新建账套',
                                style:{
                                    position: 'absolute',
                                    left: '88.3%',
                                    top: '35.3%',
                                },
                                onMouseOver:'{{function(e){$sf("data.showData.newZZ",!data.showData.newZZ)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.newZZ",!data.showData.newZZ)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'1.新建账套',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.newZZ && data.orgDatasourceType==0}}'
                                    }
                                ],
                                _visible:'{{!data.showData.newZ && data.orgDatasourceType==0}}'
                            },{
                                name:'importZ',
                                component:'::a',
                                className:'buttonGo',
                                children:'2.导入账套',
                                style:{
                                    position: 'absolute',
                                    left: '88.3%',
                                    top: '56%',
                                },
                                _visible:'{{data.showData.importZ && data.orgDatasourceType==0}}',
                                onClick:'{{function(){$openPage("newzt","账套管理",0)}}}'
                            },{
                                name:'importZ',
                                component:'::a',
                                className:'buttonNo',
                                style:{
                                    position: 'absolute',
                                    left: '88.3%',
                                    top: '56%',
                                },
                                onMouseOver:'{{function(e){$sf("data.showData.importZZ",!data.showData.importZZ)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.importZZ",!data.showData.importZZ)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'2.导入账套',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.importZZ && data.orgDatasourceType==0}}'
                                    }
                                ],
                                _visible:'{{!data.showData.importZ && data.orgDatasourceType==0}}'
                            },
                            {
                                name:'invList',
                                component:'::a',
                                className:'buttonGo',
                                children:'1.发票采集',
                                style:{
                                    position: 'absolute',
                                    left: '85.95%',
                                    top: '4.7%',
                                },
                                _visible:'{{data.showData.invZ && data.orgDatasourceType==1}}',
                                onClick:'{{function(){$openPage("inv","发票采集",0)}}}'
                            },{
                                name:'invList',
                                component:'::a',
                                className:'buttonNo',
                                style:{
                                    position: 'absolute',
                                    left: '85.95%',
                                    top: '4.7%',
                                },
                                onMouseOver:'{{function(e){$sf("data.showData.invZZ",!data.showData.invZZ)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.invZZ",!data.showData.invZZ)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'1.发票采集',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.invZZ  && data.orgDatasourceType==1}}'
                                    }
                                ],
                                _visible:'{{!data.showData.invZ && data.orgDatasourceType==1}}'
                            },{
                                name:'taxZ',
                                component:'::a',
                                className:'buttonGo',
                                children:'1.税务申报',
                                style:{
                                    position: 'absolute',
                                    left: '84.4%',
                                    top: '57%',
                                },
                                _visible:'{{data.showData.taxZ && data.orgDatasourceType==1}}',
                                onClick:'{{function(){$openPage("tax","税务申报",999)}}}'
                            },{
                                name:'taxZ',
                                component:'::a',
                                className:'buttonNo',
                                style:{
                                    position: 'absolute',
                                    left: '84.4%',
                                    top: '57%',
                                },
                                onMouseOver:'{{function(e){$sf("data.showData.taxZZ",!data.showData.taxZZ)}}}',
                                onMouseOut:'{{function(e){$sf("data.showData.taxZZ",!data.showData.taxZZ)}}}',
                                children:[
                                    {
                                        name:'text',
                                        component:'::span',
                                        children:'1.税务申报',
                                    },
                                    {
                                        name:'down',
                                        component:'::span',
                                        className:'downIcon',
                                        children:[
                                            {
                                                name:'ttk',
                                                component:'::span',
                                                children:'无权限',
                                            },{
                                                name:'ttk-icon',
                                                component:'::span',
                                                className:'kailong'
                                            }
                                        ],
                                        _visible:'{{data.showData.taxZZ && data.orgDatasourceType==1}}'
                                    }
                                ],
                                _visible:'{{!data.showData.taxZ && data.orgDatasourceType==1}}'
                            }
                        ]

                    },

                ]
            },
            {
                name:'changeBody',
                component:'::div',
                className:'bottomDiv',
                children:[
                    {
                        name:'leftSpan',
                        className:'{{data.isVisibleGuid ? "activeSpan" : "bottomSpan"}}',
                        component:'::span',
                        onClick:'{{function(){$sf("data.isVisibleGuid",!data.isVisibleGuid),$sf("data.isVisibleList",!data.isVisibleList)}}}'
                    },{
                        name:'rightSpan',
                        className:'{{data.isVisibleGuid ? "bottomSpan" : "activeSpan"}}',
                        component:'::span',
                        onClick:'{{function(){$sf("data.isVisibleGuid",!data.isVisibleGuid),$sf("data.isVisibleList",!data.isVisibleList)}}}'
                    }
                ]
            }]
	}
}

export function getInitState(option) {
	return {
		data: {
            orgDatasourceType:0,
            echartData:[],
			searchValue: {
				userId: -1,
				date: moment()
			},
            khRangeList: [{
                rangeName: '分配给我的客户',
                rangeType: 'self'
            }],
			listSearchValue: {
				wayId: 1,
				statusId: -1,
				orgName: ''
			},
            maxde:'',
            showbm:'分配给我的客户',
            ifgs:'',
            pagination: {//分页
                currentPage: 1,//-- 当前页
                pageSize: 50,//-- 页大小
                totalCount: 0,
                totalPage: 0
            },
			chartData:{},
			list: [],
            loading:false,
			taxCalendar: [],
			isCreatedAccount: 0,
			page: {
				currentPage: 1,
				pageSize: 50,
				totalCount: 1
			},
            isPullUp:true,
            isjz: false,
            isbs:false,
            isjs:true,
			other: {
                columnDto: [],
                permission: {
                    treeData: [],//权限列表
                    all: null,
                    self: '分配我的客户'
                },
                refershDatagrid: Math.random(),
                dataGridHeight: 170,
                dataTableHeight:90,
				userArr: [],
				wayList: [{
					id: 1,
					name: '客户名称'
				}, {
					id: 2,
					name: '财务进度'
				}, {
					id: 3,
					name: '报税进度'
				}],
				statusList: [{
					id: -1,
					name: '全部'
				}, {
					id: 0,
					name: '无任务'
				}, {
					id: 1,
					name: '未完成'
				}, {
					id: 2,
					name: '已完成'
				}],
				calendarYM: option.calendarYM,
                columns: [
                    {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true},
                    {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 120},
                    // {id:3, fieldName: 'zq', fieldTitle: '当前账期', caption: '当前账期', isVisible:true, width: 120},
                    // {id:4, fieldName: 'jz', fieldTitle: '记账', caption: '记账', isVisible:true, width: 120},
                    {
                        id:5, fieldName: 'sbs', fieldTitle: '申报', caption: '申报', isVisible:true,
                        children:[
                            {id:5, fieldName: 'gsShztDm', fieldTitle: '个税', caption: '个税', isVisible:true, width: 120},
                            {id:5, fieldName: 'sbztDm', fieldTitle: '其他', caption: '其他', isVisible:true, width: 120},
                        ]
                    },
                    {
                        id:5, fieldName: 'yhs', fieldTitle: '缴款', caption: '缴款', isVisible:true,
                        children:[
                            {id:5, fieldName: 'gsJkztDm', fieldTitle: '个税', caption: '个税', isVisible:true, width: 120},
                            {id:5, fieldName: 'jkztDm', fieldTitle: '其他', caption: '其他', isVisible:true, width: 120},
                        ]
                    },
                    {id:6, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 120},
                ]
			},
            showTableSetting: false,
            // columnData,//表头数据
            columns: [],//存放表头数据
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            gglistdata:[
                {
                    title: '系统通知系统通知',
                    isRead:true
                },
                {
                    title: '发布系统通知',
                    isRead:true
                },
                {
                    title: '提醒系统通知',
                    isRead:false
                },
                {
                    title: '系统通知系统通知',
                    isRead:true
                },
            ],
            checkedKeys: {
                checked: [],//全选
                halfChecked: []//半选
            },
            rdate:15,
            monthdate:5,
            bsBtn:'ttk-es-app-yyhome-top-chart-chartdes-btn active',
            jsBtn:'ttk-es-app-yyhome-top-chart-chartdes-btn',
            jzBtn:'ttk-es-app-yyhome-top-chart-chartdes-btn',
			bsxx:{
                yjz:{
                    name:'已缴款：',
                    total:0
                },
                wjz:{
                    name:'未缴款：',
                    total:0
                },
                wrw:{
                    name:'无任务：',
                    total:0
                }
            },
            jsxx:{
                yjz:{
                    name:'已申报：',
                    total:0
                },
                wjz:{
                    name:'未申报：',
                    total:0
                },
                wrw:{
                    name:'无任务：',
                    total:0
                }
            },
            jzxx:{
                yjz:{
                    name:'已记账：',
                    total:0
                },
                wjz:{
                    name:'未记账：',
                    total:0
                },
                wrw:{
                    name:'无任务：',
                    total:0
                },
},
            isVisibleGuid:false,
            isVisibleList:false,
            jzy:[],
            showData:{
                addB:false,
                addBB:false,
                addR:false,
                addRR:false,
                addK:false,
                addKK:false,
                assignK:false,
                assignKK:false,
                newZ:false,
                newZZ:false,
                importZ:false,
                importZZ:false,
                invZ:false,
                invZZ:false,
                taxZ:false,
                taxZZ:false,
            },
            taxAppName: '',
            taxAppProps: [],
            showSign:true,
        },
	}
}
