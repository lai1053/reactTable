import React from 'react'
import { Form } from 'antd';

class FilterForm extends React.Component {
    componentDidMount() {
        // To disabled submit button at the beginning.
        // this.props.form.validateFields();
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                this.props.handleSubmit && this.props.handleSubmit(values)
            }
        });
    };

    render() {
        // const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const { form, renderItems, renderButtons, formItems, buttons } = this.props;
        const _formItems = renderItems && renderItems(form) || null;
        const _buttons = renderButtons && renderButtons(form) || null;
        return (
            <div className="ttk-filter-form">
                <Form layout="inline"  className="ttk-filter-form-left">
                  {_formItems}
                  {formItems || null}
                </Form>
                <div className="ttk-filter-form-right">
                  {_buttons}
                  {buttons || null}
                </div>
            </div>
        );
    }
}
export default Form.create({ name: 'ttk_filter_form' })(FilterForm);