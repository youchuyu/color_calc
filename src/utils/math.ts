function tanh(x: number): number {
  return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
}

export { tanh };
