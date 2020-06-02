/*
 *  SPACEX Big Martian Dome Clock
 *  MADE BY THIJMEN
 *
 *  TABLE OF CONTENTS:
 *  1. DATA
 *  2. HELPER FUNCTIONS
 *  3. INITIALIZE THE SPACECRAFT
 *  4. REFRESH THE UI AND DATA
 *  5. INTERACTION HANDLERS
 *  6. INITIALIZE EVERYTHING
 */

const CLOCK_HTML = '<div class="clock__holder"><div class="clock__number">12</div><div class="clock__number clock__number--01">1</div><div class="clock__number clock__number--02">2</div><div class="clock__number clock__number--03">3</div><div class="clock__number clock__number--05 clock__number--bottom">4</div><div class="clock__number clock__number--04 clock__number--bottom">5</div><div class="clock__number clock__number--bottom">6</div><div class="clock__number clock__number--01 clock__number--bottom">7</div><div class="clock__number clock__number--02 clock__number--bottom">8</div><div class="clock__number clock__number--06">9</div><div class="clock__number clock__number--05">10</div><div class="clock__number clock__number--04">11</div><div class="clock__center"></div><div class="clock__hand clock__hand--hour"></div><div class="clock__hand clock__hand--minute"></div><div class="clock__hand clock__hand--second"></div><div class="clock__timezone"></div></div>';

const TIMEZONES = {
  AMS: {
    name: 'Amsterdam, NL',
    planet: 'earth',
    offset: 2,
  },
  SF: {
    name: 'Hawthorne, CA',
    planet: 'earth',
    offset: -7,
  },
  UTC: {
    name: 'UTC',
    planet: 'earth',
    offset: 0,
  },
};


function timeToDegree(time, format) {
  switch (format) {
    case 'hour':
      return `${((time.getUTCHours() % 12) * 30) + (time.getUTCMinutes() * 0.5)}deg`;
    case 'minute':
      return `${time.getUTCMinutes() * 6}deg`;
    case 'second':
      return `${time.getUTCSeconds() * 6}deg`;
    default:
      return '0deg';
  }
}

class Clock {
  /**
   * Create a new clock
   * @param {object} data - Data object with `offset`, `planet` and `name`
   * @param {*} element - DOM element the clock needs to present itself at
   */
  constructor(data, element) {
    this.timezone = data.offset;
    this.planet = data.planet;
    this.name = data.name;

    this.element = element;

    this.hands = {
      hour: null,
      minute: null,
      second: null,
    };

    this.time = {
      hour: 0,
      minute: 0,
      second: 0,
    };

    this.counter = null;
  }

  /**
   * Build the HTML for the clock
   */
  build() {
    this.element.innerHTML = CLOCK_HTML;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(this.hands)) {
      this.hands[key] = this.element.querySelector(`.clock__hand--${key}`);
    }
    this.element.querySelector('.clock__timezone').innerHTML = this.name;
  }

  /**
   * Fade in the clock
   */
  animateIn() {
    // Wait just 200ms to hide the ugly 'getting ready' flashes
    setTimeout(() => {
      // Fade in every part of the clock one by one
      const clockItems = this.element.querySelectorAll('.clock__holder *');
      clockItems.forEach((item, j) => {
        setTimeout(() => {
          item.classList.add('show');
        }, j * 50);
      });
    }, 200);
  }

  /**
   * One tick of the clock (so one second)
   */
  tick() {
    const UTC = new Date();
    const time = new Date(UTC.getTime() + this.timezone * 3600000);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, element] of Object.entries(this.hands)) {
      const degree = timeToDegree(time, key);
      let delay = 0;

      if (key === 'minute') {
        delay = 500;
      }

      if (degree !== '0deg') {
        setTimeout(() => {
          element.style.setProperty('--rotation', degree);
        }, delay);
      } else {
        // Do crazy things when we're about to jump to 0, because the dial
        // will circle all the way back 360 degrees (very ugly)
        element.style.setProperty('--rotation', '360deg');

        // Wait for animation to be over
        setTimeout(() => {
          element.classList.add('animation-disabled');
          element.style.setProperty('--rotation', '0deg');
          // Give the browser a breather
          setTimeout(() => {
            element.classList.remove('animation-disabled');
          }, 100);
        }, 200);
      }
    }
  }

  /**
   * Let the clock count!
   */
  startCounter() {
    // We want to align our counter with the seconds exactly,
    // so we're doing an awkward catch up for two seconds
    this.tick();

    const time = new Date();
    const timeUntilNextSecond = (1000 - time.getUTCMilliseconds());
    setTimeout(() => {
      this.tick();

      this.counter = setInterval(() => {
        this.tick();
      }, 1000);
    }, timeUntilNextSecond);
  }

  /**
   * Stop the clock from counting. #frozenintime
   */
  stopCounter() {
    // Don't stop the interval if there isn't any... cuz that's just stupid
    if (this.counter) {
      clearInterval(this.counter);
    }
  }

  /**
   * Start running this clock!
   */
  start() {
    this.build();
    this.startCounter();
    this.animateIn();
  }
}

const clocks = document.querySelectorAll('section');

clocks.forEach((element, i) => {
  const data = TIMEZONES[element.dataset.timezone];
  const clock = new Clock(data, element);
  setTimeout(() => {
    clock.start();
  }, i * 500);
});
