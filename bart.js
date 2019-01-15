// Note: session refers to the number of the latest therapy session attended by the user,
// and has nothing to do with the web-related session concept.
// Recall this is an app to be used by patients undergoing therapy (e.g., for anxiety,
// so that we can monitor their risk-taking proneness).

"use strict";

(function() {
  let inRound;
  let remainingNums = 13;
  let probabilityArray = Array(12).fill(0);
  let exploded = false;
  let roundNum = 0;
  const roundLimit = 6;


  window.onload = function() {
    document.getElementById("game").className = "hidden";
    document.getElementById("ending").className = "hidden";
    document.getElementById("participated").className = "hidden";
    document.getElementById("submit_form").onclick = goToGame;
  };


  function goToGame() {
    let inputOk = checkInput();
    if (inputOk) {

      sendInfo("form");

      document.getElementById("game").className = "showing";
      document.getElementById("form").className = "hidden";

      document.getElementById("won").innerHTML = "0";
      document.getElementById("lost").innerHTML = "0";
      document.getElementById("score").innerHTML = "10";

      askNewRound();

    } else {
      console.log("not submitted");
      document.getElementById("submission_status").innerHTML = "You need to type the clinic \
      name and ID as given to you!";
    }
  }


  function checkInput() {
    let clinic = document.getElementById("clinic").value;
    let id = document.getElementById("id").value;

    let clinicPattern = /^[a-zA-Z\s]{2,}$/;
    let idPattern = /^[A-Z]{2}[0-9]{4}$/;

    let clinicSuccess = clinicPattern.test(clinic);
    let idSuccess = idPattern.test(id);

    return (idSuccess && clinicSuccess);
  }


  function askNewRound() {
    let roundDiv = document.createElement('div');
    roundDiv.setAttribute("id", "another_round");

    let roundP = document.createElement('p');

    if (roundNum === 0) {
      roundP.innerHTML = "Start game?";
    } else {
      roundP.innerHTML = "Another round?";
    }

    roundNum += 1;

    roundP.classList.add("round_paragraph");
    roundDiv.appendChild(roundP);

    let buttons = document.createElement("div");

    let yes = document.createElement("button");
    yes.classList.add("round_button");
    yes.innerHTML = "Yes";

    let quit = document.createElement("button");
    quit.classList.add("round_button");
    quit.innerHTML = "Quit";

    buttons.appendChild(yes);
    buttons.appendChild(quit);
    buttons.classList.add("buttonsDiv");

    roundP.appendChild(buttons);
    document.body.appendChild(roundDiv);

    yes.onclick = newRound;
    quit.onclick = quitGame;
  }


  function newRound() {
    exploded = false;
    inRound = true;

    getCompetitor();

    document.getElementById("pump").onclick = pump;
    document.getElementById("stop").onclick = stop;

    let balloonTop = document.getElementById("balloon_top");

    if (roundNum % 3 === 0) {
      balloonTop.src="balloon_top_g.png";
    } else {
      balloonTop.src="balloon_top.png";
    }

    balloonTop.style.height = "75px";
    balloonTop.style.width = "75px";

    let roundDiv = document.getElementById("another_round");
    document.body.removeChild(roundDiv);
    document.getElementById("score").innerHTML = "10";

    let scoreTag = document.getElementById("scoreMessage");
    scoreTag.innerHTML = "Current score:";
  }


  function pump() {
    if (inRound) {
      if (roundNum % 3 === 0) {
        checkExplodedGolden();
      } else {
        checkExploded();
      }

      if (!exploded) {
        let balloonTop = document.getElementById("balloon_top");
        let prevHeight = parseInt(window.getComputedStyle(balloonTop).height);

        let increment;

        if (prevHeight < 100) {
          increment = 7;
        } else if (prevHeight < 120) {
          increment = 6;
        } else {
          increment = 5;
        }

        balloonTop.style.height = "" + (prevHeight + increment) + "px";
        balloonTop.style.width = "" + (prevHeight + increment) + "px";

        let score = parseInt(document.getElementById("score").innerHTML);
        if (roundNum % 3 === 0) {
          document.getElementById("score").innerHTML = "" + (score + 20);
        } else {
          document.getElementById("score").innerHTML = "" + (score + 10);
        }

      }
    }
  }


  function checkExploded() {
    let it = 0;
    let randomNum = Math.floor(Math.random() * Math.floor(remainingNums));
    remainingNums -= 1;

    if (randomNum === it) {
      document.getElementById("balloon_top").src="balloon_exploded.png";
      remainingNums = 13;

      exploded = true;
      stop();
    }
  }


  function checkExplodedGolden() {
    let randomNum = Math.floor(Math.random() * Math.floor(10));

    if (probabilityArray[randomNum] === 1) {
      document.getElementById("balloon_top").src="balloon_exploded_g.png";
      probabilityArray = Array(12).fill(0);

      exploded = true;
      stop();

    } else {
      let index = probabilityArray.indexOf(0);
      probabilityArray[index] = 1;
    }
  }


  function stop() {
    if (inRound) {
      let scoreP = document.getElementById("score");
      let score = parseInt(scoreP.innerHTML);
      document.getElementById("scoreMessage").innerHTML = "Your final score for this round was:";

      if (exploded) {
        let lost = document.getElementById("lost");
        let pointsLost = parseInt(lost.innerHTML);
        lost.innerHTML = "" + (pointsLost + score);
        scoreP.innerHTML = "0";

      } else {
        let won = document.getElementById("won");
        let pointsWon = parseInt(won.innerHTML);
        won.innerHTML = "" + (pointsWon + score);
      }

      sendInfo("round");

      if (roundNum < roundLimit) {
        askNewRound();
      } else {
        quitGame(false);
      }
    }

    inRound = false;
  }


  function quitGame(participated) {
    if (participated === true) {
      document.getElementById("game").className = "hidden";
      document.getElementById("another_round").className = "hidden";
      document.getElementById("participated").className = "showing";

    } else {
      document.getElementById("game").className = "hidden";
      document.getElementById("ending").className = "showing";

      let wonPoints = document.getElementById("won").innerHTML;
      document.getElementById("finalWon").innerHTML += wonPoints;

      let lostPoints = document.getElementById("lost").innerHTML;
      document.getElementById("finalLost").innerHTML += lostPoints;

      if (document.getElementById("another_round") !== null) {
        document.getElementById("another_round").className = "hidden";
      }
    }
  }


  function sendInfo(mode) {
    let info = getInfo(mode);

    const fetchOptions = {
      method : 'POST',
      headers : {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body : JSON.stringify(info)
    };

    let url = "http://localhost:3000/";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function() {
        console.log("Data sent to server successfully.");
      })

      .catch(function(error) {
        console.log(error);
      });
  }


  function getInfo(mode) {
    let info;

    if (mode === "form") {
      let session = document.getElementById("session");
      let id = document.getElementById("id");
      info = {mode: "form", id: id.value,
              session: session.value};

    } else if (mode === "round") {
      let session = document.getElementById("session");
      let id = document.getElementById("id");
      let won = document.getElementById("won");
      let lost = document.getElementById("lost");

      info = {mode: "round", id: id.value,
              session: session.value,
              round: "" + roundNum, won: won.innerHTML,
              lost: lost.innerHTML};
    }

    return info;
  }


  function getCompetitor() {
    let session = document.getElementById("session").value;
    let round = "" + roundNum;
    let url = "http://localhost:3000?round=" + round + "&session=" + session;

    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let result = JSON.parse(responseText);
        document.getElementById("competitor_points").innerHTML = result;
      })

      .catch(function(error) {
        console.log(error);
      });
  }


  function checkStatus(response) {
      if (response.status >= 200 && response.status < 300) {
          return response.text();

      } else if (response.status == 422) {
        quitGame(true);
        return Promise.reject(new Error("Already participated this week."));

      } else if (response.status == 404) {
        return Promise.reject(new Error("Sorry, we couldn't find that page"));

      } else {
          return Promise.reject(new Error(response.status+": "+response.statusText));
      }
  }
})();
