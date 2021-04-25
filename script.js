function calcCost() {
    let softwareCost = document.calcInput.package.value; // Get input from HTML form
    let employeeCost = document.calcInput.employeeCost.value;
    let programmerCost = document.calcInput.programmerCost.value;
    const nrEmployees = document.calcInput.nrEmployees.value;

    softwareCost *= document.calcInput.sCostPeriod.value; // Turn all costs into their yearly equivalents (multiply monthly costs by 12)
    employeeCost *= document.calcInput.eCostPeriod.value;
    programmerCost *= document.calcInput.pCostPeriod.value;
    
    softwareCost *= nrEmployees; // Get the total cost you pay for the commercial software
    employeeCost *= nrEmployees; // Get the total cost you pay to your Employees


    const commercialCost = {
        one: softwareCost,
        two: softwareCost * 2,
        three: softwareCost * 3,
        five: softwareCost * 5,
        ten: softwareCost * 10,
    };

    const fossCost = calcFossCost(employeeCost, programmerCost);

    alert("Word: " + commercialCost.five + "€");
    alert("LibreOffice: " + fossCost.five + "€"); // fosst HAHAHAHA
}

function calcFossCost(employeeCost, programmerCost) {
    // Calculates the cost for switching to and maintaining a free and open source solution (FOSS)
    // This calculation is more complex as we need to account for 1.Setup and 2.Training for the employees.

    // Calculate the one-time payments
    const workingDays = 265;
    const employeeDailySalary = employeeCost / workingDays; // What ALL your employees cost you each day
    const daysOfInactivity = 5; // Assume your employees are COMPLETELY INACTIVE for some time-period due to training and inefficiently with the new software.
    const employeeTrainingCost =  employeeDailySalary * daysOfInactivity; // What inactivity will cost you.
    
    const monthlyProgrammerCost = programmerCost/365;
    const setupProgrammerCount = 3; // Number of programmers needed to initially implement the new solution
    const setupMonthCount = 3; // Number of months those Programmers work on that implementation
    const setupCost = monthlyProgrammerCost * setupProgrammerCount * setupMonthCount; // What the initial setup will cost you.
    
    const oneTimeCost = employeeTrainingCost + setupCost;

    // Calculate the yearly payments
    const nrMaintananceProgrammers = 3; // Assuming three extra programmers will be needed to maintain the new solution
    const recurringCost = programmerCost * nrMaintananceProgrammers;

    // Add up all the previous costs
    const cost = {
        one: oneTimeCost + recurringCost,
        two: oneTimeCost + (recurringCost * 2),
        three: oneTimeCost + (recurringCost * 3),
        five: oneTimeCost + (recurringCost * 5),
        ten: oneTimeCost + (recurringCost * 10),
    }
    return cost;
}