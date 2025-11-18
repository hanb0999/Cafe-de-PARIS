// CHARACTER GRID
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".character-grid");
  if (grid) { 
      const imgEls = Array.from(grid.querySelectorAll("img"));
      const finalOrder = imgEls.map(img => img.src); 
      const pool = [...finalOrder];
        
      let isLotteryActive = false;
      let lotteryCharacterSrc = '';
        
      const LOTTERY_ROW = 1; 
      const LOTTERY_CHANCE = 0.5; 

      const hoverMessage = document.createElement('div');
      hoverMessage.textContent = "カチャッと一勝負！"; 
      hoverMessage.classList.add('shuffle-message');
      document.body.appendChild(hoverMessage);

      function getValidRandomSrc(index) {
          const rowLength = 3; 
          const currentIndex = index % rowLength;

          let attempts = 0;
          let src;

          do {
              src = pool[Math.floor(Math.random() * pool.length)];
              attempts++;

              const leftIndex = index - 1;
              const topIndex = index - rowLength;

              const leftMatch = leftIndex >= 0 && (currentIndex !== 0) && imgEls[leftIndex].src === src;
              const topMatch = topIndex >= 0 && imgEls[topIndex].src === src;

              if (!leftMatch && !topMatch) {
                  return src;
              }
          } while (attempts < 20);

          return src; 
      }

      function startFollowerEffect(characterSrc) {

          const existingFollower = document.querySelector('character-follower');
          if (existingFollower) existingFollower.remove();
            
          const follower = document.createElement('img');
          follower.src = characterSrc;
          follower.classList.add('character-follower');
            
          follower.classList.add('pop-out'); 
          document.body.appendChild(follower);

          setTimeout(() => follower.classList.remove('pop-out'), 500);

          const followerMessage = document.createElement('div');
          followerMessage.textContent = "またね！"; 
          followerMessage.classList.add('follower-message');
          document.body.appendChild(followerMessage);

          let lastScrollY = window.scrollY;

          function updateFollowerPosition() {
              let targetY = window.scrollY;
              lastScrollY += (targetY - lastScrollY) * 0.1;
              follower.style.transform = `translateY(${lastScrollY}px)`;

              const rect = follower.getBoundingClientRect();
              followerMessage.style.top = `${rect.top + window.scrollY - 30}px`; 
              followerMessage.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          }

          function animateFollow() {
              if (follower.parentNode) {
                  updateFollowerPosition();
                  requestAnimationFrame(animateFollow);
              }
          }
            
          animateFollow(); 
      
          follower.addEventListener('mouseenter', () => {
              followerMessage.style.display = 'block';
          });
            
          follower.addEventListener('mouseleave', () => {
              followerMessage.style.display = 'none';
          });

          follower.addEventListener('click', () => {
              follower.remove();
              followerMessage.remove(); 
          });
      }

      function startShuffle(checkLottery) {
          grid.style.pointerEvents = 'none'; 
          isLotteryActive = false;
          grid.classList.remove('jackpot-glow');
            
          if (checkLottery && Math.random() < LOTTERY_CHANCE) {
              isLotteryActive = true;
              lotteryCharacterSrc = pool[Math.floor(Math.random() * pool.length)];
              console.log(`JACKPOT HIT! Winning character: ${lotteryCharacterSrc}`); 
          }

          let ticks = 0;
          const maxTicks = 22;
          const intervalMs = 90;

          const interval = setInterval(() => {
              imgEls.forEach((img, idx) => {
                  img.src = getValidRandomSrc(idx); 
              });

              ticks++;

              if (ticks >= maxTicks) {
                  clearInterval(interval);
                   
                  imgEls.forEach((img, idx) => {
                      const currentRow = Math.floor(idx / 3);
                      if (isLotteryActive && currentRow === LOTTERY_ROW) {
                          img.src = lotteryCharacterSrc; 
                      } else {
                          img.src = finalOrder[idx]; 
                      }
                  });

                  if (isLotteryActive) {
                      const winningRow = imgEls.slice(LOTTERY_ROW * 3, LOTTERY_ROW * 3 + 3);
            
                      winningRow.forEach(img => {
                          img.classList.add('jackpot-grow');
                      });
                      grid.classList.add('jackpot-glow');

                      setTimeout(() => {
                          winningRow.forEach(img => img.classList.remove('jackpot-grow'));
                          startFollowerEffect(lotteryCharacterSrc);
                      
                          setTimeout(() => {
                              grid.classList.remove('jackpot-glow'); 
                          }, 500); 
                            
                          grid.style.pointerEvents = 'auto'; 
                      }, 800); 
                  } else {
                      grid.style.pointerEvents = 'auto'; 
                  }
              }
          }, intervalMs);
      }
      
      startShuffle(false); 

      grid.addEventListener('click', () => {
          if (grid.style.pointerEvents !== 'none') {
              startShuffle(true); 
          }
      });

      imgEls.forEach(img => {
          img.addEventListener('mouseenter', () => {
              const rect = img.getBoundingClientRect();
                
              hoverMessage.style.display = 'block';
              hoverMessage.style.top = `${rect.top + window.scrollY - 25}px`;
              hoverMessage.style.left = `${rect.left + window.scrollX + rect.width / 2 + 5}px`;
          });
            
          img.addEventListener('mouseleave', () => {
              hoverMessage.style.display = 'none';
          });
      });
  }
    
  // ABOUT BOTTOM TEXT TYPING 
  function setupCurveTextTyping() {
      const curveTextPath = document.getElementById('curveTextPath'); 
        
      if (!curveTextPath) return;

      const fullText = curveTextPath.getAttribute('data-text');
      curveTextPath.textContent = ''; 
        
      function startTyping(element, text) {
          let index = 0;
          const typingIntervalMs = 80; 

          function typeCharacter() {
              if (index < text.length) {
                  element.textContent += text.charAt(index);
                  index++;
                  setTimeout(typeCharacter, typingIntervalMs);
              }
          }
          typeCharacter();
      }

      const observerOptions = {
          root: null,
          rootMargin: '0px 0px -100px 0px', 
          threshold: 0.01
      };

      const curveObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  startTyping(entry.target, fullText);
                  observer.unobserve(entry.target);
              } 
          });
      }, observerOptions);

      curveObserver.observe(curveTextPath); 
  }

  setupCurveTextTyping();
});

// --- DROP DOWN MENU ---
const floatingButton = document.getElementById("floatingMenuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const mainNav = document.querySelector(".main-nav"); 

if (floatingButton && dropdownMenu && mainNav) {
    window.addEventListener("scroll", () => {
        const mainNavBottom = mainNav.getBoundingClientRect().bottom;
        if (mainNavBottom < 0) { 
            floatingButton.style.display = "block";
        } else {
            floatingButton.style.display = "none";
            dropdownMenu.style.display = "none"; 
        }
    });

    floatingButton.addEventListener("click", () => {
        dropdownMenu.style.display =
            dropdownMenu.style.display === "block" ? "none" : "block";
    });
}

// --- ABOUT OVAL SLIDESHOW ---
(function () {
  const oval = document.querySelector('.about-oval');
  if (!oval) return;

  const slides = Array.from(oval.querySelectorAll('.oval-slide'));
  if (slides.length <= 1) return;

  let current = 0;
  const intervalMs = 3000;

  slides.forEach((s, i) => {
    s.style.opacity = i === 0 ? '1' : '0';
    s.classList.toggle('active', i === 0);
    s.style.zIndex = i === 0 ? 2 : 1;
  });

  setInterval(() => {
    const next = (current + 1) % slides.length;

    slides[current].classList.remove('active');
    slides[current].style.opacity = '0';
    slides[current].style.zIndex = 1;

    slides[next].classList.add('active');
    slides[next].style.opacity = '1';
    slides[next].style.zIndex = 2;

    current = next;
  }, intervalMs);
})();

// --- ACCESS SLIDESHOW ---
(function () {
    const track = document.getElementById('imageSliderTrack');
    if (!track) return;

    const IMAGE_WIDTH = 615; 
    const IMAGE_GAP = 20;   
    const IMAGE_COUNT_DISPLAYED = 6; 
    
    const RESET_POINT = (IMAGE_WIDTH * IMAGE_COUNT_DISPLAYED) + (IMAGE_GAP * IMAGE_COUNT_DISPLAYED); 

    let currentPosition = 0;

    track.style.willChange = 'transform';
    track.style.transition = 'none';

    function startScroll() {
        currentPosition -= 1; 

        if (currentPosition <= -RESET_POINT) {
            currentPosition = 0;
            track.style.transition = 'none'; 
        } else {
            track.style.transition = 'transform 0.0s linear'; 
        }

        track.style.transform = `translateX(${currentPosition}px)`;

        requestAnimationFrame(startScroll);
    }

    setTimeout(() => {
        startScroll();
    }, 100); 
})();