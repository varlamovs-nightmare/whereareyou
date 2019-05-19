import * as ReactDOM from 'react-dom';
import React from 'react';

import Modal from '@skbkontur/react-ui/Modal';
import Button from '@skbkontur/react-ui/Button';

export class Notification {
  constructor() {
    const div = document.createElement('div');
    document.body.appendChild(div);
    this.div = div;
  }

  show(text, info, afterHide) {
    this.afterHide = afterHide;
    ReactDOM.render(
      <Modal onClose={this.hide} width={600}>
        <Modal.Header>{text}</Modal.Header>
        <Modal.Body>{info}</Modal.Body>
        <Modal.Footer panel={true}>
          <Button onClick={this.hide}>Ясно понятно</Button>
        </Modal.Footer>
      </Modal>,
      this.div
    );
  }

  hide = () => {
    this.div && ReactDOM.render(null, this.div);
    this.afterHide && this.afterHide();
  }
}