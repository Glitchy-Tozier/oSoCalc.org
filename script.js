function calcCost() {
    let softwareCost = getRadioValue(document.getElementsByName("package")); // Get input from HTML form
    let employeeCost = document.getElementById("employeeCost").value;
    let programmerCost = document.getElementById("programmerCost").value;
    const nrEmployees = document.getElementById("nrEmployees").value;

    softwareCost *= getRadioValue(document.getElementsByName("sCostPeriod")); // Turn all costs into their yearly equivalents (multiply monthly costs by 12)
    employeeCost *= getRadioValue(document.getElementsByName("eCostPeriod"));
    programmerCost *= getRadioValue(document.getElementsByName("pCostPeriod"));
    
    softwareCost *= nrEmployees; // Get the total cost you pay for the commercial software
    employeeCost *= nrEmployees; // Get the total cost you pay to your Employees
    

    const commercialCost = {
        y1: softwareCost,
        y2: softwareCost * 2,
        y3: softwareCost * 3,
        y5: softwareCost * 5,
        y10: softwareCost * 10,
    };

    const fossCost = calcFossCost(employeeCost, programmerCost);

    outputResults(commercialCost, fossCost);
}

function getRadioValue(radioArray) {
    console.log("haeihaei", radioArray[1], radioArray.length, radioArray[1].value)
    for(let i = 0; i < radioArray.length; i++) {
        if(radioArray[i].checked == true) {
            return radioArray[i].value;
        }
    }
}

function calcFossCost(employeeCost, programmerCost) {
    // Calculates the cost for switching to and maintaining a free and open source solution (FOSS)
    // This calculation is more complex as we need to account for 1.Setup and 2.Training for the employees.

    // Calculate the one-time payments
    const workingDays = 265;
    const employeeDailySalary = employeeCost / workingDays; // What ALL your employees cost you each day
    const daysOfInactivity = document.getElementById("trainingInactivity").value; // Assume your employees are COMPLETELY INACTIVE for some time-period due to training and inefficiently with the new software.
    const employeeTrainingCost =  employeeDailySalary * daysOfInactivity; // What inactivity will cost you.
    
    const monthlyProgrammerCost = programmerCost/12;
    const setupProgrammerCount = document.getElementById("nrSetupProgrammers").value; // Number of programmers needed to initially implement the new solution
    const setupMonthCount = document.getElementById("nrSetupMonths").value; // Number of months those Programmers work on that implementation
    const setupCost = monthlyProgrammerCost * setupProgrammerCount * setupMonthCount; // What the initial setup will cost you.
    
    const oneTimeCost = employeeTrainingCost + setupCost;

    // Calculate the yearly payments
    const nrMaintananceProgrammers = document.getElementById("nrMaintananceProgrammers").value; // Assuming three extra programmers will be needed to maintain the new solution
    const recurringCost = programmerCost * nrMaintananceProgrammers;

    // Add up all the previous costs
    const cost = {
        y1: oneTimeCost + recurringCost,
        y2: oneTimeCost + (recurringCost * 2),
        y3: oneTimeCost + (recurringCost * 3),
        y5: oneTimeCost + (recurringCost * 5),
        y10: oneTimeCost + (recurringCost * 10),
    }
    return cost;
}

function outputResults(commercialCost, fossCost) {
    // This function first prepares the values for output and then outputs them.
    const years = getRadioValue(document.getElementsByName("timeSpan"));
    
    oldCost = commercialCost["y"+years]
    prettyOldCost = (oldCost/1000000).toFixed(3);

    newCost = fossCost["y"+years]
    prettyNewCost = (newCost/1000000).toFixed(3);

    let message = "";
    message += "Comparison for " + years + " years:\n\n";
    message += "Old software: " + prettyOldCost + " million €.\n";
    message += "New software: " + prettyNewCost + " million €.";

    alert(message);
}