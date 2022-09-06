//Variables declared
let time = 0
let hr, min, sec = 00
let interval = null
var running = false

//If a message is received from script page
chrome.runtime.onMessage.addListener(function(msg) {
    //Start the time
    if (msg.name == "runTime"){
        running = true
        if (interval){
            return
        }
        hr = parseInt(msg.hr)
        min = parseInt(msg.min)
        sec = parseInt(msg.sec)
        if (isNaN(hr) == true){
            hr = 0
        }
        if (isNaN(min) == true){
            min = 0
        }
        if (isNaN(sec) == true){
            sec = 0
        }
        time = 0
        time += sec
        time += (min * 60)
        time += (hr * 60 * 60)
        if (time > 86400){
            time = 86400
        }
        interval = setInterval(function() {
            time -= 1
            if (time < 0){
                //Send message to script page
                chrome.runtime.sendMessage({name: "EndTime"})
                return
            }
            hr = Math.floor(time/3600)
            min = Math.floor((time - (hr * 3600)) / 60)
            sec = time % 60
            if (hr < 10){
                hr = "0" + hr
            }
            if (min < 10){
                min = "0" + min
            }
            if (sec < 10){
                sec = "0" + sec
            }
            //Get the current tab of the user
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                //Loop through all the urls, and if the current tab url is in the list, then inject another script.
                for (let i = 0; i < msg.links.length; i++){
                    if (msg.links[i] == tabs[0].url){
                        chrome.scripting.executeScript({
                            target: {tabId: tabs[0].id, allFrames: true},
                            files: ["inject.js"]
                        })
                    }
                }
            
            })
            //Send the remaining time left to the script js (popup page)
            chrome.runtime.sendMessage({name: "SendTime", hour: hr, minutes: min, seconds: sec})
        }, 1000)
    }
    //Stop the time
    if (msg.name == "stopTime"){
        running = false
        clearInterval(interval)
        interval = null
        time = 0
    }

})