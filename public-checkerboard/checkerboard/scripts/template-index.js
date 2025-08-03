import { setParam, cleanName } from "./utilities.js";
import { updates as petzUpdates } from "./data/updates.js";
import { loadShowRecordPage } from "./template-show-info.js";
import { buildPetPage } from "./template-petpage.js";
import { sendUnlockThemeEvent } from "https://oodlecat.meowandsparkle.party/resources/core-cross-frame/cross-frame-child.js";



export function loadIndex(petzCount, petzList) {
	setParam("page", "index");
	document.getElementById("inner-content").innerHTML = buildIndex(petzCount);
	buildUpdates();
	getRandomPet(petzList);
	document.getElementById("potdButton").addEventListener("click", () => {
		getRandomPet(petzList);
	});
	//document.getElementById("showRecordPage").addEventListener("click", ()=>{loadShowRecordPage()})
	document.getElementById("mascot").addEventListener("click", () => {
		sendUnlockThemeEvent("cxbdark", "theme");
	});
}

function buildIndex(petzCount) {
	let indexHTML =
		/*html*/
		`
    <div class="welcome-box"> 
        <img src="img/petz73.png" id="mascot">
        <div>
            Welcome to Checkerboard, a petz crewsite owned by skissors. 
            Checkerboard is currently home to ${petzCount["catz"]} catz, ${petzCount["dogz"]} dogz, and ${petzCount["other"]} other creatures!
        </div>
    </div>

    <div class="update-div">

        <div class="update-box shadow">
            <div class="index-box-header">
                <h2>Updates</h2>
                <a class="index-box-icon" id="rssButton" href="feed.xml" target="_blank"><i class="fa-solid fa-rss"></i></a>
            </div>
            <div class="update-content" id="update-content">
            </div>
        </div>
        <div class="potd-box shadow">
            <div class="index-box-header">
                <h2>Random Pet</h2>
                <div class="index-box-icon" id="potdButton"><i class="fa-solid fa-rotate"></i></div>
            </div>
            <div class="potd-content">
                <img  id="potd-img" src="">
            </div>
        </div>

        <!--<div class="fake-link" id="showRecordPage">view show records page</div>-->
    </div>
    `;
	return indexHTML;
}

function buildUpdates() {
    const RSS_URL = `./feed.xml`;
	fetch(RSS_URL)
		.then((response) => response.text())
		.then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
		.then((data) => {
			console.log(data);
			const items = data.querySelectorAll("item");

			let updateBlocks = "";
			items.forEach((post) => {
				let date = new Date(post.querySelector("pubDate").innerHTML);
				let text = post.querySelector("description").innerHTML;
				let template = `<div class="update-item">
                                ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} <br> ${text}
                            </div>`;
				updateBlocks += template;
			});

			let updateBox = document.getElementById("update-content");
            updateBox.innerHTML = updateBlocks;
            postToUpdateNetwork(updateBlocks);
		});
}

async function postToUpdateNetwork(rssData) {
	const encoder = new TextEncoder();
	const data = encoder.encode(rssData);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    console.log("hash", hashHex)

	const reportedUrl = "https://oodlecat.neocities.org/checkerboard/?page=index" || window.location.origin;
	const siteName = "Checkerboard";

	fetch("https://fantazzled.com/directory/puf/receive.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			url: reportedUrl,
			name: siteName,
			hash: hashHex,
		}),
	});
}

function getRandomPet(petzList) {
	let rand = Math.floor(Math.random() * petzList.length);
	let pet = petzList[rand];
	let petImg = `../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${cleanName(pet.name)}/${cleanName(pet.name)}.png`;
	document.getElementById("potd-img").src = petImg;
	document.getElementById("potd-img").addEventListener("click", () => {
		buildPetPage(cleanName(pet.name));
	});
}
