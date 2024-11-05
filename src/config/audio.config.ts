export const AudioConfig = {
  scenes: {
    MenuScene: {
      music: {
        key: 'titleScreen',
        path: 'audio/music/MenuScene.ogg',
        config: {
          loop: true,
          volume: 0.2,
        },
      },
    },
    MainScene: {
      music: {
        key: 'gameMusic',
        path: 'audio/music/gameMusic.ogg',
        config: {
          loop: true,
          volume: 0.2,
        },
      },
    },
    GameOverScene: {
      music: {
        key: 'gameOverMusic',
        path: 'audio/music/gameOver.ogg',
        config: {
          loop: false,
          volume: 0.2,
        },
      },
    },
    OptionsScene: {
      music: {
        key: 'optionsMusic',
        path: 'audio/music/controles.ogg',
        config: {
          loop: true,
          volume: 0.2,
        },
      },
    },
  },
} as const;
