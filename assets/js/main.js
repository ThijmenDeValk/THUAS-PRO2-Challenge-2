/*
 *  SPACEX Big Martian Dome Clock
 *  MADE BY THIJMEN
 *
 *  TABLE OF CONTENTS:
 *  1. HELPER THINGS
 *  2. CLOCK CLASS
 *  3. INITIALIZE
 */

/*
 * HELPER THINGS
 */

// HTML for generating the clock
const CLOCK_HTML = '<div class="clock__holder"><div class="clock__number">12</div><div class="clock__number clock__number--01">1</div><div class="clock__number clock__number--02">2</div><div class="clock__number clock__number--03">3</div><div class="clock__number clock__number--05 clock__number--bottom">4</div><div class="clock__number clock__number--04 clock__number--bottom">5</div><div class="clock__number clock__number--bottom">6</div><div class="clock__number clock__number--01 clock__number--bottom">7</div><div class="clock__number clock__number--02 clock__number--bottom">8</div><div class="clock__number clock__number--06">9</div><div class="clock__number clock__number--05">10</div><div class="clock__number clock__number--04">11</div><div class="clock__center"></div><div class="clock__hand clock__hand--hour"></div><div class="clock__hand clock__hand--minute"></div><div class="clock__hand clock__hand--second"></div><select class="clock__timezone"></select><div class="clock__timeOfDay"></div></div>';

// Array with timezones
const TIMEZONES = {
  SYD: {
    name: 'Sydney, AU',
    planet: 'earth',
    offset: 10,
  },
  AMS: {
    name: 'Amsterdam, NL',
    planet: 'earth',
    offset: 2,
  },
  LDN: {
    name: 'London, UK',
    planet: 'earth',
    offset: 1,
  },
  WDC: {
    name: 'Washington DC',
    planet: 'earth',
    offset: -4,
  },
  CAL: {
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

// Helper function to convert a Date object to degrees
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

/*
 *  CLOCK CLASS
 *  This clock takes care of itself!
 */
class Clock {
  /**
   * Create a new clock
   * @param {object} data - Data object with `offset`, `planet` and `name`
   * @param {*} element - DOM element the clock needs to present itself at
   */
  constructor(timezone, element) {
    const timezoneData = TIMEZONES[timezone];
    this.timezoneCode = timezone;
    this.timezone = timezoneData.offset;
    this.name = timezoneData.name;
    this.planet = timezoneData.planet;

    this.element = element;

    this.hands = {
      hour: null,
      minute: null,
      second: null,
    };

    this.handsPosition = {
      hour: null,
      minute: null,
      second: null,
    };

    this.timeOfDay = null;

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

    const timezoneElement = this.element.querySelector('.clock__timezone');

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, content] of Object.entries(TIMEZONES)) {
      timezoneElement.innerHTML += `<option name="${key}" ${((this.timezoneCode === key) && 'selected') || ''}>${content.name}</option>`;
    }
  }

  /**
   * Fade in the clock
   */
  animateIn() {
    // Wait just 1000ms to hide the ugly 'getting ready' flashes
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

  changeTimezone(element) {
    const timezone = element.target.selectedOptions[0].attributes.name.value;
    const timezoneData = TIMEZONES[timezone];
    this.timezoneCode = timezone;
    this.timezone = timezoneData.offset;
    this.name = timezoneData.name;
    this.planet = timezoneData.planet;
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
        delay = 250;
      }

      if (degree !== '0deg') {
        setTimeout(() => {
          element.style.setProperty('--rotation', degree);
        }, delay);
      } else if (this.handsPosition[key] !== '0deg') {
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

      this.handsPosition[key] = degree;
    }

    // Animate time of day
    const hour = time.getUTCHours();

    if ((hour >= 18 || hour < 6) && this.timeOfDay !== 'night') {
      const timeOfDayElement = this.element.querySelector('.clock__timeOfDay');
      // For the night transition, we might collide with the first
      // animation if we display too quickly, so we just don't animate
      let delay = 500;
      if (!timeOfDayElement.classList.contains('show')) {
        delay = 0;
      }
      timeOfDayElement.classList.remove('show');
      this.timeOfDay = 'night';
      setTimeout(() => {
        timeOfDayElement.classList.add('night');
        if (delay > 0) {
          timeOfDayElement.classList.add('show');
        }
      }, delay);
    }
    if ((hour >= 6 && hour < 18) && this.timeOfDay !== 'day') {
      const timeOfDayElement = this.element.querySelector('.clock__timeOfDay');
      timeOfDayElement.classList.remove('show');
      this.timeOfDay = 'day';
      setTimeout(() => {
        timeOfDayElement.classList.remove('night');
        timeOfDayElement.classList.add('show');
      }, 500);
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
   * Start the event listener for changing the timezone
   */
  startEventListener() {
    const timezoneElement = this.element.querySelector('.clock__timezone');
    timezoneElement.addEventListener('change', this.changeTimezone.bind(this));
  }

  /**
   * Start running this clock!
   */
  start() {
    this.build();
    this.startCounter();
    this.startEventListener();
    this.animateIn();
  }
}

/*
 * INITIALIZE
 */

const clockLocations = document.querySelectorAll('section');
const clocks = [];

clockLocations.forEach((element, i) => {
  const clock = new Clock(element.dataset.timezone, element);
  clocks[i] = clock;
  setTimeout(() => {
    clock.start();
  }, i * 500);
});
