import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import './css/ThreeDSecureModal.css';

const ThreeDSecureModal = ({ isOpen, closeModal, htmlContent, messageHandler }) => {
  Modal.setAppElement("#root")
  const iframeRef = useRef(null);
  const [iframeState, setIframeState] = useState(false);

  useEffect(() => {
    const submitForm = () => {
      try {
        const iframe = document.getElementById('iframe-threed');
        iframe.contentDocument.body.innerHTML = htmlContent;
        //window.addEventListener('message', handleMessage);
        iframe.contentDocument.getElementById('iyzico-3ds-form').submit();
      } catch (error) {
        setTimeout(submitForm, 100);
      }
    };
    submitForm();
  }, [htmlContent]);

  return (
    <Modal id="iyzico-3d-modal" isOpen={isOpen} onRequestClose={closeModal} style={{overflow:'hidden', padding:0}}>
      <iframe
        id="iframe-threed"
        title="iyzico 3D-Secure"
        ref={iframeRef}
        style={{ width: '100%', height: '96%' }}
        // onLoad={handleLoad}
      />
    </Modal>
  );
};

export default ThreeDSecureModal;
