// src/components/Piece.jsx
import React from 'react';

function Piece({ data, isSelected, isCheck }) {
  if (!data) return null; // 如果格子里没棋子，什么都不画

  const { type, side } = data; // type 棋子类型，side 棋子阵营（'red' 或 'black'）

  const className = `piece ${side} ${isSelected ? 'active' : ''} ${
    isCheck ? 'check-warning' : ''
  }`;

  return <div className={className}>{type}</div>;
}

export default Piece;
