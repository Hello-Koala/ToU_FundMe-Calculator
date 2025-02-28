const btnCheckEligibility = document.getElementById('check-eligibility');

const boxes = document.querySelectorAll('.box');
const tabs = document.querySelectorAll('.tabs > ul > li');
const nextButtons = document.querySelectorAll('.next-button');
let currentBoxIndex = 0;

nextButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
        event.preventDefault();

        if (button.id === "check-eligibility") {
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "propertyType": "House",
                        "yearBuild": "1987",
                        "heatingSystem": "gas",
                        "renovationMeasures": ["insulation", "heating replacement"]
                    })
                };
                const response = await fetch('/api', requestOptions); //added
                const data = await response.json(); //added
                console.log("$$$ HRQ", JSON.stringify(data, null, 2));
            } catch (error) {
                console.error("Error fetching data:", error)
            }
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
