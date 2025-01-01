import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PenaltyShootOut = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    // Configuração inicial do Phaser
    const config = {
      type: Phaser.CANVAS,
      width: 800,
      height: 600,
      parent: gameContainerRef.current, // Colocar o Phaser no container React
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config); // Criação do jogo

    return () => {
      // Cleanup do jogo quando o componente é desmontado
      game.destroy(true);
    };
  }, []);

  // Função preload do Phaser
  const preload = function () {
    this.load.image('campo', '../../assets/PenaltyShootOut/campo.png');
    this.load.image('campogolo', '../../assets/PenaltyShootOut/campogolo.png');
    this.load.image('ground', '../../assets/PenaltyShootOut/platform.png');
    this.load.image('ball', '../../assets/PenaltyShootOut/ball.png');
    this.load.image('seta', '../../assets/PenaltyShootOut/seta.png');
    this.load.image('baliza', '../../assets/PenaltyShootOut/baliza.png');
    this.load.image('gk', '../../assets/PenaltyShootOut/gk.png');
    this.load.audio('Goal', ['../../assets/PenaltyShootOut/Goal.mp3']);
    this.load.audio('Apito', ['../../assets/PenaltyShootOut/apito.mp3']);
    this.load.audio('torcida', ['../../assets/PenaltyShootOut/torcida.mp3']);
    this.load.audio('errou', ['../../assets/PenaltyShootOut/errou.mp3']);
    this.load.spritesheet('gk_blue', '../../assets/PenaltyShootOut/gk_blue.png', { frameWidth: 127, frameHeight: 127 });
    this.load.spritesheet('player_red', '../../assets/PenaltyShootOut/player_red.png', { frameWidth: 60, frameHeight: 131 });
  };

  // Função create do Phaser
  const create = function () {
    const platform_gk = this.physics.add.staticGroup();
    const platform_pk = this.physics.add.staticGroup();
    platform_gk.create(400, 360, 'ground').setScale(2).refreshBody();
    platform_pk.create(400, 625, 'ground').setScale(2).refreshBody();

    const estadio = this.add.sprite(400, 300, 'campo');
    const shootingArrow = this.add.image(400, 550, 'seta').setOrigin(1, 0.5);

    const bola = this.physics.add.sprite(400, 582, 'ball');
    const player = this.physics.add.sprite(370, 535, 'player_red');
    player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('player_red', { start: 2, end: 3 }),
      frameRate: 8,
    });

    const strengthBar = this.add.rectangle(750, 550, 15, 100, 0xff0000).setOrigin(1);
    strengthBar.setScale(1, 1);

    const strengthBarAnimation = this.tweens.add({
      targets: strengthBar,
      scaleY: 4,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    strengthBarAnimation.stop();
  };

  // Função update do Phaser
  const update = function () {
    // Atualizar o estado do jogo aqui
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={gameContainerRef} style={{ width: '800px', height: '600px' }} />
      <button
        style={{
          position: 'absolute',
          top: '210px',
          left: '2px',
          padding: '5px',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '15px',
          cursor: 'pointer',
        }}
        onClick={() => console.log('Cheat activated')}
      >
        Cheat
      </button>
      <button
        style={{
          position: 'absolute',
          top: '10px',
          left: '680px',
          padding: '25px',
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '15px',
          cursor: 'pointer',
          display: 'none',
        }}
        id="button-next"
      >
        Next
      </button>
    </div>
  );
};

export default PenaltyShootOut;
