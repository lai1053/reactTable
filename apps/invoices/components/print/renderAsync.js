import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { createContainer } from "./createContainer";

export const renderAsync = element => {
  return new Promise(resolve => {
    const container = createContainer();
    ReactDOM.render(
      <PromiseComponent resolve={resolve} container={container}>
        {element}
      </PromiseComponent>,
      container
    );
  });
};
class PromiseComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  componentDidMount() {
    this.resolveContainer();
  }
  componentDidUpdate() {
    this.resolveContainer();
  }
  resolveContainer() {
    const { resolve, container } = this.props;
    resolve && resolve(container);
  }
  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}
