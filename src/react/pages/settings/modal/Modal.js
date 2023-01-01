import ReactDOM from "react-dom";
import React from 'react';
import { useState } from "react";

import './modal.scss';

const Modal = ({ isShowing, ssid, hide, connect, status, reset }) => {

    const [password, setPassword] = useState("password")

    const handleSubmit = (e) => {
        e.preventDefault()
        connect(password);
    }

    function close() {
        setPassword("password");
        reset();
        hide();
    }

    return ReactDOM.createPortal(
        <>
            {isShowing ?
                <React.Fragment>
                    <div className="modal-overlay" />
                    <div className="modal-wrapper" aria-modal aria-hidden tabIndex={-1} role="dialog">
                        <div className="modal">
                            <div className="modal__header">
                            {ssid} {status}
                            </div>
                            <div className="modal__body">
                                <div className="modal__body__form">
                                    <form onSubmit={handleSubmit}>
                                        <label>
                                            <input onClick={(e) => setPassword("")} onChange={(e) => setPassword(e.target.value)} value={password} type="password" name="password" id="password"/>
                                        </label>
                                        <div className="buttons">
                                        <input type="submit" value="Connect" className="button"/>
                                        <input type="button" value="Close" className="button" onClick={close}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
                : null
            }
        </>, document.getElementById("modal")
    );
};

export default Modal;