import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Tree, Button } from 'edf-component';
import AccountingPlatform from './components/accountingPlatform'
import OperateIframe from "./components/operateIframe";
import { consts } from 'edf-consts'

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		// let addEventListener = this.component.props.addEventListener;
		// if (addEventListener) {
		// 	addEventListener('onTabFocus', :: this.onTabFocus)
		// }
        this.isOpenOperate()
        this.yyglExistAgencyId()
		this.load()
	};

	load = async() => {
		const res = await this.webapi.getRoleList()
		let response = {}
		if (res && res.length) {
			/*let newArr = []
			// res.forEach(element => {
			// 	let obj={
			// 		title: element.gwmc,
			// 		key: element.gwId,
			// 		gwlx: element.gwlx,
			// 		jsbz: element.jsbz
			// 	}
			// 	newArr.push(obj)
			// });
			res.forEach(element => {
				let obj={
					name: element.gwmc,
					id: element.gwId,
                    key: element.gwId,
					gwlx: element.gwlx,
					jsbz: element.jsbz
				}
				newArr.push(obj)
			});

            let newData = []
			let firstChildren = []
			let secondChildren = []
			let threeChildren = []
			let fourChildren = []
			newArr.forEach(item=>{
				if(item.jsbz==='001'){
					secondChildren.push(item)
				}
                if(item.jsbz==='002'){
                    threeChildren.push(item)
                }
                if(item.jsbz==='003'){
                    fourChildren.push(item)
                }
                if(item.jsbz==='004'){
                    firstChildren.push(item)
                }
			})
            let firstNode = {
                title:'管理岗位',
                key:'99990001',
                gwlx:'001',
                jsbz:'001',
				children:firstChildren
            }
            let secondNode = {
                title:'业务岗位',
                key:'99990002',
                gwlx:'002',
                jsbz:'002',
                children:secondChildren
            }
            let threeNode = {
                title:'自定义岗位',
                key:'99990003',
                gwlx:'003',
                jsbz:'003',
                children:threeChildren
            }
            let fourNode = {
                title:'系统管理员',
                key:'99990004',
                gwlx:'004',
                jsbz:'004',
                children:fourChildren
            }

            if(fourChildren.length>0){
                newData.unshift(fourNode)
                response.treeSelectedKey = fromJS([String(fourChildren[0].id)])
                response.treeExpandedKeys = fromJS([String(fourNode.key)])
            }
            if(threeChildren.length>0){
                newData.unshift(threeNode)
                response.treeSelectedKey = fromJS([String(threeChildren[0].id)])
                response.treeExpandedKeys = fromJS([String(threeNode.key)])
            }
            if(secondChildren.length>0){
                newData.unshift(secondNode)
                response.treeSelectedKey = fromJS([String(secondChildren[0].id)])
                response.treeExpandedKeys = fromJS([String(secondNode.key)])
            }
            if(firstChildren.length>0){
                newData.unshift(firstNode)
                response.treeSelectedKey = fromJS([String(firstChildren[0].id)])
                response.treeExpandedKeys = fromJS([String(firstNode.key)])
			}

			console.info(newData)
			console.info(response)
			// response.tree = fromJS(newArr)
			response.tree = fromJS(newData)
			response.oldData = fromJS(res)
			// response.treeSelectedKey = fromJS([String(newArr[0].key)])*/
			this.allSearch(res)
		}
		// this.injections.reduce('load', response)

		// this.tabload()
	};

	tabload = async() => {
		const treeSelectedKey = this.metaAction.gf('data.treeSelectedKey').toJS()

		if(!treeSelectedKey){
			return
		}
		const res = await this.webapi.findRoleAuth({
			roleId: Number(treeSelectedKey[0])
		})

        // let code = await this.webapi.dzCode()
        // this.metaAction.sf('data.code',code)


		if(res) this.injections.reduce('update', res)
		// return res
	}

	handleClick = async() => {
		const treeSelectedKey = this.metaAction.gf('data.treeSelectedKey').toJS()
		const tree= this.metaAction.gf('data.other.tree').toJS()

		let name = ''

		tree.forEach(item => {
			if(item.key == treeSelectedKey[0]) {
				name = item.title
			}
		})

		const ret = await this.metaAction.modal('confirm', {
			content: `确定要恢复${name}岗位的默认设置吗？`
		})

		if (ret) {
			
			const res = await this.webapi.backToDefault({
				roleId: Number(treeSelectedKey[0])
			})

			if (res) {
				this.metaAction.toast('success','恢复默认成功')
				this.tabload()
			}
		}
	}

	renderTab = () => {
		let activeKey = this.metaAction.gf(`data.activeKey`),
			tree = this.metaAction.gf(`data.other.tree`).toJS(),
			treeSelectedKey = this.metaAction.gf('data.treeSelectedKey').toJS(),
			disable = false,
			other = this.metaAction.gf(`data.other`).toJS(),
			list=[],
			flag = other.flag
		let allData = this.metaAction.gf('data.other.oldData').toJS()

		// let jsbzObj = tree.find(item => item.key == treeSelectedKey[0])
		let jsbzObj = allData.find(item => item.gwId == treeSelectedKey[0])
		let jsbz = jsbzObj ? jsbzObj.jsbz : '001'
		disable = jsbz == '001' ? false : true

		if(activeKey==='4'){
            let yyglExistAgencyId = this.metaAction.gf('data.yyglExistAgencyId')
			let currentOrg = this.metaAction.context.get("currentOrg")
			let id = yyglExistAgencyId?yyglExistAgencyId:currentOrg.id

			let srcStr = ''
			if(consts.XDZ_ONLINE.includes(location.host)||consts.XDZ_ONLINE_NEW.includes(location.host)){
				srcStr = `${consts.JCYY_ONLINE_DOMAIN}/gwAuthorityShow.jsp?id=${id}&name=${jsbzObj.gwmc}`;
			}else if(consts.XDZ_DEV == location.origin){
				srcStr = `${consts.JCYY_TEST_DOMAIN}/gwAuthorityShow.jsp?id=${id}&name=${jsbzObj.gwmc}`;
			}else{
				srcStr = `${consts.JCYY_DEMO_DOMAIN_HTTPS}/gwAuthorityShow.jsp?id=${id}&name=${jsbzObj.gwmc}`;
			}
			// srcStr = `http://localhost:8080/gwAuthorityShow.jsp?id=${id}&name=${jsbzObj.gwmc}`
			// return <iframe src={srcStr}/>
			return <OperateIframe srcStr={srcStr}/>
		}else{
            switch (activeKey) {
                case '1': list = other.plat || []; break;
                case '2': list = other.dh || []; break;
                case '3': list = other.gl || []; break;
                default: list = other.plat || [];
            }

            return <div className='content'>
				<AccountingPlatform
					getTableScroll={this.getTableScroll}
					flag={flag}
					treeSelectedKey={treeSelectedKey}
					activeKey={activeKey}
					jsbz={jsbz}
					list={list}
					handleClick={this.handleClick}
					handleSave={this.handleSave}
					saveCurrentList={this.saveCurrentList}
					saveCascadeList={this.saveCascadeList}
					columns={other.columns}
					tabload={this.tabload} />
                {/* <div className='ttk-es-app-postauthority-footer'>
				{
					disable ? <span style={{ color: '#dedede' }}>恢复默认</span> :
						<a href="javascript:;" onClick={() => this.handleClick()}>恢复默认</a>
				}
				<Button type='primary' onClick={() => this.handleSave()}>保存</Button>
			</div> */}
			</div>
		}
	}
	renderIframe = async() => {
        let code = await this.webapi.dzCode()
        let srcStr = 'http://test-jcyy.aierp.cn:8089/dzapi.jsp?code='+code
        return <iframe src={srcStr}/>
    }

	saveCurrentList = (list) => {
		const activeKey = this.metaAction.gf(`data.activeKey`)
		switch(activeKey) {
			case '1': {
				this.injections.reduce('updateSingle', 'data.other.plat',fromJS(list))
			}
			break;
			case '2': {
				this.injections.reduce('updateSingle', 'data.other.dh',fromJS(list))
			}
			break;
			case '3':{
				this.injections.reduce('updateSingle', 'data.other.gl',fromJS(list))
			}break;
			default:  {
				this.injections.reduce('updateSingle', 'data.other.plat',fromJS(list))
			}
		}
	}
	//级联保存 勾选认证 汇算清缴
	saveCascadeList = (id,checked,activeKey) => {
		let list = []
        switch(activeKey) {
            case '1': {
                list = this.metaAction.gf('data.other.plat').toJS();
            }
                break;
            case '2': {
                list = this.metaAction.gf('data.other.dh').toJS();
            }
                break;
            case '3':{
                list = this.metaAction.gf('data.other.gl').toJS();
            }break;
            default:  {
                list = this.metaAction.gf('data.other.plat').toJS();
            }
        }
		let index = list.findIndex(item=>item.id===id)
		let parentId = list[index].parentId
        list[index].isCheck = checked
        if (checked) {
            list[index].isWrite = 200
        } else {
            list[index].isWrite = 100
        }

        // colIndex = colIndex || 0
        let arr = []
        list.forEach(o => {
            // if(o.code.slice(0, 2 * colIndex + 1) === rowData.code.slice(0, 2 * colIndex + 1)) {

            if(String(o.id).indexOf(id) > -1 && id != 1) {
                o.isCheck = checked
                if (checked) {
                    o.isWrite = 200
                } else {
                    o.isWrite = 100
                }
            }

            if(o.parentId == parentId) {
                arr.push(o)
            }
        })

        let num = 0
        for(let i = 0;i<arr.length;i++) {
            if(arr[i].isWrite == 100) {
                num ++
            }
        }
        list.forEach(o => {
            if(num == arr.length) {
                if(o.id == arr[0].parentId) {
                    o.isWrite = 100
                    o.isCheck = false
                }
            }else {
                if(o.id == arr[0].parentId) {
                    o.isWrite = 200
                    o.isCheck = true
                }
            }
        })

        switch(activeKey) {
            case '1': {
				this.injections.reduce('updateSingle', 'data.other.plat',fromJS(list))
            }
                break;
            case '2': {
				this.injections.reduce('updateSingle', 'data.other.dh',fromJS(list))
            }
                break;
            case '3':{
				this.injections.reduce('updateSingle', 'data.other.gl',fromJS(list))
            }break;
            default:  {
				this.injections.reduce('updateSingle', 'data.other.plat',fromJS(list))
            }
        }
	}

	handleSave = async() => {
		const activeKey = this.metaAction.gf(`data.activeKey`),
		treeSelectedKey = this.metaAction.gf('data.treeSelectedKey').toJS()

		let other = this.metaAction.gf('data.other').toJS()
		let {plat, dh, gl, platCopy, dhCopy, glCopy} = other
		console.log(plat, dh, gl)
		// let arr = ['plat', 'dh', 'gl']
		// arr.forEach(name => {
		// 	let list = []
		// 	switch(name){
		// 		case 'plat': list = platCopy; break;
		// 		case 'dh': list = dhCopy; break;
		// 		case 'gl': list = glCopy; break;
		// 		default: list = platCopy;
		// 	}

		// 	if (other[name].length) {
		// 		list.forEach(item => {
		// 			other[name].forEach(ele => {
		// 				if (ele.id == item.id) {
		// 					item.isCheck = ele.isCheck
		// 					item.isWrite = ele.isWrite
		// 				}

		// 				if (item.name == ele.parentName && item.id == ele.parentId) {
		// 					item.isCheck = ele.isCheck
		// 					item.isWrite = ele.isWrite
		// 				}
		// 			})

		// 		})
		// 	}
		// 	switch(name){
		// 		case 'plat': platCopy = list; break;
		// 		case 'dh': dhCopy = list; break;
		// 		case 'gl': glCopy = list; break;
		// 		default: platCopy = list;
		// 	}
		// })

		// let parmasList = [...platCopy, ...dhCopy, ...glCopy]
		let parmasList = [...plat, ...dh, ...gl]
		parmasList = parmasList.map(item => {
			return {
				roleId: Number(treeSelectedKey[0]),
				menuId: item.id,
				operaId: item.isWrite
			}
		})

		const res = await this.webapi.updateRoleAuth(parmasList)

		if(res) {
			this.metaAction.toast('success','保存成功')
		}

	}

	//展示树
	renderTreeNodes = (data) => {
		if (!data) return <div></div>;
		return data.map((item) => {
			if (item.children) {
				item.children = item.children.map(ele => {
					let obj = {}
					obj.title = ele.name
					obj.key = ele.id

					return obj
				})

				return (
					<Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
						{this.renderTreeNodes(item.children)}
					</Tree.TreeNode>
				);
			}
			return <Tree.TreeNode {...item} dataRef={item}/>;
		});
	};

	handleTabChange = (e) => {
		this.injections.reduce('updateSingle', 'data.activeKey',e)
		this.renderTab()
	}

	selectType = (selectedKeys, info) => {
		// console.info(selectedKeys)
		if(selectedKeys.length == 0) {
			return
		}
		if(selectedKeys.includes('99990001')||selectedKeys.includes('99990002')||selectedKeys.includes('99990003')||selectedKeys.includes('99990004')){
			let treeExpandedKeys = this.metaAction.gf('data.treeExpandedKeys').toJS()
			if(treeExpandedKeys.includes(selectedKeys[0])){
				this.injections.reduce('updateSingle', 'data.treeExpandedKeys',fromJS([]))
			}else{
				this.injections.reduce('updateSingle', 'data.treeExpandedKeys',fromJS(selectedKeys))
			}
			return
		}

		this.injections.reduce('updateObj', {
			'data.treeSelectedKey': fromJS(selectedKeys),
			'data.activeKey': '1',
			'data.other.flag': 'selectTypeChange'
		})

		this.tabload()
		this.renderTab()
	}


	getTableScroll = (type) => {
        try {
			let activeKey = this.metaAction.gf(`data.activeKey`)

            let dom = document.getElementsByClassName(`table${activeKey}`)[0] 
            let tableDom,tableOption={}
            if (!dom) {
                setTimeout(() => {
                    this.getTableScroll()
                }, 20)
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;

            let tableHeadDom = dom.getElementsByClassName('ant-table-thead')[0];
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight

                let number = tableHeadDom.offsetHeight
                if (num < (number+2)) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - (number+2)
                    }
					return tableOption
                } else { // 当数量太少 不用出现滚动条
					delete tableOption.y
					return tableOption
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

	inputSearchEnter = () => {
		const oldData = this.metaAction.gf('data.other.oldData').toJS()
		const inputSearch = this.metaAction.gf('data.inputSearch')

		if(inputSearch){
			this.someSearch(oldData,inputSearch)
		}else{
			this.allSearch(oldData)
		}
	}
	allSearch = (oldData) => {
		let newRes = {}
		let newArr = [];
		oldData.forEach(element => {
			let obj={
				name: element.gwmc,
				id: element.gwId,
				key: element.gwId,
				gwlx: element.gwlx,
				jsbz: element.jsbz
			}
			newArr.push(obj)
		});

		let newData = []
		let firstChildren = []
		let secondChildren = []
		let threeChildren = []
		let fourChildren = []
		newArr.forEach(item=>{
			if(item.gwlx==='001'){
				firstChildren.push(item)
			}
			if(item.gwlx==='002'){
				secondChildren.push(item)
			}
			if(item.gwlx==='003'){
				fourChildren.push(item)
			}
			if(item.gwlx==='004'){
				threeChildren.push(item)
			}
		})
		let firstNode = {
			title:'管理岗位',
			key:'99990001',
			gwlx:'001',
			jsbz:'001',
			children:firstChildren
		}
		let secondNode = {
			title:'业务岗位',
			key:'99990002',
			gwlx:'002',
			jsbz:'002',
			children:secondChildren
		}
		let threeNode = {
			title:'自定义岗位',
			key:'99990003',
			gwlx:'003',
			jsbz:'003',
			children:threeChildren
		}
		let fourNode = {
			title:'系统管理员',
			key:'99990004',
			gwlx:'004',
			jsbz:'004',
			children:fourChildren
		}

		if(fourChildren.length>0){
			newData.unshift(fourNode)
			newRes.treeSelectedKey = fromJS([String(fourChildren[0].id)])
			newRes.treeExpandedKeys = fromJS([String(fourNode.key)])
		}
		if(threeChildren.length>0){
			newData.unshift(threeNode)
			newRes.treeSelectedKey = fromJS([String(threeChildren[0].id)])
			newRes.treeExpandedKeys = fromJS([String(threeNode.key)])
		}
		if(secondChildren.length>0){
			newData.unshift(secondNode)
			newRes.treeSelectedKey = fromJS([String(secondChildren[0].id)])
			newRes.treeExpandedKeys = fromJS([String(secondNode.key)])
		}
		if(firstChildren.length>0){
			newData.unshift(firstNode)
			newRes.treeSelectedKey = fromJS([String(firstChildren[0].id)])
			newRes.treeExpandedKeys = fromJS([String(firstNode.key)])
		}

		// console.info(newData)
		// console.info(newRes)
		newRes.tree = fromJS(newData)
		newRes.oldData = fromJS(oldData)
		newRes.activeKey = '1'
		newRes.tabShadowVisible = oldData.length>0
		this.injections.reduce('load', newRes)

		this.tabload()
	}
	someSearch = (oldData,inputSearch) => {
		let newTreeData = oldData.filter(item=>{
			return item.gwmc.indexOf(inputSearch) !== -1
		}).map(item=>{
			return {
				title: item.gwmc,
				key: item.gwId,
				gwlx: item.gwlx,
				jsbz: item.jsbz
			}
		})
		let treeSelectedKey = newTreeData.length>0?fromJS([String(newTreeData[0].key)]):fromJS([])
		let tabShadowVisible = newTreeData.length>0
		this.injections.reduce('updateObj', {
			'data.other.tree':fromJS(newTreeData),
			'data.treeSelectedKey':treeSelectedKey,
			'data.activeKey': '1',
			'data.tabShadowVisible': !tabShadowVisible
		})
		this.tabload()
	}
	treeExpand = (expandedKeys,expandedNode) => {
		// console.info(expandedNode)
		if(!expandedNode.expanded){
			this.injections.reduce('updateSingle', 'data.treeExpandedKeys',fromJS([]))
		}else{
			this.injections.reduce('updateSingle', 'data.treeExpandedKeys',fromJS([expandedNode.node.props.eventKey]))
		}

	}

	isOpenOperate = async () => {
        let isShow = await this.webapi.ifShowYyMenu()
		this.injections.reduce('updateSingle', 'data.isOpenOperate',isShow)
    }
	yyglExistAgencyId = async () => {
        let res = await this.webapi.ifYyglExistAgencyId()
		this.injections.reduce('updateSingle', 'data.yyglExistAgencyId',res)
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
