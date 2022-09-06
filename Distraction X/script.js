//All the variables declared in the beginning
const submitBtn = document.getElementById("url-submit")
const urlInputField = document.getElementById("url-input")
const urlFromStorage = JSON.parse(localStorage.getItem("myUrls"))
const displayLinks = document.getElementById("display-url")
const startBtn = document.getElementById("timer-btn-start")
const stopBtn = document.getElementById("timer-btn-stop")
const theTimer = document.getElementById("stopwatch")
const hrInput = document.getElementById("hr-inp")
const minInput = document.getElementById("min-inp")
const secInput = document.getElementById("sec-inp")
let time = 0 //in seconds
let hr, min, sec = 00
let interval = null
let links = []

//This function checks if the passed url is valid. If valid returns true. Otherwise returns false.
function isValidUrl(url){
  let urlCheck = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
  return (urlCheck != null)
}

//If the user presses "Enter" instead of clicking submit button.
urlInputField.addEventListener("keypress", function(event){
  if (event.key == "Enter"){
    event.preventDefault()
    submitBtn.click()
  }
})

//Submit button event
submitBtn.addEventListener("click", function(){
  if (isValidUrl(urlInputField.value)){
    //Store the url in the user's local storage, reset the urlInputField and render the page again.
    links.push(urlInputField.value)
    urlInputField.value = ""
    localStorage.setItem("myUrls", JSON.stringify(links))
    renderLinks(links)
  }
  else{
    //Invalid url, so alert the user.
    urlInputField.value = ""
    alert("Invalid URL")
  }
})

//If there are urls to be displayed, then display them.
if (urlFromStorage != null){
  links = urlFromStorage
  renderLinks(links)
}

//Renders the urls into the html page.
function renderLinks(links){
  displayLinks.innerHTML = ""
  for(let i = 0; i < links.length; i++){
    let htmlLi = document.createElement("li")
    let htmlDiv = document.createElement("div")
    let htmlHref = document.createElement("a")
    let htmlBtn = document.createElement("button")
    htmlHref.href = links[i]
    htmlHref.target = "_blank"
    htmlHref.innerText = links[i]
    htmlBtn.type = "button"
    htmlBtn.innerText = "X"
    htmlDiv.append(htmlHref)
    htmlDiv.append(htmlBtn)
    htmlLi.append(htmlDiv)
    displayLinks.appendChild(htmlLi)
    htmlBtn.addEventListener("click", function(){
      links.splice(i, 1)
      localStorage.setItem("myUrls", JSON.stringify(links))
      renderLinks(links)
    })
  }
}

//If the time is running, render it into the pop-up html page. 
function renderPopup(){
  //Receives the message from background page.
  chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    try{
      //Timer is running.
      if (msg.name == "SendTime"){
        theTimer.innerHTML = `${msg.hour}:${msg.minutes}:${msg.seconds}`
      }
      //Timer is stopped
      if (msg.name == "EndTime"){
        stopBtn.click()
      }
    } catch (e) {
      console.log(e)
    }
  })
}

//The timer is started
startBtn.addEventListener("click", function(){
  //Sends message to background page
  chrome.runtime.sendMessage(
    {name: "runTime", hr: hrInput.value, min: minInput.value, sec: secInput.value, links: links
  })
  renderPopup()
})

//Timer is stopped
stopBtn.addEventListener("click", function(){
  //Send message to background page
  chrome.runtime.sendMessage(
    {name: "stopTime"}
  )
  theTimer.innerHTML = "--:--:--"
})

renderPopup()