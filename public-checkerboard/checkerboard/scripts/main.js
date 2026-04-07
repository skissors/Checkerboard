import { petz_data } from "../../petz-data/petz.js";
import { cleanName, getJsonCookie, setJsonCookie } from "./utilities.js";
import { loadIndex } from "./template-index.js";
import { loadShowRecordPage } from "./template-show-info.js";
import { buildPetPage } from "./template-petpage.js";
import { initCrossFrame, sendUrlEvent } from "https://oodlecat.meowandsparkle.party/resources/core-cross-frame/cross-frame-child.js";

let petzList = [];
let petCheckboxes = {};
let otherCheckboxes = {};

let genderData = {};

let imageCache = [];
preLoad();

function preLoad() {
	let params = new URL(document.location).searchParams;

	buildPetList();

	let page = params.get("page");
	let pageToLoad = () => {loadIndex(countPetz(), petzList);};
	if (page) {
		if (page === "showroom") pageToLoad = loadShowRecordPage;
		else if (page != "index")
			pageToLoad = () => {
				buildPetPage(page);
			};
	}

	let cookie = getJsonCookie("petFilters");
	if (cookie) petCheckboxes = cookie;

	cookie = getJsonCookie("otherFilters");
	if (cookie) otherCheckboxes = cookie;

	window.addEventListener("DOMContentLoaded", () => {setup(pageToLoad);}, false);
}

function setup(pageToLoad) {
	initCrossFrame("*");
	pageToLoad();

	adjustLayout();
	addEventListener("resize", adjustLayout);

	loadDropdown();
	///cacheImages();

	
}



function cacheImages() {
	let i = 0;
	for (let species in petz_data) {
		for (let breed in petz_data[species]) {
			for (let entry in petz_data[species][breed]) {
				let pet = petz_data[species][breed][entry];
				let petname = cleanName(pet.name);
				imageCache[i] = new Image();
				imageCache[i].src = `../../petz-data/petz/${pet.species}/${pet.breed}/${petname}/${petname}-square.png`;
				i++;
				imageCache[i] = new Image();
				imageCache[i].src = `../../petz-data/petz/${pet.species}/${pet.breed}/${petname}/${petname}-black.png`;
				i++;
				imageCache[i] = new Image();
				imageCache[i].src = `../../petz-data/petz/${pet.species}/${pet.breed}/${petname}/${petname}-white.png`;
				i++;
				imageCache[i] = new Image();
				imageCache[i].src = `../../petz-data/petz/${pet.species}/${pet.breed}/${petname}/${petname}.png`;
				i++;
			}
		}
	}
}

//generate list of petz to show
function buildPetList() {
	let nothingChecked = true;
	petzList = [];
	for (let species in petCheckboxes) {
		for (let breed in petCheckboxes[species]) {
			if (petCheckboxes[species][breed]) {
				nothingChecked = false;
				for (let entry in petz_data[species][breed]) {
					let pet = petz_data[species][breed][entry];
					pet.species = species;
					pet.breed = breed;
					if (applySpecialFilters(pet)) petzList.push(petz_data[species][breed][entry]);


				}
			}
		}
	}

	if (nothingChecked) {
		for (let species in petz_data) {
			for (let breed in petz_data[species]) {
				for (let entry in petz_data[species][breed]) {
					let pet = petz_data[species][breed][entry];
					pet.species = species;
					pet.breed = breed;
					if (applySpecialFilters(pet)) petzList.push(petz_data[species][breed][entry]);

					if (!genderData[species]) genderData[species] = {}
					if (!genderData[species][pet.gender]) genderData[species][pet.gender] = 1;
					else genderData[species][pet.gender]++
				}
			}
		}
		//console.log("nothingChecked");
		console.log(genderData)
	}

}

function countPetz() {
	let petzCount = {};
	for (let species in petz_data) {
        petzCount[species] = 0;
		for (let breed in petz_data[species]) {
                petzCount[species] += petz_data[species][breed].length
		}
	}
    return petzCount
}

function applySpecialFilters(pet) {
	for (let filter in otherCheckboxes.filters) {
		if (otherCheckboxes.filters[filter]) {
			switch (filter) {
				case "showrecords":
					if (!(pet.show_records && pet.show_records != "")) return false;
					break;
				case "gallery":
					if (!(pet.gallery && pet.gallery != "")) return false;
					break;
				case "comments":
					if (!(pet.comments && pet.comments != "")) return false;
					break;
			}
		}
	}
	return true;
}

/* CHECKERBOARD Layout Functions */

function adjustLayout() {
	//console.log("adjustLayout")
	if (document.body.clientWidth < 900) {
		adjustLayoutForMobile();
		return;
	}

	let mainWidth = 675;
	let squaresOnRight = 3;
	let topRightColor = "white";
	let rows = 8;
	let cols = 8;
	let rightPadding = 225;

	if (document.body.clientWidth < (2 + squaresOnRight) * 75 + mainWidth) {
		squaresOnRight = 0;
		topRightColor = "black";
	} else if (document.body.clientWidth < (5 + squaresOnRight) * 75 + mainWidth) {
		squaresOnRight = 1;
	} else if (document.body.clientWidth < (7 + squaresOnRight) * 75 + mainWidth) {
		squaresOnRight = 2;
		topRightColor = "black";
	}

	if (window.innerHeight < 600) {
		rows = Math.floor(window.innerHeight / 75);
	}

	rightPadding = mainWidth + 75 * squaresOnRight;
	cols = Math.floor((document.body.clientWidth - rightPadding) / 75);

	document.getElementById("checkerboard").style.marginRight = rightPadding + "px";
	document.getElementById("content-ribbon").style.right = squaresOnRight * 75 + "px";

	loadSquares(rows, cols, rightPadding, 0, topRightColor);
}

function adjustLayoutForMobile() {
	buildPetList();
	let cols = Math.floor(document.body.clientWidth / 75);
	let rows = Math.ceil(petzList.length / cols);
	let otherColor = "black";
	let topRightColor = "white";

	document.getElementById("mobile-checkerboard").style.height = rows * 75 + "px";

	loadSquaresForMobile(rows, cols);
}

function loadSquaresForMobile(rows, cols) {
	document.getElementById("mobile-checkerboard").innerHTML = "";
	let otherColor = "white";
	let firstSqColor = "black";

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let pet = petzList[i * cols + j];
			if (!pet) return;
			let color = j % 2 == 0 ? (i % 2 == 0 ? otherColor : firstSqColor) : i % 2 == 1 ? otherColor : firstSqColor;
			let sq = squareHTML(pet, color);
			document.getElementById("mobile-checkerboard").appendChild(sq);
		}
	}
}

function loadSquares(rows, cols, right, page, topRightColor) {
	//console.log("loadSquares " + rows + " " + cols)
	document.getElementById("checkerboard").innerHTML = "";
	buildPetList();

	let navDiv = null;
	let otherColor = "black";
	if (topRightColor === "black") otherColor = "white";

	if (petzList.length > cols * rows) {
		

		let textColor = rows % 2 ? otherColor : topRightColor;

		navDiv = document.createElement("div");
		navDiv.classList.add("square");
		navDiv.classList.add("next-sq");
		navDiv.style.color = textColor;

		let moreDiv = document.createElement("div");
		if (petzList.length - cols * rows * page > cols * rows) {
			moreDiv.innerHTML = "more >";
			moreDiv.addEventListener("click", () => {
				loadSquares(rows, cols, right, page + 1, topRightColor);
			});
		}
		navDiv.appendChild(moreDiv);

		if (page > 0) {
			let backDiv = document.createElement("div");
			backDiv.innerHTML = "< back";
			backDiv.addEventListener("click", () => {
				loadSquares(rows, cols, right, page - 1, topRightColor);
			});
			navDiv.appendChild(backDiv);
		}
	}

	for (let j = 0; j < cols; j++) {
		for (let i = 0; i < rows; i++) {
			if (navDiv && j === 0 && i === rows - 1) {
				document.getElementById("checkerboard").appendChild(navDiv);
			} else {
				let petNum = j * rows + i + (page * rows * cols - page);
				if (navDiv && j > 0) {
					petNum = j * rows + i - 1 + (page * rows * cols - page);
				}
				let pet = petzList[petNum];
				if (!pet) return;
				let color = j % 2 == 0 ? (i % 2 == 0 ? otherColor : topRightColor) : i % 2 == 1 ? otherColor : topRightColor;
				let sq = squareHTML(pet, color);
				document.getElementById("checkerboard").appendChild(sq);
			}
		}
	}
}

function squareHTML(pet, color) {
	let petname = cleanName(pet.name);
	let newSq = document.createElement("div");
	otherCheckboxes.theme && otherCheckboxes.theme.showsq ? newSq.classList.add("sq-show-face") : newSq.classList.add("square");
	newSq.addEventListener("click", () => {
		buildPetPage(petname);
        sendUrlEvent();
	});
	let img =
		/*html*/
		`<img src="../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${petname}/${petname}-square.png" class="img-square">
         <img src="../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${petname}/${petname}-black.png" class="img-black ${color === "black" ? "sq-show" : "sq-hide"}">
         <img src="../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${petname}/${petname}-white.png" class="img-white ${color === "white" ? "sq-show" : "sq-hide"}">`;
	newSq.innerHTML = img;
	return newSq;
}

/* Dropdown Functions */
function loadDropdown() {
	Array.from(document.getElementsByClassName("dropbtn")).forEach((dd) => {
		dd.addEventListener("click", Dropdown);
		loadPetzDataFilters(dd.id);
	});
	loadOtherFilters();

	document.addEventListener("click", dropdownWatcher);

	Array.from(document.getElementsByClassName("allclear")).forEach((e) => {
		e.children[0].addEventListener("click", checkAll);
		e.children[1].addEventListener("click", clearAll);
	});
}

function loadPetzDataFilters(type) {
	if (petz_data[type]) {
		if (!petCheckboxes[type]) petCheckboxes[type] = {};
		for (let breed in petz_data[type]) {
			if (petz_data[type][breed].length > 0) {
				document.getElementById(type + "dd").appendChild(buildDropdownOption(type, breed));
			}
		}
	}
}

function loadOtherFilters() {
	let dropdown = document.getElementById("settingsdd");
	dropdown.innerHTML = "<div>More Filters</div>";

	if (!otherCheckboxes["filters"]) otherCheckboxes["filters"] = {};
	dropdown.appendChild(buildDropdownOption("filters", "showrecords", true, "Show Records"));
	dropdown.appendChild(buildDropdownOption("filters", "comments", true, "Comments"));
	dropdown.appendChild(buildDropdownOption("filters", "gallery", true, "Gallery"));

	dropdown.appendChild(document.createElement("hr"));

	if (!otherCheckboxes["theme"]) otherCheckboxes["theme"] = {};

	dropdown.appendChild(buildDropdownOption("theme", "showsq", true, "Show Squares"));
}

function buildDropdownOption(type, option, otherFilter, text) {
	let newOption = document.createElement("div");

	let input = document.createElement("input");
	input.classList.add("checkbox-flip");
	input.type = "checkbox";
	input.id = type + "_" + option;
	if (otherFilter) {
		input.checked = otherCheckboxes[type][option];
		input.addEventListener("change", otherToggle);
	} else {
		input.checked = petCheckboxes[type][option];
		input.addEventListener("change", petToggle);
	}

	newOption.appendChild(input);

	let label = document.createElement("label");
	label.appendChild(document.createElement("span"));
	label.appendChild(document.createTextNode(text ? text : option));
	label.htmlFor = type + "_" + option;

	newOption.appendChild(label);
	return newOption;
}

function Dropdown(e) {
	let id = e.target.id;
	if (!e.target.id) id = e.target.parentNode.id;
	document.getElementById(id + "dd").classList.toggle("show");
}

function petToggle(event) {
	let str = event.target.id.split("_");
	petCheckboxes[str[0]][str[1]] = event.currentTarget.checked;
	adjustLayout();
	setJsonCookie("petFilters", petCheckboxes, 3600);
}

function otherToggle(event) {
	let str = event.target.id.split("_");
	otherCheckboxes[str[0]][str[1]] = event.currentTarget.checked;
	adjustLayout();
	setJsonCookie("otherFilters", otherCheckboxes, 3600);
}

function checkAll(e) {
	let id = e.currentTarget.parentNode.parentNode.id;
	var checks = document.querySelectorAll("#" + id + ' input[type="checkbox"]');
	for (var i = 0; i < checks.length; i++) {
		checks[i].checked = true;
		let str = checks[i].id.split("_");
		petCheckboxes[str[0]][str[1]] = true;
	}
	adjustLayout();
	setJsonCookie("petFilters", petCheckboxes, 3600);
}

function clearAll(e) {
	let id = e.currentTarget.parentNode.parentNode.id;
	var checks = document.querySelectorAll("#" + id + ' input[type="checkbox"]');
	for (var i = 0; i < checks.length; i++) {
		checks[i].checked = false;
		let str = checks[i].id.split("_");
		petCheckboxes[str[0]][str[1]] = false;
	}
	adjustLayout();
	setJsonCookie("petFilters", petCheckboxes, 3600);
}

function dropdownWatcher(e) {
	let clickedBtn;
	let clickedDD;

	if (e.target.matches(".dropbtn")) {
		clickedBtn = e.target.id;
	} else if (e.target.parentNode.classList.contains("dropbtn")) {
		clickedBtn = e.target.parentNode.id;
	} else if (e.target.closest(".dropdown-content")) {
		clickedDD = e.target.closest(".dropdown-content").id;
	}

	let dropdowns = document.getElementsByClassName("dropdown-content");

	Array.from(dropdowns).forEach((dd) => {
		if (dd.id !== clickedBtn + "dd" && dd.id !== clickedDD) {
			dd.classList.remove("show");
		}
	});
}
