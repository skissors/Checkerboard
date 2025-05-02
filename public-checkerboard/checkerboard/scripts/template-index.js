import { setParam, cleanName } from "./utilities.js";
import { updates as petzUpdates } from "./data/updates.js";
import { loadShowRecordPage } from "./template-show-info.js";
import { buildPetPage } from "./template-petpage.js";
//import { sendUnlockThemeEvent } from "../../resources/core-cross-frame/cross-frame-child.js"; 

export function loadIndex(petzCount, petzList) {
    setParam("page", "index")
    document.getElementById("inner-content").innerHTML = buildIndex(petzCount);
    getRandomPet(petzList);
    document.getElementById("potdButton").addEventListener("click", ()=>{getRandomPet(petzList)});
    document.getElementById("showRecordPage").addEventListener("click", ()=>{loadShowRecordPage()})
    //document.getElementById("mascot").addEventListener("click", ()=>{sendUnlockThemeEvent("cxbdark", "theme")});
}

function buildIndex(petzCount) {
    let indexHTML = /*html*/
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
            <h2>Updates</h2>
            <hr style="width:100%">
            <div class="update-content">
                ${buildUpdates()}
            </div>
        </div>
        <div class="potd-box cbox-style shadow">
            <div class="potd-header">
                <div>Random Pet</div>
                <div class="potd-x" id="potdButton"><i class="fa-solid fa-rotate"></i></div>
            </div>
            <div class="potd-content">
                <img  id="potd-img" src="">
            </div>
        </div>

        <div class="fake-link" id="showRecordPage">view show records page</div>
    </div>
    `
    return indexHTML;
}

function buildUpdates() {
    let updateBlocks = ""
    for (let u in petzUpdates) {
        let update = petzUpdates[u]
        let t = `<div>${update.year}/${update.month}/${update.day} <br> ${update.text}</div>`
        if (u != petzUpdates.length-1) t += `------`
        updateBlocks += t;
    }
    return updateBlocks
}

function getRandomPet(petzList) {
    let rand = Math.floor(Math.random()*petzList.length)
    let pet = petzList[rand];
    let petImg = `../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${cleanName(pet.name)}/${cleanName(pet.name)}.png`;
    document.getElementById("potd-img").src=petImg; ;
    document.getElementById("potd-img").addEventListener("click", ()=>{buildPetPage(cleanName(pet.name))});

}