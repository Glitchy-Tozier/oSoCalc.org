function main() {

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
    addCostSummaryLine("Old yearly cost: ", oldCost[0], true);

    const newYearlyCost = calcCost(newSoftwareCost, programmerCost, nrFutureProgrammers, maxYears);
    addCostSummaryLine("New yearly cost: ", newYearlyCost[0]);

    const newCost = addOneTimeCost(newYearlyCost, employeeCost, programmerCost);
    // The one-time cost gets added INSIDE the addOneTimeCost()-function. This is where the last "addCostSummaryLine()" can be found.
    

    outputResults(oldCost, newCost, displayYears);
}

function getCostNum(id) {
    // This small function fetches the input corrects common errors and returns a properly formatted number.
    // It is only used for input-fields that ask the user to input an amount of money.
    // Input the input-form's ID

    let input = document.getElementById(id).value;

    input = input.replace(",", ".");

    while(input.includes(" ")){
        input = input.replace(" ", "");
    }

    const currencySymbols = ["$","€","¢","¥","£","¤"];
    for(let i=0; i<currencySymbols.length; i++){
        input = input.replace(currencySymbols[i], "");
    }
    
    if(isNaN(Number(input))) {
        alert("Please check for errors when inputting costs. Please do not use multiple periods or commas.");
        throw new Error("Please check for errors when inputting costs. Please do not use multiple periods or commas.");
    }
    input = Number(input);

    return input;
}

function getNrNum(id) {
    // This small function fetches an input and corrects common errors before returning the number.
    // It is used for all number-input-fields that do not ask for monetary amounts
    // Input the input-form's ID

    let input = document.getElementById(id).value; // Get value by id

    /* input = input.toString(); // Turn value into string
    input = createTextNode(input); // Encode Input */

    while(input.includes(",")){
        input = input.replace(",", "");
    }

    while(input.includes(".")){
        input = input.replace(".", "");
    }

    while(input.includes(" ")){
        input = input.replace(" ", "");
    }

    if(isNaN(Number(input))) {
        alert("Please check for errors when inputting numbers. Did you accidentally use letters or special symbols?");
        throw new Error("Please check for errors when inputting numbers. Did you accidentally use letters or special symbols?");
    }
    input = Number(input);

    return input
}

function getRadioValue(name) {
    // Input name of radio group.
    // Returns the pressed radiobutton's value.

    const radioArray = document.getElementsByName(name);

    for(let i = 0; i < radioArray.length; i++) {
        if(radioArray[i].checked == true) {
            return radioArray[i].value;
        }
    }
}

function calcCost(softwareCost, programmerCost, nrMaintananceProgrammers, maxYears) {
    // Calculates the recurring (yearly) accumulated cost for a software solution.
    // Returns those costs for the years specified in the "maxYears"-constant.

    const maintananceCost = programmerCost * nrMaintananceProgrammers;
    const yearlyCost = maintananceCost + softwareCost;

    let cost = [];
    for(let i=0; i<maxYears; i++) {
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

    for(let i=0; i<cost.length; i++) { // Add the one-time cost to the yearly costs.
        cost[i] += oneTimeCost;
    }

    addCostSummaryLine("One-time switching cost: ", oneTimeCost);

    return cost
}

function addCostSummaryLine(name, value, deleteContents) {
    // Add a line to the div under the "summary"-heading in the "results"-section.

    nameDiv = document.getElementById("summaryName");
    valueDiv = document.getElementById("summaryValue"); 

    if (deleteContents) {
        nameDiv.innerHTML = ""; // Make sure the 
        valueDiv.innerHTML = "";
    }

    nameLine = document.createElement("p"); // Create and add the name-part of the line
    nameTextNode = document.createTextNode(name);

    nameLine.appendChild(nameTextNode);
    nameDiv.appendChild(nameLine);


    let valueStr = Math.round(value).toString(); // Make the cost look a little better.
    let fullStr = "";
    for(let i = 0; i < valueStr.length; i++) {
        let currentLetter = valueStr[valueStr.length - (i+1)];
        fullStr = currentLetter + fullStr;
        if(((i+1) % 3 == 0) && (i > 0) && ((i+1) < valueStr.length)) {
            fullStr = "." + fullStr;
        }
    }
    valueLine = document.createElement("p"); // Create and add the value-part of the line
    valueTextNode = document.createTextNode(fullStr);

    valueLine.appendChild(valueTextNode);
    valueDiv.appendChild(valueLine);
}

function outputResults(oldCost, newCost, tableYears) {
    // This function first prepares the values for output and then outputs them.

    const oldName = document.getElementById("oldName").value; // Set the title
    const newName = document.getElementById("newName").value;
    const title = "<strong>" + oldName + "</strong> vs <strong>" + newName + "</strong>";
    document.getElementById("resTitle").innerHTML = title;
    

    const prettyCostObj = makeCostsPretty(oldCost, newCost); // Prettify the cost-arrays and get their modifier text (for example, "M" for million)
    const prettyOldCost = prettyCostObj["prettyOldCost"];
    const prettyNewCost = prettyCostObj["prettyNewCost"];
    const modifierText = prettyCostObj["modifierText"];

    
    const table_turningPoint = createTable(oldName, newName, prettyOldCost, prettyNewCost, modifierText, tableYears);
    const table = table_turningPoint["table"];
    const turningPoint = table_turningPoint["turningPoint"];

    const graphConfig = createGraph(oldName, newName, oldCost, newCost);

    const message = createMessage(oldName, newName, turningPoint);


    if(document.getElementById("notingYetCalculated")) { // Remove the "Calculation wasn't started yet"-section
        document.getElementById("notingYetCalculated").remove();
    }

    let outputDiv = document.getElementById("results-section");

    if(outputDiv.classList.contains("invisible")) { // Make the results-section visible
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

function makeCostsPretty(oldCost, newCost) {
    // This Function prettyfies the costs so that they can be displayed properly.


    let prettyOldCost = [];
    let prettyNewCost = [];
    let modifierText = [];

    for(let i=0; i<oldCost.length; i++) { // Go through every element of the cost-arrays.

        let oldCost_i = Math.round(oldCost[i]);
        let newCost_i = Math.round(newCost[i]);

        
        let numberString = "" // Canculate how many blocks of 3 digits we can cut.
        if(oldCost_i < newCost_i) {
            numberString += oldCost_i.toString();
        } else {
            numberString += newCost_i.toString();
        }
        let nrDigits = numberString.length;
        let digitsToCut = Math.floor(nrDigits/3) * 3;

        switch(digitsToCut) { // Get the text that should be displayed in the HTML-table.
            case 0:
                modifierText.push("");
                break;
            case 3:
                modifierText.push("");
                digitsToCut = 0;
                break;
            case 6:
                modifierText.push("M");
                break;
            case 9:
                modifierText.push("B");
                break;
            case 12:
                modifierText.push("T");
        }
        
        oldCost_i /= Math.pow(10, digitsToCut); // Finally prettify the cost.  // Cut digits
        oldCost_i *= 100; // Prepare rounding
        oldCost_i = Math.round(oldCost_i); // Rould
        oldCost_i /= 100; // Finish rounding
        prettyOldCost.push(oldCost_i); // Save result


        newCost_i /= Math.pow(10, digitsToCut); // Cut digits
        newCost_i *= 100; // Prepare rounding
        newCost_i = Math.round(newCost_i); // Round
        newCost_i /= 100; // Finish rounding
        prettyNewCost.push(newCost_i); // Save result
    }

    return {
        prettyOldCost: prettyOldCost,
        prettyNewCost: prettyNewCost,
        modifierText: modifierText,
    }
}

function createTable(oldName, newName, oldCost, newCost, modifierText, tableYears) {
    // This function creates (and returns) the string for the displayed HTML-table.
    // It also creates (and returns) the year where the new Solution starts being worthwile.

    let turningPoint = 0;

    let table = `
    <table class="table">
        <thead>
            <tr>
                <th scope="col" class="col-auto">Time passed</th>
                <th scope="col" class="col-auto">` + oldName + `</th>
                <th scope="col" class="col-auto">` + newName + `</th>
                <th scope="col" class="col-auto">Worth switching?</th>
            </tr>
        </thead>
        <tbody>`;

    for(let i=0; i<oldCost.length; i++) { // Create all the table rows
        let yearNumber = i+1;

        let savedMoney = oldCost[i] - newCost[i]; // Prepare the variable "savedMoney"
        savedMoney *= 100; // Prepare rounding
        savedMoney = Math.round(savedMoney); // Round
        savedMoney /= 100; // Finish rounding

        let diffClass = ""; // Prepare the dynamic styles for some of the cells.
        let isActive = "";
        if(savedMoney < 0) {
            diffClass = "table-danger";
        } else {
            diffClass = "table-success";
            isActive += 'class="table-active"';

            if(turningPoint == 0) {
                turningPoint = yearNumber; // Save the year where the new solution first is cheaper than the old one.
            }
        }

        if(tableYears.includes(yearNumber)) { // Only display the values for the "tableYears"-years in the table.

            let yearStr = "";
            if(yearNumber == 1) {yearStr = "year" // Get the gramatically correct form of "year"
            } else {
                yearStr = "years";
            }

            table += `
            <tr>
                <td scope="row" ` + isActive + `>After ` + yearNumber + " " + yearStr + `:</td>
                <td>` + oldCost[i] + " " + modifierText[i] + `</td>
                <td>` + newCost[i] + " " + modifierText[i] + `</td>
                <td class=` + diffClass + `>` + savedMoney + " " + modifierText[i] + `</td>
            </tr>`;
        }
    }
    table += "</tbody>  </table>";

    return {table: table, turningPoint: turningPoint};
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
                }, */
                fillColor: "green",
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
        options: { interaction: {
                mode: "index",
                intersect: false,
            },
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

    if(turningPoint > 0) {
        if(turningPoint == 1) {
            message += '<p style="text-align: center">Financially speaking, <strong>yes</strong>, you should switch from ' + oldName + " to " + newName + ".</p>";
        } else {
            message += '<p style="text-align: center">Financially speaking, you should switch from, ' + oldName + " to " + newName + " <strong>if you're planning ahead at least " + turningPoint + " Years</strong>.</p>";
        }
    } else {
        message += '<p style="text-align: center">Financially speaking, you <strong>should not switch</strong> from ' + oldName + " to " + newName + ".</p>";
    }

    return message;
}

function hover(className){
    // This function visually pairs two list-elements on hover.
    // Input their class-name.

    let elements = document.getElementsByClassName(className);

    for(let i = 0; i < elements.length; i++) {

        elements[i].addEventListener('mouseenter', event => {
            for(let n = 0; n < elements.length; n++) {
                elements[n].classList.add("hoverStyle");
                elements[n].classList.remove("nonHoverStyle");
            }
        })
        
        elements[i].addEventListener('mouseleave', event => {
            for(let n = 0; n < elements.length; n++) {
                elements[n].classList.remove("hoverStyle");
                elements[n].classList.add("nonHoverStyle");
            }
        })
    }
}






function prepareToShare () {

    let form = document.getElementById("calcInput"); // Make Sure the form is actually filled out.
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    newURL = createNewURL(); // Create a new url using the current URL and the form inputs.

    outputURL(newURL)
}

function createNewURL() {

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

    //paramString = encodeURI(paramString);
    return url;
}

function getCheckedRadioId(radioGroupName) {
    // Input name of radio button input group
    // Outputs ID of the checked radio button

    const radioArray = document.getElementsByName(radioGroupName); // Get group of radio buttons

    for(let i = 0; i < radioArray.length; i++) { // Search and return the checked one.
        if(radioArray[i].checked == true) {
            return radioArray[i].id;
        }
    }
}

function outputURL(url) {
    
    window.history.pushState("object or string", "Title", url); // Display the URL in the URL-bar.

    let parentDiv = document.getElementById("linkDiv");
    parentDiv.classList.remove("invisible");

    let outputDiv = document.getElementById("linkText");
    outputDiv.innerHTML = url;
}




function getUrlParameters () {
        /* const paramNames = [
        "oldName", "oldCost", "oldCostPeriod", "nrCurrentProgrammers",
        "newName", "newCost", "newCostPeriod", "nrFutureProgrammers",

        "nrEmployees", "employeeCost", "eCostPeriod", "programmerCost", "pCostPeriod",

        "trainingInactivity", "nrSetupProgrammers", "nrSetupMonths"
    ] */
}
