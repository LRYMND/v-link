import React from "react";
import { useState, useEffect } from "react";
import Settings from "../pages/settings/Settings"


const electron = window.require('electron');
const { ipcRenderer } = electron;

const Modal = ({ showModal }) => {

    function closeModal() {
        showModal(false);
    }

    return (
        <div className="modal" id="modal">
            Enter Wifi Password:
            <div class="content"></div>
            <div class="actions">
                <button onClick={closeModal()}></button>
                <button onClick={closeModal()}></button>
            </div>
        </div>
    );
};

export default Modal;