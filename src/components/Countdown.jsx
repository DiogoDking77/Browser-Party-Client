import React, { useEffect } from 'react';

const Countdown = ({ countdown, onCountdownEnd }) => {
  useEffect(() => {
    if (countdown === null) return;

    const steps = ['3', '2', '1', 'Let\'s Party!'];
    let currentIndex = steps.indexOf(countdown);

    const intervalId = setInterval(() => {
      currentIndex += 1;
      if (currentIndex < steps.length) {
        onCountdownEnd(steps[currentIndex]);
      } else {
        clearInterval(intervalId); // Limpa o intervalo após o último passo
        setTimeout(() => onCountdownEnd(null), 1500); // Avança para a próxima etapa após 1.5 segundos
      }
    }, 1000); // Intervalo de 1 segundo entre as trocas de contagem

    return () => clearInterval(intervalId); // Limpa o intervalo caso o componente seja desmontado
  }, [countdown, onCountdownEnd]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <h1 className="text-white text-6xl font-bold">{countdown}</h1>
    </div>
  );
};

export default Countdown;
