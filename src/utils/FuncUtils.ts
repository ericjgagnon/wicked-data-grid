/**
 * @format
 */
export type Matched = 1 | 0;

export type WeightedSearch<T> = {
  (item: T): Matched;
  weight: number;
};

type WeightedItem<T> = {
  item: T;
  weight: number;
};

function weightedSearch<T>(array: T[], ...weightedTests: WeightedSearch<T>[]) {
  return array
    .reduce((weightedItems, item) => {
      const weightedItem = {
        item,
        weight: weightedTests.reduce((cumulativeWeight, weightedTest) => {
          const testResult = weightedTest(item);
          cumulativeWeight += testResult * weightedTest.weight;
          return cumulativeWeight;
        }, 0),
      };

      if (weightedItem.weight > 0) {
        weightedItems.push(weightedItem);
      }
      return weightedItems;
    }, [] as WeightedItem<T>[])
    .sort((item1, item2) => {
      if (item1.weight > item2.weight) {
        return -1;
      } else if (item1.weight < item2.weight) {
        return 1;
      }
      return 0;
    })
    .map(function (e) {
      return e.item;
    });
}

// Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for

// `wait` milliseconds.
function debounce<Args extends unknown[], Return = void>(
  func: (...args: Args) => Return,
  wait = 50,
  immediate = false,
) {
  let isImmediate = immediate;
  // 'private' variable to store the instance
  // in closure each timer will be assigned to it
  let timeout: ReturnType<typeof setTimeout> | null = null;

  // debounce returns a new anonymous function (closure)
  return function debouncedFunction(...args: Args) {
    // should the function be called now? If immediate is true
    // and not already in a timeout then the answer is: Yes
    const callNow = isImmediate && !timeout;

    // base case
    // clear the timeout to assign the new timeout to it.
    // when event is fired repeatedly then this helps to reset
    if (timeout) {
      clearTimeout(timeout);
    }

    // set the new timeout
    timeout = setTimeout(function () {
      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // check if the function already ran with the immediate flag
      if (!isImmediate) {
        // call the original function with apply
        func(...args);
      }
    }, wait);

    // immediate mode and no wait timer? Execute the function immediately
    if (callNow) {
      func(...args);
      isImmediate = false;
    }
  };
}

export { debounce, weightedSearch };
