import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const PenaltyShootOut = ({ onMiniGameEnd }) => {
  const gameContainerRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);

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
          debug: true,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };


    const game = new Phaser.Game(config); // Criação do jogo

    // Tempo de duração do mini-jogo (100 segundos)
    /*
    const gameDuration = 100000;
    setTimeout(() => {
      setIsGameOver(true);
      onMiniGameEnd(); // Chama a função que vai esconder o mini-jogo
    }, gameDuration);
    */

    return () => {
      // Cleanup do jogo quando o componente é desmontado
      game.destroy(true);
    };
  }, [onMiniGameEnd]);

  // Função preload do Phaser
  const preload = function () {
    this.load.image('campo', '/assets/PenaltyShootOut/campo.png');
    this.load.image('ball', '/assets/PenaltyShootOut/ball.png');
    this.load.spritesheet('player_red', '/assets/PenaltyShootOut/player_red.png', { frameWidth: 60, frameHeight: 131 });
    this.load.image('campogolo', '/assets/PenaltyShootOut/campogolo.png');
    this.load.image('ground', '/assets/PenaltyShootOut/platform.png');
    this.load.image('seta', '/assets/PenaltyShootOut/seta.png');
    this.load.image('baliza', '/assets/PenaltyShootOut/baliza.png');
    this.load.image('gk', '/assets/PenaltyShootOut/gk.png');
    this.load.audio('Goal', ['/assets/PenaltyShootOut/Goal.mp3']);
    this.load.audio('Apito', ['/assets/PenaltyShootOut/apito.mp3']);
    this.load.audio('torcida', ['/assets/PenaltyShootOut/torcida.mp3']);
    this.load.audio('errou', ['/assets/PenaltyShootOut/errou.mp3']);
    this.load.spritesheet('gk_blue', '/assets/PenaltyShootOut/gk_blue.png', { frameWidth: 127, frameHeight: 127 });
    this.load.image('robot', '../../assets/PenaltyShootOut/robot.png', { frameWidth: 60, frameHeight: 131 });
    this.load.image('alvo', '/assets/PenaltyShootOut/alvo.png');
    this.load.on('complete', function () {
      console.log('Assets loaded');
    });
  
  };

  let strengthBarAnimation, shootingArrowAnimation, strengthBar, shootingArrow;
  let goalkeeperAnimation;
  let hasKicked = false;
  let destinoXBola = 0, destinoYBola = 0, destinoXRedes = 0, destinoYRedes = 0;
  let distancia = 0, duracao = 0, velocidade = 0;
  let player, goalkeeper, bola, alvo1, alvo2;
  let score = 0, round = 1;
  let Defended = false;
  let scoreText, estadio, audio, errou, mouseCoordinatesText;

  const create = function () {
    /*
    mouseCoordinatesText = this.add.text(10, 10, 'Mouse: x: 0, y: 0', {
      fontSize: '20px',
      fill: '#ffffff',
    });
  
    // Captura o movimento do mouse
    this.input.on('pointermove', function (pointer) {
      console.log(`Mouse: x: ${pointer.x.toFixed(2)}, y: ${pointer.y.toFixed(2)}`);
    });
    */
    

    const platform_gk = this.physics.add.staticGroup();
    const platform_pk = this.physics.add.staticGroup();
    platform_gk.create(400, 360, 'ground').setScale(2).refreshBody();
    platform_pk.create(400, 625, 'ground').setScale(2).refreshBody();
    estadio = this.add.sprite(400, 300, 'campo');
    shootingArrow = this.add.image(400, 550, 'seta').setOrigin(1, 0.5);
    const audio = this.sound.add('Goal');
    const arbitro = this.sound.add('Apito');
    const torcida = this.sound.add('torcida');
    const errou = this.sound.add('errou');

    goalkeeper = this.physics.add.sprite(400, 332, 'robot');
    goalkeeper.setBounce(0.2);
    goalkeeper.setOrigin(0.5, 1);

    //goalkeeper.body.setCircle(50); // Define o corpo como circular
    goalkeeper.setSize(74, 210).setOffset(2, 3);
    //goalkeeper.body.setOffset(-25, 125); 
 
    bola = this.physics.add.sprite(400, 582, 'ball');
    bola.body.setCircle(12).setOffset(3, 0)
    alvo1 = this.physics.add.sprite(622, 134, 'alvo');
    alvo2 = this.physics.add.sprite(184, 134, 'alvo');
    alvo1.body.setAllowGravity(false);
    alvo2.body.setAllowGravity(false);
    player = this.physics.add.sprite(370, 535, 'player_red');
    player.setCollideWorldBounds(true);
    strengthBar = this.add.rectangle(745, 320, 20, 10, 0xff0000).setOrigin(1);
    strengthBar.setScale(1, 30);
    this.add.existing(strengthBar);

    shootingArrowAnimation = this.tweens.add({
      targets: shootingArrow,
      angle: { from: 40, to: 140 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    strengthBarAnimation = this.tweens.add({
      targets: strengthBar,
      scaleY: 4,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    

    this.physics.add.collider(goalkeeper, platform_gk);
    this.physics.add.collider(bola, platform_gk);
    this.physics.add.collider(bola, platform_pk);
    this.physics.add.collider(goalkeeper, bola, hitBola, null, this);

    const clock = this.time.addEvent({ delay: 0, loop: false });
    // Primeiro, crie o retângulo
    let rectangle = this.add.graphics();
    rectangle.fillStyle(0xFFffff, 1);
    rectangle.fillRoundedRect(244, 26, 320, 50, 10);
    rectangle.setDepth(0); // Defina a profundidade para o fundo

    // Depois, crie o texto
    scoreText = this.add.text(254, 36, 'Round:' + round + '  Score:' + score, {
      fontSize: '30px',
      fill: '#000000',
    });
    scoreText.setDepth(1); // Texto com maior profundidade que o retângulo

    torcida.play();
    arbitro.play();
    

    // Handle the shoot button click
    document.getElementById('button-shoot').addEventListener('click', function () {
      if (shootingArrowAnimation && strengthBarAnimation) {
        strengthBarAnimation.stop();

        if (!hasKicked) {
          shootingArrowAnimation.stop();
          strengthBarAnimation.play();
          hasKicked = true; // Set flag to true to indicate the player has kicked
        } else {
          strengthBarAnimation.stop();

          const { x, y } = calculateBallPosition(strengthBar);
          destinoXBola = x;
          destinoYBola = y;
          velocidade = 95000 / strengthBar.displayHeight;

          // Move the ball to the calculated position
          this.tweens.add({
            targets: bola,
            x: destinoXBola,
            y: destinoYBola,
            duration: velocidade,
            ease: 'Linear',
            onUpdate: function (tween, target) {
              console.log(`Bola movendo-se: x=${target.x}, y=${target.y}`);
            },
            onComplete: function () {
              console.log('Animação da bola completa');
              //update_score(bola);
              update_score.call(this, bola);
              //update_score.bind(this)(bola);

            },
          });
          
          
        }
      }
    });
  };

  
  function hitBola(goalkeeper, bola) {
    if (!Defended) {  // Verifica se a defesa já foi realizada
      console.log(`Defendeu: true`);  // Log quando o goleiro defende
      goalkeeper.body.moves = false;
      bola.body.moves = false;
      Defended = true; // Marca que a defesa foi realizada
    }
  }

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function calculateBallPosition(strengthBar){
  let x = 0;
  let y = 0;
  x = 400 - (Math.cos(Phaser.Math.DegToRad(shootingArrow.angle)) * strengthBar.displayHeight * 2.15);
  y = 581 - (Math.sin(Phaser.Math.DegToRad(shootingArrow.angle)) * strengthBar.displayHeight * 1.95);

  return {x, y};
}


const update_score = (bola) => {
  console.log(`Bola chegou em (${bola.x}, ${bola.y})`);
  if (Defended == false && bola.x >= 175 && bola.x <= 630 && bola.y >= 112 && bola.y <= 313) {
    score++;
    estadio.setTexture('campogolo'); // Atualiza o visual do estádio
    //this.sound.play('Goal'); // Toca o som do gol
    console.log('Golo ' + score);
  } else {
    //this.sound.play('errou'); // Toca o som de erro
    console.log('No Golo ' + score);
  }
  // Atualiza o texto do score e round
  scoreText.setText('Round:' + round + '  Score:' + score);
};


const handleShoot = () => {
  if (shootingArrowAnimation && strengthBarAnimation) {
    strengthBarAnimation.stop();
    if (!hasKicked) {
      shootingArrowAnimation.stop();
      strengthBarAnimation.play();
      hasKicked = true; // Marca que o jogador já clicou no botão
    } else {
      // Parar a barra de força e calcular a movimentação
      strengthBarAnimation.stop();

      // Calcula o destino da bola e a velocidade com base na barra de força
      const { x, y } = calculateBallPosition(strengthBar);
      destinoXBola = x;
      destinoYBola = y;
      velocidade = 95000 / strengthBar.displayHeight;
      

      bola.scene.tweens.add({
        targets: bola,
        x: destinoXBola,
        y: destinoYBola,
        duration: velocidade,
        ease: 'Linear',
        onComplete: function () {
          update_score(bola); // Atualiza o placar
        },
      });
      
      destinoXRedes = Phaser.Math.Between(185, 615);
      destinoYRedes = Phaser.Math.Between(125, 240);
      const possibleAngles = [0, -30, -45, -60, -90, 30, 45, 60, 90]; // Lista de ângulos possíveis
      const randomAngle = Phaser.Utils.Array.GetRandom(possibleAngles); 
      goalkeeper.scene.tweens.add({
        targets: goalkeeper,
        angle: randomAngle, // Define o destino da animação
        duration: 300, // Duração do movimento
        //ease: 'Sine.easeInOut', // Movimento suave
        ease: 'Linear',
        onComplete: function () {
          console.log(`Goleiro terminou no ângulo: ${randomAngle}`);
        },
      });
    }
  }
};



  // Função update do Phaser
  const update = function () {

  let distance = Phaser.Math.Distance.Between(bola.x, bola.y, destinoXBola, destinoYBola);
  if (distance <= 10) {
      /*
      if(!this.colliderGkBola){
          this.colliderGkBola = this.physics.add.collider(goalkeeper, bola, hitBola, null, this);
      }
          */
  }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={gameContainerRef} style={{ width: '800px', height: '600px' }} />
      {!isGameOver && (
        <button
          onClick={handleShoot}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px', // Alinhado à direita
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff', // Azul
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Shoot
        </button>
      )}
      {isGameOver && <p>Game Over!</p>}
    </div>
  );
};

export default PenaltyShootOut;
