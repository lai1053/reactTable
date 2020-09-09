import React, { Component } from 'react'
import { Tree, Button, Menu, Spin, Dropdown, Icon } from 'antd';
//import { Tree} from 'edf-component'
const { TreeNode } = Tree;

class renderTreeComponent extends React.Component {
    state = {
        expandedKeys: [],
        autoExpandParent: true,
        // checkedKeys: {
        //     checked: [],//全选
        //     // halfChecked: []//半选
        // },
        checkedKeys: [],//全选
        selectedKeys: [],
        visible: false,
        defaultName:'分配给我的客户'
    };
    static defaultProps = {
        title: '公司的客户',
        self: '分配给我的客户',
        treeData: []
    }

    componentDidMount = async () => {
        this.mounted = true;
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }

    // handleCheckedKeys = (treeData, checkedKeys) => {

    //     treeData.forEach(ele => {
    //         let chooseAll = ele.children.every(v => checkedKeys.checked.includes(v.key));
    //         let index = checkedKeys.checked.indexOf(ele.key);
    //         console.log(chooseAll, index)
    //         if (chooseAll && index === -1) {
    //             checkedKeys.checked.push(ele.key)
    //         } else if (chooseAll && index > -1) {
    //             checkedKeys.checked.splice(index, 1)
    //         }
    //     });
    //     return checkedKeys;
    // }
    onExpand = expandedKeys => {
        // console.log('onExpand', expandedKeys);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.

        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onCheck = (checkedKeys, info) => {
        // console.log(checkedKeys, info)
        // let eventKey = info.node.props.eventKey;//点击的key
        // let parentKey = info.node.props.parentKey;//父节点的key
        // let pos = info.node.props.pos;//定位点击的位置
        // let children = info.node.props.children;//如果有chilren说明点击的为非末级节点

        // if (children) {
        //     //点击子节点，判断是否全选
        //     let p=pos.split('-');
        //     let x=p[1];//根节点
        //     let data=treeData[x];//根节点的数据

        //     checkedKeys = this.handleCheckedKeys(treeData, checkedKeys);
        // }
        this.setState({ checkedKeys });
    };

    // onSelect = (selectedKeys, info) => {

    //     let checkedArr = [...this.state.checkedKeys.checked];
    //     let eventKey = info.node.props.eventKey;
    //     let index = checkedArr.indexOf(eventKey)

    //     if (index > -1) {
    //         checkedArr.splice(index, 1)
    //     } else {
    //         checkedArr.push(eventKey)
    //     }
    //     let obj = treeData.find(o => o.children.find(p => p.key === eventKey));
    //     if (obj) {
    //         //选择的是子节点
    //         let parentKey = obj.key;//父节点的key
    //         let all = true;
    //         for (let i = 0; i < obj.children.length; i++) {
    //             if (checkedArr.indexOf(obj.children[i].key) === -1) {
    //                 all = false;
    //                 break;
    //             }
    //         }
    //         if (all && checkedArr.indexOf(parentKey) === -1) {
    //             checkedArr.push(parentKey)
    //         }
    //     }

    //     this.setState({
    //         checkedKeys: {
    //             checked: checkedArr,
    //             halfChecked: []
    //         }
    //     });
    // };

    renderTreeNodes = (data) => {
        return data.map(item => {
            if (item.childList && item.childList.length) {
                return (
                    <TreeNode title={item.bmmc} key={item.bmdm} dataRef={item}>
                        {this.renderTreeNodes(item.childList)}
                    </TreeNode>
                );
            }
            return <TreeNode title={item.bmmc} key={item.bmdm} />;
        });
    }

    handleConfirm = (dd) => {
        let { title, self, treeData } = this.props;

        //确定
        if(dd == 1){
            this.setState({
                defaultName: '分配给我的客户'
            })
            this.state.checkedKeys = []
            this.props.setMea('data.gwVal','');
        }else if(dd == 2) {
            this.setState({
                defaultName: title
            })
            this.props.setMea('data.gwVal','');
            this.props.setMea('data.persioniL',[])

        }

        this.handleDropDownClick();
        let checked=this.state.checkedKeys;
        this.props.onConfirm && this.props.onConfirm(checked)
    }
    handleReset = () => {
        //重置
        this.handleDropDownClick();
        let checked=[];
        this.state.checkedKeys = []
        this.props.onReset && this.props.onReset(checked)
    }

    handleDropDownClick = () => {
        let visible = this.state.visible;
        this.setState({
            visible: !visible
        })
    }
    renderOverlay = () => {
        let { title, self, treeData } = this.props;
        let ifhide
        if(treeData.length == 0){
            ifhide = 'none';
        }else{
            ifhide = 'block';
        }

        return <div className='' style={{ backgroundColor: '#fff', }}>
            <Menu
                mode="inline"
                style={{
                    border: '1px solid #e8e8e8',
                }}
                selectable={false}
            >
                <Menu.Item key="item1" onClick={() =>{this.handleConfirm(1)}}>{self}</Menu.Item>
                <Menu.SubMenu key='submenu1' style={{display:ifhide}} title={title}>
                    <div key='1234123'>
                        <Tree
                            checkable
                            onExpand={this.onExpand}
                            expandedKeys={this.state.expandedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                            onCheck={this.onCheck}
                            checkedKeys={this.state.checkedKeys}
                            //  onSelect={this.onSelect}
                            selectedKeys={this.state.selectedKeys}
                            checkStrictly={false}
                             // multiple={false}

                        >
                            {this.renderTreeNodes(treeData)}
                        </Tree>
                    </div>
                </Menu.SubMenu>
            </Menu>
            <div style={{ textAlign: 'center', padding: '10px 0', border: '1px solid #e8e8e8', borderTop: 'none' }}>
                <Button onClick={() =>{this.handleConfirm(2)}}style={{marginRight:10}}>确定</Button>
                <Button onClick={this.handleReset}>重置</Button>
            </div>
        </div>
    }
    handleVisibleChange = (flag)=>{
        this.setState({ visible: flag });
    }
    render() {
        return (
            <Dropdown
                visible={this.state.visible}
                onClick={this.handleDropDownClick}
                onVisibleChange={this.handleVisibleChange}
                trigger='click'
                overlay={this.renderOverlay()}
                overlayClassName='overlay'
                overlayStyle={
                    {
                        width: 300
                    }
                }
            >
                <Button className='app-asset-list-header-more'>
                    <span>{this.state.defaultName}</span>
                    <Icon type='down' />
                </Button>
            </Dropdown>
        );
    }
}

export default renderTreeComponent