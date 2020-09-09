import React, { Component } from 'react'
import { Tree } from 'antd';
const { TreeNode } = Tree;

class renderTreeComponent extends React.Component {
    state = {
        
    };

    componentDidMount = async () => {
        this.mounted = true;
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }

    onSelect = (selectedKeys, info) => {
        // console.log(selectedKeys);
        if(selectedKeys.length>0){
            this.props.setMea('data.bmdm',selectedKeys[0]);
            this.props.load()
        }
    };

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

    render = () => {
        let { treeData } = this.props;

        return (
            <div className='ttk-es-app-job-account-left'>
                <div className='ttk-es-app-job-account-left-top'>
                    <h4 className='ttk-es-app-job-account-left-title'>
                        部门列表
                    </h4>
                </div>
                <div className='ttk-es-app-job-account-left-content'>
                    <div className='' style={{ backgroundColor: '#fff', }}>
                        <Tree
                            onSelect={this.onSelect}
                        >
                            {this.renderTreeNodes(treeData)}
                        </Tree>
                    </div>
                </div>
            </div>
        )
    }
}

export default renderTreeComponent