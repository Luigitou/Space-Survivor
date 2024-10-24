function debounce(func: Function, wait: number) {
  let timeout: number;
  return function (...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait) as unknown as number;
  };
}

const resizeGame = (gameInstance: Phaser.Game) => {
  if (gameInstance) {
    gameInstance.scale.resize(window.innerWidth, window.innerHeight);
  }
};

export const resize = (gameInstance: Phaser.Game) =>
  debounce(() => resizeGame(gameInstance), 200);
