// numeral
import numeral from 'numeral';

// pretty bytes
import prettyBytes from 'pretty-bytes';

const findPercentage = ({ part = 0, whole = 0, roundOutput = false }) => {
  if (part === 0 || whole === 0) return 0;
  const percent = (100 * part) / whole;

  if (Number.isSafeInteger(percent)) return percent;
  return roundOutput ? Math.round(percent) : percent.toFixed(2);
};

const applyPercentage = ({ percent = 0, whole = 0 }) => {
  const value = (whole * percent) / 100;
  return Number.isSafeInteger(value) ? value : value.toFixed(2);
};

const prettyMemoryBytes = (number) => prettyBytes(number);

const getNumeralAmount = (value) => (Number(value) ? numeral(value).format('0,0') : 0);

const getNumberalInK = (value) => (Number(value) ? numeral(value).format('0.0 a') : 0);

const getNumberalInKWithoutDecimals = (value) => (Number(value) ? numeral(value).format('0.[0]a')?.toUpperCase() : 0);

const convertStringToNumber = (numberString) => parseInt(numberString, 10) || 0;

const numbersInDecimalFormat = (value) => {
  if (Number.isSafeInteger(value)) {
    return value;
  }

  return (Number(value) ? numeral(value).format('0,0.00') : 0);
};

export {
  findPercentage,
  applyPercentage,
  getNumeralAmount,
  getNumberalInK,
  getNumberalInKWithoutDecimals,
  convertStringToNumber,
  numbersInDecimalFormat,
  prettyMemoryBytes,
};
