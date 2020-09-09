import React from 'react'
import { Select, DataGrid, Table } from 'edf-component'
import { Map, fromJS } from 'immutable'
import SelectSubject from './selectSubject';
import SelectAssist from '../../../../bovms/components/selectAssist'

const { Option } = Select;

class SubjectSelector extends React.Component {
    state = {
        editing: false,
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    };
    handleGetPopupContainer = () => {
        return document.querySelector(".ant-modal");
    };
    async openSelectAssist(e, value, assistJSON, subjectName, rowIsStock) {
        e && e.preventDefault && e.preventDefault();
        e && e.stopPropagation && e.stopPropagation();

        let item = {
            id: value,
            assistList: JSON.parse(assistJSON || "{}").assistList
        };

        const res = await this.props.metaAction.modal("show", {
            title: "选择辅助项目",
            width: 450,
            style: { top: 5 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: (
                <SelectAssist
                    item={item}
                    store={this.props.store}
                    module='operation'
                    metaAction={this.props.metaAction}
                    webapi={this.props.webapi}
                    subjectName={subjectName}
                    isNeedQuerySubject
                    disabledInventory={rowIsStock == 1 ? true : false}
                ></SelectAssist>
            )
        });
        if (res && res.assistList) {
            const { record } = this.props;
            this.props.onSubjectChange({
                id: record.destAcctId,
                code: record.destAcctCode,
                gradeName: record.destAcctName,
                assistList: res.assistList
            },
            );
        } else {
            // 暂不做处理
        }
    }

    render() {
        const { editing } = this.state;
        const { value, selectType, module, metaAction, store, webapi, record, } = this.props;
        let obj = record.assistCiName ? JSON.parse(record.assistCiName) : {};
        let assistList = obj.assistList;

        let defaultItem = {
            id: record.destAcctId,
            codeAndName: `${record.destAcctCode} ${record.destAcctName}`
        };
        const assistJSON = record.assistCiName;
        const isCanSelectAssist = JSON.parse(assistJSON || "{}").assistList;

        let subjectName = record.destAcctName
        const fullName = `${record.destAcctCode || ""} ${record.destAcctName || ""}${
            assistList ? "/" : ""
            }${assistList ? assistList.map(m => m.name).join("/") : ""}`;
        return editing ? (
            <SelectSubject
                ref={node => (this.input = node)}
                onBlur={this.toggleEdit}
                selectType={selectType}
                defaultItem={defaultItem}
                metaAction={metaAction}
                getPopupContainer={this.handleGetPopupContainer}
                autoExpand={true}
                store={store}
                webapi={webapi}
                subjectName={subjectName}
                onChange={value => this.props.onSubjectChange(value)}
                value={record.destAcctId}
                assistJSON={assistJSON}
                noShowSelectAssist
            />
        ) : (
                <div
                    className={
                        isCanSelectAssist
                            ? "editable-cell-value-wrap bovms-select-subject-container no-right-padding"
                            : "editable-cell-value-wrap"
                    }
                    onClick={this.toggleEdit.bind(this)}
                    style={{ width: '100%', height: '100%' }}
                    title={fullName}
                >
                    <div className={isCanSelectAssist ? "subject-value" : ""} style={{ width: '300px', height: '34px',lineHeight:'34px' }}>
                        {`${record.destAcctCode || ""} ${record.destAcctName || ""}${
                            assistList ? "/" : ""
                            }${assistList ? assistList.map(m => m.name).join("/") : ""}`}
                    </div>
                    {isCanSelectAssist ? (
                        <a
                            className="assist-btn"
                            unSelectable="on"
                            onClick={e =>
                                this.openSelectAssist(
                                    e,
                                    value,
                                    assistJSON,
                                    record.goodsName,
                                )
                            }
                        >
                            辅助
                        </a>
                    ) : null}
                </div>
            );
    }
}

export default SubjectSelector