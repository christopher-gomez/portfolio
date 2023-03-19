export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function getLightnessOfRGB(rgbString) {
    // First convert to an array of integers by removing the whitespace, taking the 3rd char to the 2nd last then splitting by ','
    const rgbIntArray = rgbString
      .replace(/ /g, "")
      .slice(4, -1)
      .split(",")
      .map((e) => parseInt(e));

    // Get the highest and lowest out of red green and blue
    const highest = Math.max(...rgbIntArray);
    const lowest = Math.min(...rgbIntArray);
    // Return the average divided by 255
    return (highest + lowest) / 2 / 255;
  }

  function getLowestMiddleHighest(rgbIntArray) {
    let highest = { val: 0, index: -1 };
    let lowest = { val: Infinity, index: -1 };

    rgbIntArray.map((val, index) => {
      if (val > highest.val) {
        highest = { val: val, index: index };
      }
      if (val < lowest.val) {
        lowest = { val: val, index: index };
      }
    });

    let middle = { index: 3 - highest.index - lowest.index };
    middle.val = rgbIntArray[middle.index];
    return [lowest, middle, highest];
  }

  export function saturateByTenth({ r, g, b }) {
    const rgbIntArray = [r, g, b];
    const greyVal = getLightnessOfRGB(`rgb(${r}, ${g}, ${b})`) * 255;
    const [lowest, middle, highest] = getLowestMiddleHighest(rgbIntArray);

    if (lowest.val === highest.val) {
      return { r, g, b };
    }

    const saturationRange = Math.round(Math.min(255 - greyVal, greyVal));

    const maxChange = Math.min(255 - 50, lowest.val);

    const changeAmount = Math.min(saturationRange / 10, maxChange);

    const middleValueRatio =
      (greyVal - middle.val) / (greyVal - highest.val);

    const returnArray = [];
    returnArray[highest.index] = Math.round(highest.val + changeAmount);
    returnArray[lowest.index] = Math.round(lowest.val - changeAmount);
    returnArray[middle.index] = Math.round(
      greyVal + (returnArray[highest.index] - greyVal) * middleValueRatio
    );

    return { r: returnArray[0], g: returnArray[1], b: returnArray[2] };
  }