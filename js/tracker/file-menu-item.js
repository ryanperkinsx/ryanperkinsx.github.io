import { databases } from "../database.js";

class FileMenuItem extends HTMLElement {
    constructor() {
        super();  // always call super-duper
        this.attachShadow({mode: 'open'});
        this._metadata = null;
    }

    connectedCallback() {
        const { shadowRoot, id } = this;
        const fileName = id.replace("fmi-", "").replace("-menu-item", "");

        shadowRoot.innerHTML = `<style>
            .fmi-wrapper {
                border: 2px solid #ffffff;
                border-top: hidden;
                border-right: hidden;
                display: flex;
                justify-content: space-between;
                margin: 10px 8px;
                text-align: left;
            }
            .fmi-label {
                color: #ffffff;
                cursor: pointer;
                display: inline;
                font-size: small;
                margin: 0 8px 0 4px;
                overflow-x: scroll;
                text-align: left;
                width: 90%;
                user-select: none; /* Standard syntax */
                -webkit-user-select: none; /* Safari */
                -ms-user-select: none; /* IE 10 and IE 11 */
            }
            .fmi-label::-webkit-scrollbar {
                display: none;
            }
            .fmi-export {
                border-right: 0.09em solid #ffffff;
                border-top: 0.09em solid #ffffff;
                content: "";
                cursor: pointer;
                display: inline-block;
                height: 0.32em;
                margin: 2px 8px 0 0;
                position: relative;
                transform: rotate(135deg);
                width: 0.32em;
            }
            .fmi-remove {
                bottom: 1px;
                color: #ffffff;
                cursor: pointer;
                display: inline;
                font-size: medium;
                margin: 0 4px 0 0;
                position: relative;
            }
            .fmi-remove:after {
                content: "\\d7";
            }
        </style>
        <div class="fmi-wrapper">
            <p id="fmi-${fileName}-label" class="fmi-label">${fileName}</p>
            <div id="fmi-${fileName}-export" class="fmi-export"></div>
            <div id="fmi-${fileName}-remove" class="fmi-remove"></div>
        </div>`;

        shadowRoot.getElementById(`fmi-${fileName}-label`).addEventListener("click", this.handleLabelClick);
        shadowRoot.getElementById(`fmi-${fileName}-export`).addEventListener("click", this.handleExportClick);
        shadowRoot.getElementById(`fmi-${fileName}-remove`).addEventListener("click", this.handleRemoveClick);
        console.log(`${this.id}: added to the DOM.`);
    }

    disconnectedCallback() {
        const { shadowRoot } = this;
        const fileName = this.getAttribute("id").replace("fmi-", "");
        shadowRoot.getElementById(`fmi-${fileName}-label`).removeEventListener("click", this.handleLabelClick);
        shadowRoot.getElementById(`fmi-${fileName}-export`).removeEventListener("click", this.handleExportClick);
        shadowRoot.getElementById(`fmi-${fileName}-remove`).removeEventListener("click", this.handleRemoveClick);
        console.log(`${this.id}: removed from the the DOM.`);
    }

    handleLabelClick(event) {
        event.preventDefault();
        const fileDialog = document.getElementById("file-dialog");
        const fileName = this.getAttribute("id").replace("fmi-", "").replace("-label", "");
        fileDialog.setAttribute("fileName", fileName);
        fileDialog.style.display = "block";
    }

    handleExportClick(event) {
        event.preventDefault();
        console.log(`${this.id}: ya clicked me, boy!`);
    }  // TODO: export

    handleRemoveClick(event) {
        event.preventDefault();
        const fileMenuShadowRoot = document.getElementById("file-menu").shadowRoot;
        const fileName = this.id.replace("fmi-", "").replace("-remove", "");
        const wrapper = fileMenuShadowRoot.getElementById("fm-wrapper");
        wrapper.removeChild(fileMenuShadowRoot.getElementById(`fmi-${fileName}`));
        databases[fileName].close().then(() => {
            delete databases[fileName];
        }).catch((res) => {
            console.log(res);
            console.log(`${fileName}: unable to delete database.`);
        });
    }
}

// add to the registry
customElements.define("file-menu-item", FileMenuItem);