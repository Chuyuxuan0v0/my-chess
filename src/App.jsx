import { useState } from 'react';
import { INITIAL_BOARD, SIDE } from './constants';
import Piece from './components/Piece';
import './App.less';
import { canMove, isCheckmate, isCheck } from './rules';
import GameOverModal from './components/GameOverModal';

function App() {
  const [turn, setTurn] = useState(SIDE.RED); // 定义回合，初始为红方先手
  const [board, setBoard] = useState(INITIAL_BOARD); // 创建棋盘状态
  const [selectedIndex, setSelectedIndex] = useState(null); // 核心：记录当前选中的索引。null 表示没选中。

  const [winner, setWinner] = useState(null); // 定义赢家状态，初始为 null

  // 重置游戏
  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn(SIDE.RED);
    setSelectedIndex(null);
    setWinner(null);
  };

  // 点击格子的处理函数
  const handleCellClick = index => {
    const clickedPiece = board[index];

    // 情况 A：当前还没有选中任何棋子（准备挑选棋子）
    if (selectedIndex === null) {
      if (!clickedPiece) return; // 点了空格子，没反应

      // 【关键安检】：点的是不是当前回合方的棋子？
      if (clickedPiece.side === turn) {
        setSelectedIndex(index); // 准许选中
      } else {
        console.log(
          '现在是' + (turn === SIDE.RED ? '红方' : '黑方') + '的回合！'
        );
      }
      return;
    }

    // 情况 B：已经选中了一个棋子（准备移动）
    // 1. 如果点的是自己已经选中的那个，就取消选中（反悔了）
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    // 2. 如果点的是自己阵营的另一个棋子，就切换选中（换一个棋子走）
    if (clickedPiece && clickedPiece.side === turn) {
      setSelectedIndex(index);
      return;
    }

    // 3. 尝试移动（剩下的情况：点的是空格子，或者是对方棋子）
    movePiece(selectedIndex, index);
  };

  // 移动逻辑处理
  const movePiece = (fromIndex, toIndex) => {
    // 如果已经有赢家，禁止任何移动
    if (winner) return;

    // 规则校验
    if (!canMove(fromIndex, toIndex, board)) {
      console.log('不符合规则，不能移动');
      return;
    }

    // 【关键】创建原数组的副本
    const newBoard = [...board];

    // 执行移动：目标格变成原格子的棋子，原格子变空
    newBoard[toIndex] = newBoard[fromIndex];

    newBoard[fromIndex] = null;

    setBoard(newBoard); // 更新棋盘状态
    setSelectedIndex(null); // 移动完取消选中

    // 关键：切换回合前，先看看对方是不是死局了
    const nextTurn = turn === SIDE.RED ? SIDE.BLACK : SIDE.RED;

    // 检查是否绝杀
    if (isCheckmate(newBoard, nextTurn)) {
      setWinner(turn); // 当前走棋的一方获胜
    } else {
      setTurn(nextTurn); // 没绝杀，切换回合
    }
  };

  return (
    <div className="app">
      <div className="status-bar">
        <div className={`turn-indicator ${turn}`}>
          当前回合：{turn === SIDE.RED ? '红色 (先手)' : '黑色 (后手)'}
        </div>
      </div>
      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${index}`}
            onClick={() => handleCellClick(index)} // 点击每个格子都调用
          >
            <Piece
              data={cell}
              isSelected={selectedIndex === index} // 传给子组件
              isCheck={cell?.type === '将' && isCheck(board, cell.side)}
            />
          </div>
        ))}
        <div className="river">
          <span>楚河</span>
          <span>漢界</span>
        </div>

        {winner && (
          <GameOverModal
            winner={winner}
            onRestart={resetGame}
          />
        )}
      </div>
    </div>
  );
}
export default App;
