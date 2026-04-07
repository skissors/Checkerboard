
import { petz_data } from "../../petz-data/petz.js";
import { getPetByName } from "../../petz-data/petzFunc.js";
import { cleanName } from "../scripts/utilities.js";

let personalityValues = [
	"Liveliness",
	"Playfulness",
	"Independence",
	"Confidence",
	"Naughtiness",
	"Acrobaticness",
	"Patience",
	"Kindness",
	"Nurturing",
	"Finickiness",
	"Intelligence",
	"Messiness",
	"Quirkiness",
	"Insanity",
	"Constitution",
	"Metabolism",
	"Dogginess",
];

injectPetGraph(getPetByName("Fitz"))

function injectPetGraph(pet, id) {
	let ctx = document.getElementById(cleanName(pet.name) + "-graph");

	let personalityNums = [];
	personalityValues.forEach((value) => {
		personalityNums.push(parseInt(pet.personality[value]));
	});

	let data = {
		labels: personalityValues,
		datasets: [
			{
				label: "",
				data: personalityNums,
				fill: true,
				backgroundColor: "rgb(153, 129, 194, 1)",
				borderColor: "rgba(118, 84, 196, 0)",
				pointBackgroundColor: "rgba(118, 84, 196, 1)",
				// pointBorderColor: "#ffffffff",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "rgba(118, 84, 196, 1)",
				pointStyle: 'circle',
				pointRadius: 4,
				fill: 'start'
			},
		],
	};

	Chart.defaults.color = "#000";
	Chart.defaults.font.family = "'Arsenal', 'Courier New', Courier, monospace";
	Chart.defaults.font.size = 16;
	Chart.defaults.font.weight = "bold";

	let options = {
		aspectRatio: 1,
		scales: {
			r: {
				beginAtZero: false,
				max: 100,
				min: -10,
				ticks: {
					stepSize: 25,
					display: false,
                },
                pointLabels: {
					display: false,
                },
				// pointLabels: {
				// 	padding: 2,
				// 	font: {
				// 		size: 18,
				// 	},
                // },
                grid: {
                    circular: true,
                    lineWidth: 6,
                    color: "#FFF",
                    borderDash: 0,
                },
                angleLines: {
                    display: false
                }
			},
		},
		elements: {
			line: {
				borderWidth: 3,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
		},
		layout: {
			padding: 6,
		},
	};

	new Chart(ctx, {
		type: "radar",
		data: data,
		options: options,
	});
}
