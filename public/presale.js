const toggleButton = document.querySelector('.dark-light');
 var isButtonPressed = false;
 var usdtSelected = false;

   (function () {
    const second = 1000,
          minute = second * 60,
          hour = minute * 60,
          day = hour * 24;
  
    const countdownEl = document.getElementById("countdown");
  
    function showCountdown(distance) {
      document.getElementById("days").innerText = Math.floor(distance / day);
      document.getElementById("hours").innerText = Math.floor((distance % day) / hour);
      document.getElementById("minutes").innerText = Math.floor((distance % hour) / minute);
      document.getElementById("seconds").innerText = Math.floor((distance % minute) / second);
    }
  
    function showSaleEnded() {
      // document.getElementById("countdown-headline").innerText = "The Sale has now Started!";
      // countdownEl.style.display = "none";
      // document.getElementById("ctd-end-content").style.display = "block";
    }
  
    function startCountdown() {
      const countDownDate = new Date("Feb 15, 2024 00:00:00").getTime();
  
      const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
  
        if (distance < 0) {
          showSaleEnded();
          clearInterval(x);
        } else {
          showCountdown(distance);
        }
      }, second);
       }
       startCountdown();
       })();

      //  const showCardButton12 = document.getElementById("showCardButton12");
      //  const popupCard12 = document.getElementById("popupCard12");
      //  const closeCardButton12 = document.getElementById("closeCardButton12");
       
      //  showCardButton12.addEventListener("click", function () {
      //      popupCard12.style.display = "block";
      //  });
       
      //  closeCardButton12.addEventListener("click", function () {
      //      popupCard12.style.display = "none";
      //  });

