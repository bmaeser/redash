import React from 'react';
import Steps from 'antd/lib/steps';
import { find } from 'lodash';
import { react2angular } from 'react2angular';
import { Destination } from '@/services/destination';
import navigateTo from '@/services/navigateTo';
import TypePicker from '@/components/TypePicker';
import EditDestinationForm from '@/components/destinations/EditDestinationForm';

const { Step } = Steps;

const StepEnum = {
  SELECT_TYPE: 0,
  CONFIGURE_IT: 1,
  DONE: 2,
};

class CreateDestination extends React.Component {
  constructor(props) {
    super(props);
    this.state = { destinationTypes: [], selectedType: null, currentStep: StepEnum.SELECT_TYPE };
    this.topRef = React.createRef();
  }

  componentDidMount() {
    Destination.types(destinationTypes => this.setState({ destinationTypes }));
  }

  scrollToTop = () => {
    window.scrollTo(0, this.topRef.current.offsetTop);
  }

  selectType = (selectedType) => {
    this.setState({ selectedType, currentStep: StepEnum.CONFIGURE_IT });
    this.scrollToTop();
  };

  resetType = () => {
    if (this.state.currentStep === StepEnum.CONFIGURE_IT) {
      this.setState({ selectedType: null, currentStep: StepEnum.SELECT_TYPE });
      this.scrollToTop();
    }
  };

  renderTypes() {
    const { destinationTypes } = this.state;
    const types = destinationTypes.map(destinationType => ({
      name: destinationType.name,
      type: destinationType.type,
      imgSrc: `${Destination.IMG_ROOT}/${destinationType.type}.png`,
      onClick: () => this.selectType(destinationType.type),
    }));

    return (<TypePicker types={types} />);
  }

  renderForm() {
    const { destinationTypes, selectedType } = this.state;
    const formProps = {
      destination: new Destination({ options: {}, type: selectedType }),
      type: find(destinationTypes, { type: selectedType }),
      onSuccess: (data) => {
        this.setState({ currentStep: StepEnum.DONE }, () => navigateTo(`destinations/${data.id}`));
        this.scrollToTop();
      },
    };

    return (
      <EditDestinationForm {...formProps} />
    );
  }

  render() {
    const { currentStep } = this.state;

    return (
      <div className="row" ref={this.topRef}>
        <h3 className="text-center">New Alert Destination</h3>
        <Steps className="p-20" current={currentStep}>
          <Step
            title="Select the Type"
            style={currentStep === StepEnum.CONFIGURE_IT ? { cursor: 'pointer' } : {}}
            onClick={this.resetType}
          />
          <Step title="Configure it" />
          <Step title="Done" />
        </Steps>
        {currentStep === StepEnum.SELECT_TYPE && this.renderTypes()}
        {currentStep === StepEnum.CONFIGURE_IT && this.renderForm()}
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('pageCreateDestination', react2angular(CreateDestination));

  return {
    '/destinations/new': {
      template: '<settings-screen><page-create-destination></page-create-destination></settings-screen>',
      title: 'Destinations',
    },
  };
}

init.init = true;
