import React from 'react';

const GameOverModal = ({ winner, onRestart }) => {
  return (
    <div className="modal-overlay">
      <div className={`modal-content ${winner}`}>
        <h2>{winner === 'red' ? '紅方' : '黑方'} 胜利</h2>
        <div className="winner-label">{winner === 'red' ? '帥' : '將'}</div>
        <p>棋局已定，胜负已分</p>
        <button onClick={onRestart}>再开一局</button>
      </div>
    </div>
  );
};

export default GameOverModal;
