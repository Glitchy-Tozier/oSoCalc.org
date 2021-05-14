function main() {
    // Calculate and output the cossts of the two software-solutions.

    let alertParent = document.getElementById("alertParent"); // Remove the "URL was imported"-alert if there is one.
    if (alertParent !== null) {
        alertParent.remove();
    }

    let form = document.getElementById("calcInput");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let oldSoftwareCost = getCostNum("oldCost"); // Get input from HTML form
    let newSoftwareCost = getCostNum("newCost");

    let nrEmployees = getNrNum("nrEmployees");
    let employeeCost = getCostNum("employeeCost");
    let programmerCost = getCostNum("programmerCost");

    let nrCurrentProgrammers = getNrNum("nrCurrentProgrammers");
    let nrFutureProgrammers = getNrNum("nrFutureProgrammers");


    oldSoftwareCost *= getRadioValue("oldCostPeriod"); // Turn all costs into their yearly equivalents (multiply monthly costs by 12)
    newSoftwareCost *= getRadioValue("newCostPeriod");
    employeeCost *= getRadioValue("eCostPeriod");
    programmerCost *= getRadioValue("pCostPeriod");

    oldSoftwareCost *= nrEmployees; // Get the total cost you pay for the commercial software
    newSoftwareCost *= nrEmployees; // Get the total cost you pay for the commercial software
    employeeCost *= nrEmployees; // Get the total cost you pay to your Employees


    const maxYears = 20;
    const displayYears = [1,2,3,5,10,20];


    const oldCost = calcCost(oldSoftwareCost, programmerCost, nrCurrentProgrammers, maxYears);
    writeCostSummaryLine("Old yearly cost: ", oldCost[0], true);

    const newYearlyCost = calcCost(newSoftwareCost, programmerCost, nrFutureProgrammers, maxYears);
    writeCostSummaryLine("New yearly cost: ", newYearlyCost[0]);

    const newCost = addOneTimeCost(newYearlyCost, employeeCost, programmerCost);
    // The one-time cost gets added INSIDE the addOneTimeCost()-function. This is where the last "writeCostSummaryLine()" can be found.


    outputResults(oldCost, newCost, displayYears);
}

function getCostNum(id) {
    // This small function fetches the input corrects common errors and returns a properly formatted number.
    // It is only used for input-fields that ask the user to input an amount of money.
    // Input the input-form's ID

    let inputField = document.getElementById(id)
    let input = inputField.value;

    input = input.replace(",", ".");

    while (input.includes(" ")) {
        input = input.replace(" ", "");
    }

    const currencySymbols = ["$","€","¢","¥","£","¤"];
    for (let i=0; i<currencySymbols.length; i++) {
        input = input.replace(currencySymbols[i], "");
    }


    if (isNaN(Number(input))) {
        inputField.focus();
        let message = "Please check for errors when inputting costs. Please do not use multiple periods or commas.<br><br>";
        message += 'The problem was detected in the input "<b>' + encodeHTML(input) + '</b>".';
        createError(message);
    }
    else if (input.toString().includes("e+")) {
        inputField.focus();
        let message = "Please input smaller numbers.";
        createError(message);
    }
    else {
        input = Number(input);
        return input;
    }
}

function getNrNum(id) {
    // This small function fetches an input and corrects common errors before returning the number.
    // It is used for all number-input-fields that do not ask for monetary amounts
    // Input the input-form's ID

    let inputField = document.getElementById(id); // Get value by id
    let input = inputField.value;


    while (input.includes(",")) {
        input = input.replace(",", "");
    }

    while (input.includes(".")) {
        input = input.replace(".", "");
    }

    while (input.includes(" ")) {
        input = input.replace(" ", "");
    }


    if (isNaN(Number(input))) {
        inputField.focus();
        let message = "Please check for errors when inputting numbers. Did you accidentally use letters or special symbols?<br><br>";
        message += 'The problem was detected in the input "<b>' + encodeHTML(input) + '</b>".'
        createError(message);
    }
    else if (input.toString().includes("e+")) {
        inputField.focus();
        let message = "Please input smaller numbers.";
        createError(message);
    }
    else {
        input = Number(input);
        return input;
    }
}

function getRadioValue(name) {
    // Input name of radio group.
    // Returns the pressed radiobutton's value.

    const radioArray = document.getElementsByName(name);

    for (let i = 0; i < radioArray.length; i++) {
        if (radioArray[i].checked == true) {
            return radioArray[i].value;
        }
    }
}

function encodeHTML(data) {
    // HTML-encodes some input and returns it.
    let encodedElement = document.createElement("e");
    encodedElement.innerText = data;
    return encodedElement.innerHTML;
}

let globalErrorToast = null;
function createError(message) {
    // Remove the share-URL-field.
    removeUrlField();

    // Prevent some bootstrap-specific errors:
    if (globalErrorToast !== null)
        globalErrorToast.dispose();

    // Complain to the user.
    let toastBody = document.getElementById("errorToastBody");
    toastBody.innerHTML = message;

    let toastDiv = document.getElementById("errorToast")
    globalErrorToast = new bootstrap.Toast(toastDiv);
    globalErrorToast.show()

    // Stops execution.
    throw new Error(message);
}

function calcCost(softwareCost, programmerCost, nrMaintananceProgrammers, maxYears) {
    // Calculates the recurring (yearly) accumulated cost for a software solution.
    // Returns those costs for the years specified in the "maxYears"-constant.

    const maintananceCost = programmerCost * nrMaintananceProgrammers;
    const yearlyCost = maintananceCost + softwareCost;

    let cost = [];
    for (let i=0; i<maxYears; i++) {
        cost.push(yearlyCost * (i+1));
    }

    return cost;
}

function addOneTimeCost(cost, employeeCost, programmerCost) {
    // Calculates setup- and training-costs, which only need to payed once.
    // Then add those costs to the (possibly) new solution.

    // Training cost
    const workingDays = 265;
    const employeeDailySalary = employeeCost / workingDays; // What ALL your employees cost you each day
    const daysOfInactivity = getNrNum("trainingInactivity"); // Assume your employees are COMPLETELY INACTIVE for some time-period due to training and inefficiently with the new software.
    const employeeTrainingCost =  employeeDailySalary * daysOfInactivity; // What inactivity will cost you.

    // Setup cost
    const monthlyProgrammerCost = programmerCost/12;
    const setupProgrammerCount = getNrNum("nrSetupProgrammers"); // Number of programmers needed to initially implement the new solution
    const setupMonthCount = getNrNum("nrSetupMonths"); // Number of months those Programmers work on that implementation
    const setupCost = monthlyProgrammerCost * setupProgrammerCount * setupMonthCount; // What the initial setup will cost you.

    const oneTimeCost = employeeTrainingCost + setupCost; // Full one-time cost

    for (let i=0; i<cost.length; i++) { // Add the one-time cost to the yearly costs.
        cost[i] += oneTimeCost;
    }

    writeCostSummaryLine("One-time switching cost: ", oneTimeCost);

    return cost
}

function writeCostSummaryLine(name, cost, deleteContents) {
    // Add a line to the div under the "summary"-heading in the "results"-section.

    nameDiv = document.getElementById("summaryName");
    costDiv = document.getElementById("summaryCost");

    if (deleteContents) {
        nameDiv.innerHTML = ""; // Clean up the previous summary.
        costDiv.innerHTML = "";
    }

    nameLine = document.createElement("p"); // Create and add the name-part of the line
    nameTextNode = document.createTextNode(name);

    nameLine.appendChild(nameTextNode);
    nameDiv.appendChild(nameLine);


    const costStr = Math.round(cost).toString(); // Make the cost look a little better.
    const nrDigits = costStr.length;
    let fullStr = "";
    for (let cycleNr = 1; cycleNr <= nrDigits; cycleNr++) {
        let currentLetter = costStr[nrDigits - cycleNr]; // Go through the whole string, starting from the back and working towarts the "front" of the number.
        fullStr = currentLetter + fullStr;
        if ((cycleNr%3==0) && (cycleNr>1) && (cycleNr<nrDigits)) {
            fullStr = "," + fullStr;
        }
    }
    costLine = document.createElement("p"); // Create and add the cost-part of the line
    costTextNode = document.createTextNode(fullStr);

    costLine.appendChild(costTextNode);
    costDiv.appendChild(costLine);
}

function outputResults(oldCost, newCost, tableYears) {
    // This function first prepares the values for output and then outputs them.

    let oldName = document.getElementById("oldName").value; // Set the title
    oldName = encodeHTML(oldName);
    let newName = document.getElementById("newName").value;
    newName = encodeHTML(newName);
    const title = "<strong>" + oldName + "</strong> vs <strong>" + newName + "</strong>";
    document.getElementById("resTitle").innerHTML = title;


    const prettyCostObj = prepareTableData(oldCost, newCost); // Prettify the cost-arrays and get their modifier text (for example, "M" for million)
    const prettyOldCost = prettyCostObj["prettyOldCost"];
    const prettyNewCost = prettyCostObj["prettyNewCost"];
    const savedMoney = prettyCostObj["savedMoney"];
    const turningPoint = prettyCostObj["turningPoint"];

    const table = createTable(oldName, newName, prettyOldCost, prettyNewCost, savedMoney, turningPoint, tableYears);


    const graphConfig = createGraph(oldName, newName, oldCost, newCost);

    const message = createMessage(oldName, newName, turningPoint);


    if (document.getElementById("notingYetCalculated")) { // Remove the "Calculation wasn't started yet"-section
        document.getElementById("notingYetCalculated").remove();
    }

    let outputDiv = document.getElementById("results-section");

    if (outputDiv.classList.contains("invisible")) { // Make the results-section visible
        outputDiv.classList.remove("invisible");
    }

    tableDiv = document.getElementById("tableDiv"); // Add the table to the DOM
    tableDiv.innerHTML = table;

    chartDiv = document.getElementById("chartDiv"); // Add the chart/graph to the DOM
    if (document.getElementById("chartCanvas")) {
        document.getElementById("chartCanvas").remove();
    }
    let chartCanvas = document.createElement("canvas");
    chartCanvas.id = "chartCanvas";
    new Chart(chartCanvas, graphConfig);
    chartDiv.appendChild(chartCanvas);

    messageDiv = document.getElementById("worthSwitchingDiv"); // Add the "sholud you switch?" Reply to the DOM
    messageDiv.innerHTML = message;


    document.getElementById("resSecBtn").click(); // Switch to the section where the results will be displayed.
}

function prepareTableData(oldCost, newCost) {
    // This Function prettyfies the costs so that they can be displayed properly.

    let prettyOldCost = [];
    let prettyNewCost = [];
    let savedMoney = [];
    let turningPoint;

    for (let i=0; i<oldCost.length; i++) { // Go through every element of the cost-arrays.

        let oldCost_i = oldCost[i];
        let newCost_i = newCost[i];
        let savedMoney_i = oldCost_i - newCost_i; // Prepare the variable "savedMoney"

        // Check which year the new solution first is worthwile (and see if there even is such a year).
        if ((oldCost_i > newCost_i) && turningPoint == undefined) {
            const yearNumber = i+1;
            turningPoint = yearNumber;
        }

        let number = 0;
        let numberString = "";
        if (oldCost_i < newCost_i) { // Canculate how many blocks of 3 digits we can cut. Do so according to the smaller of the two cell values.
            number = Math.round(oldCost_i)
            numberString += number.toString();

            if (newCost_i.toString().includes("e+")) { // Chech whether the larger number is within an acceptable range.
                createError("Numbers are too large. (They got bigger than 10^20)")
            }
        } else {
            number = Math.round(newCost_i)
            numberString += number.toString();

            if (oldCost_i.toString().includes("e+")) { // Chech whether the larger number is within an acceptable range.
                createError("Numbers are too large. (They got bigger than 10^20)")
            }
        }

        let nrDigits = numberString.length;
        let digitsToCut = Math.floor(nrDigits/3) * 3;

        let modifierText = "";
        switch(digitsToCut) { // Get the text that should be displayed in the HTML-table.
            case 0:
                modifierText = "¤";
                break;
            case 3:
                modifierText = "¤";
                digitsToCut = 0;
                break;
            case 6:
                modifierText = "M";
                break;
            case 9:
                modifierText = "B";
                break;
            case 12:
                modifierText = "T";
                break;
            default:
                modifierText = "x10^" + digitsToCut;
        }


        let prettyOldCost_i = numberToPrettyString(oldCost_i, digitsToCut, modifierText); // Turn the cost into a pretty string.
        prettyOldCost.push(prettyOldCost_i); // Save result

        let prettyNewCost_i = numberToPrettyString(newCost_i, digitsToCut, modifierText); // Turn the cost into a pretty string.
        prettyNewCost.push(prettyNewCost_i); // Save result

        let prettySavedMoney_i = numberToPrettyString(savedMoney_i, digitsToCut, modifierText); // Turn the cost into a pretty string.
        savedMoney.push(prettySavedMoney_i); // Save result
    }


    return {
        prettyOldCost: prettyOldCost,
        prettyNewCost: prettyNewCost,
        savedMoney: savedMoney,
        turningPoint: turningPoint,
    }
}

function numberToPrettyString(number, digitsToCut, modifierText) {
    // Make the number shorter (according to "digitsToCut"), round it and make sure that it has two digits after the comma.
    number /= Math.pow(10, digitsToCut); // Cut digits
    number *= 100; // Prepare rounding
    number = Math.round(number); // Round
    number /= 100; // Finish rounding

    number = number.toString();
    splitNumber = number.split("."); // Make sure that the string always has TWO digits after the comma.

    if (splitNumber.length == 1) {
        number += ".00";
    } else {
        if (splitNumber[1].length < 2) {
            number += "0";
        }
    }
    number += " " + modifierText;
    return number;
}

function createTable(oldName, newName, oldCost, newCost, savedMoney, turningPoint, tableYears) {
    // This function creates (and returns) the string for the displayed HTML-table.
    // It also creates (and returns) the year where the new Solution starts being worthwile.
    let table = `
    <table class="table">
        <thead style="text-align: center;">
            <tr>
                <th scope="col" class="col-auto">Time passed</th>
                <th scope="col" class="col-auto">` + oldName + `</th>
                <th scope="col" class="col-auto">` + newName + `</th>
                <th scope="col" class="col-auto">Worth switching?</th>
            </tr>
        </thead>
        <tbody>`;

    for (let i=0; i<oldCost.length; i++) { // Create all the table rows
        let yearNumber = i+1;
        if (tableYears.includes(yearNumber)) { // Only display the values for the "tableYears"-years in the table

            let diffClass = ""; // Prepare the dynamic styles for some of the cells.
            let activityClass = "";
            if (turningPoint !== undefined) {
                if (yearNumber < turningPoint) { // If the new solution is more expensive in the current year, make the field red.
                    diffClass = "table-danger";
                } else {
                    diffClass = "table-success"; // Otherwhise style it green and make the year "active".
                    activityClass += 'class="table-active"';
                }
            } else {
                diffClass = "table-danger";
            }

            let yearStr = "";
            if (yearNumber == 1) {yearStr = "year" // Get the gramatically correct form of "year"
            } else {
                yearStr = "years";
            }

            table += `
            <tr>
                <td scope="row" ` + activityClass + `>After ` + yearNumber + " " + yearStr + `:</td>
                <td style="text-align: right;">` + oldCost[i] + `</td>
                <td style="text-align: right;">` + newCost[i] + `</td>
                <td style="text-align: right;" class="` + diffClass + `">` + savedMoney[i] + `</td>
            </tr>`;
        }
    }
    table += "</tbody>  </table>";

    return table;
}

function createGraph(oldName, newName, oldCost, newCost) {
    // Prepare everything needed to output the graph/chart

    let labels = [];
    for (let i = 0; i < oldCost.length; i++) {
        if ( true ) {//(i + 1) % 2 == 0 ) {
            labels.push(i+1);
        } else {
            labels.push([]);
        }
        oldCost[i] = Math.round(oldCost[i]);
        newCost[i] = Math.round(newCost[i]);
    }


    const data = {
        labels: labels,
        datasets: [
            {
                label: oldName,
                borderColor: "black",
                backgroundColor: "gray",
                radius: 0,
                /* fill: {
                    target: +1,
                    above: "#d1e7dd",
                    below: "#f8d7da",
                },
                fillColor: "green",*/
                data: oldCost,
            }, {
                label: newName,
                borderColor: "darkorange",
                backgroundColor: "orange",
                radius: 0,
                data: newCost,
            }
        ]
    };


    const config = {
        type: "line",
        data,
        options: {
            interaction: {
                mode: "index",
                intersect: false,
            },
            maintainAspectRatio: false, // Makes sure the graph doesn't shrink down due the surrounding div's small width.
            scales: {
                x: { title: {
                        display: true,
                        text: "Years passed",
                    }
                },
                y: { title: {
                        display: true,
                        text: "Money spent",
                    }
                }
            }
        }
    };

    return config;
}

function createMessage(oldName, newName, turningPoint) {
    // Create the text-version of the results and return it.

    let message = "<h3>So is it worth switching?</h3>";

    if (turningPoint > 0) {
        if (turningPoint == 1) {
            message += '<p style="text-align: center">Financially speaking, <strong>yes</strong>, you should switch from ' + oldName + " to " + newName + ".</p>";
        } else {
            message += '<p style="text-align: center">Financially speaking, you should switch from, ' + oldName + " to " + newName + " <strong>if you're planning ahead at least " + turningPoint + " Years</strong>.</p>";
        }
    } else {
        message += '<p style="text-align: center">Financially speaking, you <strong>should not switch</strong> from ' + oldName + " to " + newName + ".</p>";
    }

    return message;
}





function prepareToShare (placementNumber) {
    // Create and output an URL that contains the values inserted into the form.

    let alertParent = document.getElementById("alertParent"); // Remove the "URL was imported"-alert if there is one.
    if (alertParent !== null) {
        alertParent.remove();
    }

    let form = document.getElementById("calcInput"); // Make Sure the form is actually filled out.
    if (!form.checkValidity()) { // If it's not...
        removeUrlField() // 1. Don't display URL-field anymore.
        form.reportValidity(); // 2. Complain to the user.
        return;
    }


    newURL = createNewURL(); // Create a new url using the current URL and the form inputs.

    const mailtoID = "mailto" + placementNumber;
    let mailtoLink = document.getElementById(mailtoID);
    mailtoLink.href = "mailto:?body=" + newURL;

    const linkDivID = "linkDiv" + placementNumber;
    outputURL(newURL, linkDivID);
}

function createNewURL() {
    // Create a new url using the current URL and the form inputs.

    const currentURL = window.location.href;
    const splitURL = currentURL.split("?");
    const baseURL = splitURL[0]

    const paramTypes = ["l", "l", "r", "l", "l", "l", "r", "l", "l", "l", "r", "l", "r", "l", "l", "l"]; // Add an "r" in front of the radio-values!! Otherwhise, add an "l".
    const paramValues = [
        document.getElementById("oldName").value,
        getCostNum("oldCost").toString(),
        getCheckedRadioId("oldCostPeriod").toString(), // radio
        getNrNum("nrCurrentProgrammers").toString(),


        document.getElementById("newName").value,
        getCostNum("newCost").toString(),
        getCheckedRadioId("newCostPeriod").toString(), // radio
        getNrNum("nrFutureProgrammers").toString(),


        getNrNum("nrEmployees").toString(),
        getCostNum("employeeCost").toString(),
        getCheckedRadioId("eCostPeriod").toString(), // radio
        getCostNum("programmerCost").toString(),
        getCheckedRadioId("pCostPeriod").toString(), // radio

        getNrNum("trainingInactivity").toString(),
        getNrNum("nrSetupProgrammers").toString(),
        getNrNum("nrSetupMonths").toString(),
    ]

    let paramString = "?";

    let paramName = "";
    let paramValue = "";
    let textFieldCount = 0;
    let radioCount = 0;
    for (let i=0; i<paramValues.length; i++) {

        if (paramTypes[i] == "l") {
            paramName = paramTypes[i] + textFieldCount;
            textFieldCount ++;
        } else {
            paramName = paramTypes[i] + radioCount;
            radioCount ++;
        }

        paramValue = encodeURIComponent(paramValues[i]);
        paramString += paramName + "=" + paramValue;

        if (i<paramValues.length-1) {
            paramString += "&";
        }
    }

    const url = baseURL + paramString;

    return url;
}

function getCheckedRadioId(radioGroupName) {
    // Input name of radio button input group
    // Outputs ID of the checked radio button

    const radioArray = document.getElementsByName(radioGroupName); // Get group of radio buttons

    for (let i = 0; i < radioArray.length; i++) { // Search and return the checked one.
        if (radioArray[i].checked == true) {
            return radioArray[i].id;
        }
    }
}

function outputURL(url, linkDivID) {
    // Outputs the url(which contains the parameters) so that the user can copy it.

    // window.history.pushState("object or string", "Title", url); // Display the URL in the URL-bar.

    let oldLinkP = document.getElementById("linkP");

    let newLinkDiv = document.getElementById(linkDivID);


    if (oldLinkP !== null) { // If the URL was already output at least once...

        let oldLinkDiv = oldLinkP.parentElement;
        if (oldLinkDiv == newLinkDiv) { // If it's the same Location as before...

            oldLinkP.innerHTML = ""; // replace the previous url
            let text = document.createTextNode(url)
            oldLinkP.appendChild(text)

        } else { // If it's a different Location than before...
            removeUrlField() // Remove the previous URL-div
            createNewUrlOutput(url, newLinkDiv);
        }


    } else { // If the URL never has been output before:
        createNewUrlOutput(url, newLinkDiv);
    }

}

function removeUrlField() {
    // This function removes the current url-display-field by deleting some parts and making others invisible.
    // If there is no element called "linkP", do nothing.

    let linkP = document.getElementById("linkP");
    if (linkP !== null) {
        let linkDivParent = linkP.parentElement.parentElement;
        linkDivParent.classList.add("invisible"); // Make the overarching parent invisible ...
        linkP.remove(); // and remove the previous the previous URL-section (=linkP).
    }
}

function createNewUrlOutput(url, linkDiv) {
    // Create the new URL output and make it visible.

    let text = document.createTextNode(url)

    let linkP = document.createElement("p");
    linkP.id = "linkP"

    linkP.appendChild(text)
    linkDiv.appendChild(linkP)


    let parentDiv = linkDiv.parentElement; // Make the overarching section visible
    parentDiv.classList.remove("invisible");
}




let globalCopyToast = null;
function copyUrl() {
    // Copy the URL in the input-field "linkP" to the clipboard.

    if (globalCopyToast !== null) // Prevent some bootstrap-specific errors:
        globalCopyToast.dispose();


    var linkP = document.getElementById("linkP");

    if (document.body.createTextRange) { // for Internet Explorer
        var range = document.body.createTextRange();
        range.moveToElementText(linkP);
        range.select();
        document.execCommand("Copy");

        let toastDiv = document.getElementById("urlCopyToast"); // Tell user the URL has been copied
        globalCopyToast = new bootstrap.Toast(toastDiv);
        globalCopyToast.show();
    }
    else if (window.getSelection) { // for other browsers

        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(linkP);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("Copy");

        let toastDiv = document.getElementById("urlCopyToast"); // Tell user the URL has been copied
        globalCopyToast = new bootstrap.Toast(toastDiv);
        globalCopyToast.show();
    }
}




function fillForm () {
    // If the Website gets loaded and the URL contains parameters, fill the form according to those parameters.

    const paramNames = [
        "oldName", "oldCost", "oldCostPeriod", "nrCurrentProgrammers",
        "newName", "newCost", "newCostPeriod", "nrFutureProgrammers",

        "nrEmployees", "employeeCost", "eCostPeriod", "programmerCost", "pCostPeriod",

        "trainingInactivity", "nrSetupProgrammers", "nrSetupMonths"
    ]

    const urlParams = new URLSearchParams(window.location.search); // Get the URL Parameters
    const entries = urlParams.entries()

    let element;
    let i = 0;
    for (const entry of entries) {
        if (entry[0][0]=="r") {
            element = document.getElementById(entry[1]); // If it's a radio button, check it.
            element.checked = true;
        } else {
            element = document.getElementById(paramNames[i]); // If it's an input field, insert a value.
            element.value = entry[1];
        }
        i ++;
    }
}




function submitOnEnter(inputId) {
    // This function adds an event-listener to each input-field to make them click the calculate-button upon pressed enter.

    // Get the input field
    var input = document.getElementById(inputId);

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", event => {
        if (event.key === "Enter") {// Number 13 is the "Enter" key on the keyboard
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("calcButton").click();
        }
    });
}




function hoverPair(className) {
    // This function visually pairs two list-elements on hover.
    // Input their class-name.

    let elements = document.getElementsByClassName(className);

    for (let i = 0; i < elements.length; i++) {

        elements[i].addEventListener('mouseenter', event => {
            for (let n = 0; n < elements.length; n++) {
                elements[n].classList.add("hoverStyle");
                elements[n].classList.remove("nonHoverStyle");
            }
        })

        elements[i].addEventListener('mouseleave', event => {
            for (let n = 0; n < elements.length; n++) {
                elements[n].classList.remove("hoverStyle");
                elements[n].classList.add("nonHoverStyle");
            }
        })
    }
}
