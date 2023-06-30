export const getRandomNumberInRange = (minimumInclusive, maximumExclusive) => (
  minimumInclusive + Math.random() * (maximumExclusive - minimumInclusive)
);

export const getRandomIntegerInRange = (minimumInclusive, maximumExclusive) => (
  Math.trunc(
    getRandomNumberInRange(minimumInclusive, maximumExclusive),
  )
);
