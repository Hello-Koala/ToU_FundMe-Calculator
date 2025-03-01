const btnCheckEligibility = document.getElementById('check-eligibility');

const boxes = document.querySelectorAll('.box');
const tabs = document.querySelectorAll('.tabs > ul > li');
const nextButtons = document.querySelectorAll('.next-button');
let currentBoxIndex = 0;

async function requestAssessment(formData) {
    const requestBody = {};

    for (const pair of formData.entries()) {
        if (pair[0].includes("[]")) {
            pair[0] = pair[0].replace("[]", "");
            if (!requestBody[pair[0]]) {
                requestBody[pair[0]] = [];
            }
            requestBody[pair[0]].push(pair[1]);
        } else {
            requestBody[pair[0]] = pair[1];
        }
    }

    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        };
        const response = await fetch('/api', requestOptions); //added
        const data = await response.json(); //added
        const dataResponse = JSON.parse(data.response);

        if (dataResponse && dataResponse.programs && dataResponse.programs.length > 0) {
            displayPrograms(dataResponse.programs);
        } else {
            displayNotEligible();
        }
        document.getElementById("result-loading").classList.add("is-hidden");
        document.getElementById("check-eligibility").classList.remove('is-hidden');
        document.querySelector(".fa-spinner").classList.remove("loading");
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

function displayPrograms(programs) {
    const programsList = document.getElementById("result-programs");
    programsList.innerHTML = "";
    programs.forEach((program) => {
        const programListItem = document.getElementById("card-template").cloneNode(true);
        programListItem.classList.remove("is-hidden");
        programListItem.id = "";
        programListItem.querySelector(".card-content-title").textContent = program.name;
        programListItem.querySelector(".card-content-reason").textContent = program.reason;
        programListItem.querySelector(".card-content-description").textContent = program.description;
        programListItem.querySelector(".card-footer-link").href = program.url;

        programsList.appendChild(programListItem);
    });
}

function displayNotEligible() {
    const eligible = document.getElementById('result-eligible');
    eligible.classList.add('is-hidden');
    const notEligible = document.getElementById('result-not-eligible');
    notEligible.classList.remove('is-hidden');
}

nextButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
        event.preventDefault();

        if (button.id === "check-eligibility") {
            document.getElementById("result-loading").classList.remove('is-hidden');
            document.getElementById("check-eligibility").classList.add('is-hidden');
            document.querySelector(".fa-spinner").classList.add('loading');

            const form = button.form;
            const formData = new FormData(form);
            await requestAssessment(formData);
        }

        const fnGetIndexAndRemoveClass = (element) => {
            element.classList.remove('is-active');
        }
        tabs.forEach(fnGetIndexAndRemoveClass);
        boxes.forEach(fnGetIndexAndRemoveClass);

        currentBoxIndex = (currentBoxIndex + 1) % boxes.length; // increment Index

        // Show the next box, tab and list item
        boxes[currentBoxIndex].classList.add('is-active');
        tabs[currentBoxIndex].classList.add('is-active');
    });
});
