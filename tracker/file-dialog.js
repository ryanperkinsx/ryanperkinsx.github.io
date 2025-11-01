import { databases } from "./database.js";
import Util from "./util.js";

class FileDialog extends HTMLElement {
    static observedAttributes = ["style"];

    constructor() {
        super();  // always call super-duper
        this.attachShadow({mode: 'open'});
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const { id } = this;
        if (name === "style" && newValue === "display: block;") {
            console.log(`${id}: displaying dialog...`);
            this.fileName = this.getAttribute("filename");
            if (this.fileName) {
                // begin query: getTrainingBlockIdAndNames()
                databases[this.fileName].getTrainingBlockIdAndNames().then((data) => {
                    // begin loop
                    [...data].forEach((page) => {
                        // begin pagination loop
                        [...page.values].forEach((trainingBlock) => {
                            const trainingBlockId = trainingBlock[0];
                            const trainingBlockName = trainingBlock[1];
                            const option = document.createElement("option")
                            option.setAttribute("value", trainingBlockId);
                            option.textContent = trainingBlockName;
                            this.shadowRoot.getElementById("fd-tb-select").appendChild(option);
                            console.log(`fd-tb-select: "${trainingBlockName}" added as an option.`);
                        })
                        // end pagination loop
                    });
                    // end loop
                }).catch((res) => {
                    console.log(res);
                });
                // end query: getTrainingBlockIdAndNames()
            } else {
                console.log(`${id}: filename attribute is required to open!`)
            }
        }
        else if (name === "style" && newValue === "display: none;") {
            console.log(`${id}: closing dialog...`);
        }
    }

    connectedCallback() {
        const { shadowRoot } = this;
        shadowRoot.innerHTML = `<style>
            #fd-wrapper { 
                color: #ffffff;
                position: absolute;
                top: 50vh;
                left: 50vw;
                transform: translate(-50%, -50%);
                height: 700px;
                width: 1200px;
                background-color: rgb(0, 0, 0);
                border: 5px solid rgba(255, 255, 255, 1);
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 0 0;
                grid-template-areas:
                "tdd  tbm"
            }
            #fd-close {
                background-color: #000000;
                border: 2px solid rgba(255, 255, 255, 1);
                cursor: pointer;
                position: absolute;
                top: -12px;
                right: -12px;
                height: 24px;
                width: 24px;
            }
            #fd-close::after {
                color: #ffffff;
                content: "\\d7";
            }
            #fd-display {
                grid-area: tdd;
                overflow-x: scroll;
                overflow-y: scroll;
            }
            #fd-display::-webkit-scrollbar {
                display: none;
            }
            table {
                height: 100%;
                width: 100%;
                top: 0;
                position: relative;
            }
            table, th, td {
                color: inherit;
                border: 2px solid rgba(127, 255, 0, 0.7);
                border-collapse: collapse;  
            }
            th, td {
                width: 10%;
            }
            td {
                text-align: center;
            }
            #fd-menu {
                grid-area: tbm;
                border-left: 3px solid rgba(255, 255, 255, 1);
                display: grid;
                grid-template-columns: 1fr;
                grid-template-rows: 1fr 6fr 1fr 1fr 1fr;
                gap: 0 0;
                grid-template-areas:
                "sm"
                "uf"
                "aw"
                "rw"
                "eb";
            }
            #fd-tb-select {
                grid-area: sm;
                height: 30px;
                width: 90%;
                position: relative;
                top: 25px;
                justify-self: center;
            }
            
            /* form elements */
            #update-form {
                grid-area: uf;
                height: 30%;
                border: 3px solid #ffffff;
                margin: 10px 20px 0 20px;
                padding: 30px 0 0 0;
                display: grid;
                grid-template-columns: 1fr .2fr 2fr;
                grid-template-rows: 30px 30px 30px 30px;
                gap: 5px 0;
                grid-template-areas:
                "wl    wc    wi"
                "dgs   dgc   dgi"
                "ml    mc    mi"
                "sb    sb    sb";
                place-items: center;
            }
            .uf-label { }
            .uf-label.week {
                grid-area: wl;
            }
            .uf-label.mile {
                grid-area: ml;
            }
            select {
                font-family: inherit;
                background: inherit;
                color: inherit;
                height: 25px;
                width: 65px;
                font-size: medium;
            }
            #uf-dg-select {
                grid-area: dgs;
            }
            .uf-colon { }
            .uf-colon.week {
                grid-area: wc;
            }
            .uf-colon.dg {
                grid-area: dgc;
            }
            .uf-colon.mile {
                grid-area: mc;
            }
            p {
                margin: 0;
                text-align: center;
            }
            .uf-input { }
            .uf-input.week {
                grid-area: wi;
            }
            .uf-input.dg {
                grid-area: dgi;
            }
            .uf-input.mile {
                grid-area: mi;
            }
            button {
                grid-area: sb;
                width: 40%;
                height: 25px;
                justify-self: center;
                background: inherit;
                color: inherit;
                font-family: inherit;
                border: 2px solid #ffffff;
            }
            button:disabled {
                opacity: 25%;
            }
            button:enabled:hover {
                background: #ffffff;
                color: #000000;
                border: 2px solid #000000;
            }
            #uf-submit {
                grid-area: sb;
            }
            #fd-add-week {
                grid-area: aw;
            }
            #fd-remove-week {
                grid-area: rw;
            }
            #fd-export {
                grid-area: eb;
            }
        </style>
        <div id="fd-wrapper">
            <button id="fd-close"></button>
            <div id="fd-display">
                <table id="fd-table">
                    <thead>
                        <tr>
                            <th> Week # </th>
                            <th> Day 1 </th>
                            <th> Day 2 </th>
                            <th> Day 3 </th>
                            <th> Day 4 </th>
                            <th> Day 5 </th>
                            <th> Day 6 </th>
                            <th> Day 7 </th>
                            <th> Total </th>
                            <th> Goal </th>
                        </tr>
                    </thead>
                    <tbody id="fd-table-body">
                </table> 
            </div>
            <div id="fd-menu">
                <select id="fd-tb-select">
                    <option id="fd-tb-select-default" value="" selected disabled> - </option>
                </select>
                <form id="update-form">
                    <label class="uf-label week" for="week">Week</label>
                    <p class="uf-colon week">:</p>
                    <input id="uf-input-week" class="uf-input week" type="number" name="week" required disabled>
                    <select id="uf-dg-select" required disabled>
                        <option value="day" selected> Day </option>
                        <option value="goal"> Goal </option>
                    </select>
                    <p id="uf-dg-colon">:</p>
                    <input id="uf-input-dg" type="number" name="day" required disabled>
                    <label id="uf-mile-label" for="miles">Miles</label>
                    <p id="uf-mile-colon">:</p>
                    <input id="uf-input-mile" type="number" name="miles" required disabled>
                    <button id="uf-submit" type="submit" disabled>Update</button>
                </form>
                <button id="fd-add-week" disabled>+ Add Week</button>
                <button id="fd-remove-week" disabled>- Remove Week</button>
                <button id="fd-export" disabled>Export</button>
            </div>
        </div>`;

        shadowRoot.getElementById("fd-close").addEventListener("click", this.handleCloseClick);
        shadowRoot.getElementById("fd-tb-select").addEventListener("change", this.handleSelectChange);
        shadowRoot.getElementById("update-form").addEventListener("submit", this.handleUpdateFormSubmit);
        shadowRoot.getElementById("fd-add-week").addEventListener("click", this.handleAddWeekClick);
        shadowRoot.getElementById("fd-remove-week").addEventListener("click", this.handleRemoveWeekClick);
        shadowRoot.getElementById("fd-export").addEventListener("click", this.handleExportClick);
        console.log(`${this.id}: added to the DOM.`)

        // TODO: add/remove week buttons
        // TODO: make prettier
    }

    disconnectedCallback() {
        const { shadowRoot } = this;
        shadowRoot.getElementById("fd-close").removeEventListener("click", this.handleCloseClick);
        shadowRoot.getElementById("fd-tb-select").removeEventListener("change", this.handleSelectChange);
        shadowRoot.getElementById("update-form").removeEventListener("submit", this.handleUpdateFormSubmit);
        shadowRoot.getElementById("fd-export").removeEventListener("click", this.handleExportClick);
        shadowRoot.getElementById("fd-remove-week").removeEventListener("click", this.handleRemoveWeekClick);
        shadowRoot.getElementById("fd-add-week").removeEventListener("click", this.handleAddWeekClick);

        console.log(`${this.id}: removed from the the DOM.`)
    }

    async handleAddWeekClick(event) {
        const fileDialog = document.getElementById("file-dialog");
        const fileName = fileDialog.getAttribute("filename");
        const tableBody = fileDialog.shadowRoot.getElementById("fd-table-body");
        const db = databases[fileName];
        let __date, lastWeekId, newWeekId, newWeekNumber, row, cell;

        // begin query getLastWeekByTrainingBlockId()
        await db.getLastWeekByTrainingBlockId(db._activeTrainingBlockId).then((data) => {
            lastWeekId = data[0]["values"][0][0];  // week.week_id
            newWeekNumber = Number(data[0]["values"][0][1]) + 1;  // week.week_number
        }).catch((res) => {
            console.log(res);
        });  // end query getLastWeekByTrainingBlockId()

        if (lastWeekId && newWeekNumber) {

            // begin query addWeek()
            await db.addWeek(db._activeTrainingBlockId, newWeekNumber).then((data) => {
                newWeekId = data;
                console.log(`${fileName}: +1 week.`)
            }).catch((res) => {
                console.log(res);
            });  // end query addWeek()

            // create week element
            row = document.createElement("tr");
            row.id = newWeekId;
            cell = document.createElement("td");  // week.week_number cell
            cell.id = `${newWeekId}-number`;
            cell.textContent = newWeekNumber;
            row.appendChild(cell);

            // begin query getDayByWeekIdAndDayNumber()
            await db.getDayByWeekIdAndDayNumber(lastWeekId, 7).then((data) => {
                __date = new Date(data[0]["values"][0][1]);
            }).catch((res) => {
                console.log(res);
            });  // end query getDayByWeekIdAndDayNumber()

            for (let i = 0; i < 7; i++) {
                __date.setDate(__date.getDate() + 1);

                // begin query addDay()
                await db.addDay(db._activeTrainingBlockId, newWeekId, __date.toISOString().substring(0, 10), i + 1).then((data) => {
                    // create day element
                    cell = document.createElement("td");  // day.miles cell
                    cell.id = data;
                    cell.textContent = "0";
                    row.appendChild(cell);
                    console.log(`${fileName}: +1 day.`)
                }).catch((res) => {
                    console.log(res);
                });  // end query addDay()
            }  // end for loop

            // create total and goal elements
            cell = document.createElement("td");
            cell.id = `${newWeekId}-miles`;
            cell.textContent = "0";
            row.appendChild(cell);
            cell = document.createElement("td");
            cell.id = `${newWeekId}-goal`;
            cell.textContent = "0";
            row.appendChild(cell);
            tableBody.appendChild(row);
        }  // end if
    }

    async handleRemoveWeekClick(event) {
        const fileDialog = document.getElementById("file-dialog");
        const fileName = fileDialog.getAttribute("filename");
        const tableBody = fileDialog.shadowRoot.getElementById("fd-table-body");
        const db = databases[fileName];
        let lastWeekId, dayId;

        // begin query getLastWeekByTrainingBlockId()
        await db.getLastWeekByTrainingBlockId(db._activeTrainingBlockId).then((data) => {
            lastWeekId = data[0]["values"][0][0];  // week.week_id
        }).catch((res) => {
            console.log(res);
        });  // end query getLastWeekByTrainingBlockId()

        if (lastWeekId) {

            // begin query getDayByWeekIdAndDayNumber()
            await db.getDaysByWeekId(lastWeekId).then((dayData) => {
                // begin outer loop
                [...dayData].forEach((dayPage) => {
                    // begin outer pagination loop
                    [...dayPage.values].forEach((day) => {
                        // begin query removeDayById()
                        db.removeDayById(day[0]).then(() => {
                            console.log(`${fileName}: -1 day.`)
                        }).catch((res) => {
                            console.log(res);
                        });  // end query removeDayById()

                    });
                });
            }).catch((res) => {
                console.log(res);
            });  // end query getDayByWeekIdAndDayNumber()

            // begin query removeWeekById()
            await db.removeWeekById(lastWeekId).then(() => {
                console.log(`${fileName}: -1 week.`)
            }).catch((res) => {
                console.log(res);
            });  // end query removeWeekById()

            console.log(lastWeekId);
            console.log(fileDialog.shadowRoot.getElementById(lastWeekId));

            tableBody.removeChild(fileDialog.shadowRoot.getElementById(lastWeekId));
        }  // end if
    }

    handleCloseClick(event) {
        const fileDialog = document.getElementById(`file-dialog`);

        // reset training block select
        fileDialog.shadowRoot.getElementById("fd-tb-select").value = "";
        Util.clearElements(fileDialog.shadowRoot, "fd-tb-select", "option", "fd-tb-select-default");

        // clear the table
        Util.clearElements(fileDialog.shadowRoot, "fd-table-body", "tr");

        // disable the form
        Util.disableFormElements(fileDialog.shadowRoot, [
            "fd-add-week",
            "fd-remove-week",
            "fd-export",
            "uf-input-week",
            "uf-dg-select",
            "uf-input-dg",
            "uf-input-mile",
            "uf-submit"
        ]);

        // hide the dialog
        fileDialog.style.display = "none";
        fileDialog.removeAttribute("filename");
    }

    handleExportClick(event) {
        const fileDialog = document.getElementById("file-dialog");
        const fileName = fileDialog.getAttribute("filename");
        const db = databases[fileName];
        db.exportDb().then(() => {
            console.log(`${fileName}: exported.`)
        }).catch((res) => {
            console.log(`${fileName}: error while exporting!`)
            console.log(res)
        });
    }

    async handleSelectChange(event) {
        const fileDialog = document.getElementById("file-dialog");
        const fileName = fileDialog.getAttribute("filename");
        const db = databases[fileName];
        const tableBody = fileDialog.shadowRoot.getElementById("fd-table-body");
        const trainingBlockId = this.value;
        let row, cell, totalMiles, weekId, weekNumber, weekGoal, dayId, dayMiles;  // reusable loop variables

        // clean up fd-table-body
        Util.clearElements(fileDialog.shadowRoot, "fd-table-body", "tr");

        // update the active training block ID
        db._activeTrainingBlockId = trainingBlockId;

        // begin query getWeeksByTrainingBlockId()
        await db.getWeeksByTrainingBlockId(trainingBlockId).then((trainingBlockData) => {
            // begin outer loop
            [...trainingBlockData].forEach((trainingBlockPage) => {
                // begin outer pagination loop
                [...trainingBlockPage.values].forEach((week) => {
                    // begin query getDaysByWeekId()
                    db.getDaysByWeekId(week[0]).then((weekData) => {  // week[0] = week.week_id
                        // begin inner loop
                        [...weekData].forEach((weekPage) => {
                            weekId = week[0];
                            weekGoal = week[1];
                            weekNumber = week[3];

                            row = document.createElement("tr");
                            row.id = weekId;
                            cell = document.createElement("td");  // week.week_number cell
                            cell.id = `${weekId}-number`;
                            cell.textContent = weekNumber;
                            row.appendChild(cell);
                            totalMiles = 0; // reset

                            // begin inner pagination loop
                            [...weekPage.values].forEach((day) => {
                                // TODO: highlight today's day
                                dayId = day[0];
                                dayMiles = day[3];
                                totalMiles += dayMiles;
                                cell = document.createElement("td");  // day.miles cell
                                cell.id = dayId;
                                cell.textContent = dayMiles;
                                row.appendChild(cell);
                            });  // end inner pagination loop

                            cell = document.createElement("td");  // total day.miles cell
                            cell.id = `${weekId}-miles`;
                            cell.textContent = totalMiles;
                            row.appendChild(cell);
                            cell = document.createElement("td");  // week.goal cell
                            cell.id = `${weekId}-goal`;
                            cell.textContent = weekGoal;
                            row.appendChild(cell);
                            tableBody.appendChild(row);
                        });  // end inner loop
                    });  // end query: getDaysByWeekId()
                });  // end outer pagination loop
            });  // end outer loop

            // enable the form and management buttons
            Util.enableFormElements(fileDialog.shadowRoot, [
                "fd-add-week",
                "fd-remove-week",
                "fd-export",
                "uf-input-week",
                "uf-dg-select",
                "uf-input-dg",
                "uf-input-mile",
                "uf-submit"
            ]);
        }).catch((res) => {
            console.log(res);
        });  // end query: getWeeksByTrainingBlockId()
    }

    async handleUpdateFormSubmit(event) {
        event.preventDefault();
        const fileName = document.getElementById("file-dialog").getAttribute("filename");
        const db = databases[fileName];
        const data = new FormData(this);
        const weekNumber = Number(data.get("week"));
        const dayNumber = Number(data.get("day"));
        const miles = Number(data.get("miles"));
        let weekId, dayId;  // reusable loop variables

        // begin query getWeeksByTrainingBlockId()
        await db.getWeeksByTrainingBlockId(db._activeTrainingBlockId).then((data) => {
            // begin data loop
            [...data].forEach((pages) => {
                // begin pagination loop
                [...pages.values].forEach((week) => {
                    if (week[3] === weekNumber) {  // week[3] = week.week_number
                        weekId = week[0];  // week[0] = week.week_id
                        console.log(weekId);
                        throw "week ID found.";
                    }
                });  // end pagination loop
            });  // end loop
            console.log("week ID not found.")
        }).catch((res) => {
            console.log(res);
        });  // end query getWeeksByTrainingBlockId()

        if (weekId) {
            // begin query getDaysByWeekId()
            await db.getDaysByWeekId(weekId).then((data) => {
                // begin data loop
                [...data].forEach((pages) => {
                    // begin pagination loop
                    [...pages.values].forEach((day) => {
                        if (day[2] === dayNumber) {  // day[2] = day.day_number
                            dayId = day[0];  // day[0] = day.day_id
                            throw "day ID found.";
                        }
                    });  // end pagination loop
                });  // end data loop
                console.log("day ID not found.")
            }).catch((res) => {
                console.log(res);
            }); // end query getDaysByWeekId()
        }

        if (dayId) {
            // begin query updateMilesByDayId()
            await db.updateMilesByDayId(miles, dayId).then(() => {
                [...this.getElementsByTagName("input")].forEach((item) => {
                    item.value = "";
                });

                // elements to update
                const fileDialog = document.getElementById("file-dialog").shadowRoot;
                const dayCell = fileDialog.getElementById(dayId);
                const totalMilesCell = fileDialog.getElementById(`${weekId}-miles`);

                // some math
                const prevMiles = Number(dayCell.textContent);
                const prevTotal = Number(totalMilesCell.textContent);
                const newTotal = String(prevTotal - prevMiles + miles);

                // update
                dayCell.textContent = String(miles);
                totalMilesCell.textContent = String(newTotal);
                console.log(`week: ${weekNumber}, day: ${dayNumber} updated to ${miles} miles.`);
            }).catch((res) => {
                console.log(res);
            });  // end query updateMilesByDayId()
        }
    }
}

// add to the registry
customElements.define("file-dialog", FileDialog);