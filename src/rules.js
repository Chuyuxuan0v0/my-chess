// 将索引转为坐标 [x, y]
const getPos = index => [index % 9, Math.floor(index / 9)];

/**
 * 检查坐标是否在九宫格内
 */
const isInPalace = (x, y, side) => {
  // 左右边界是固定的：第4列到第6列 (索引 3, 4, 5)
  if (x < 3 || x > 5) return false;

  // 上下边界取决于阵营
  if (side === 'red') {
    return y >= 7 && y <= 9; // 红方在底部 3 行
  } else {
    return y >= 0 && y <= 2; // 黑方在顶部 3 行
  }
};

/**
 * 检查棋盘上两个王是否安全（没有对脸）
 */
const isKingSafe = board => {
  // 找到两个王的索引
  let redKingIdx = -1;
  let blackKingIdx = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i]?.type === '将') {
      if (board[i].side === 'red') redKingIdx = i;
      if (board[i].side === 'black') blackKingIdx = i;
    }
  }

  // 如果王已经被吃了（胜负已分阶段），这里直接通过，交给胜负逻辑处理
  if (redKingIdx === -1 || blackKingIdx === -1) return true;

  const x1 = redKingIdx % 9;
  const x2 = blackKingIdx % 9;

  // 如果不在同一列，安全
  if (x1 !== x2) return true;

  // 如果在同一列，计算中间棋子数
  // 重用 countPiecesInRange
  const count = countPiecesInRange(redKingIdx, blackKingIdx, board);

  return count > 0; // 中间有棋子才安全，count 为 0 则说明对脸了，不合法
};

/**
 * 判断 side 这一方的王是否正在被攻击
 */
export const isCheck = (board, side) => {
  // 1. 找到 side 方王的位置
  const kingIndex = board.findIndex(p => p?.type === '将' && p.side === side);
  if (kingIndex === -1) return false;

  // 2. 遍历棋盘上所有对方的棋子
  const opponentSide = side === 'red' ? 'black' : 'red';

  for (let i = 0; i < board.length; i++) {
    const piece = board[i];
    if (piece && piece.side === opponentSide) {
      // 3. 检查这个对方棋子是否能“合法地”吃到王
      // 注意：这里调用各棋子的 check 函数，但不包含 isCheck 递归检查
      if (canPieceReach(i, kingIndex, board)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * 判断 side 这一方是否被【绝杀】
 */
export const isCheckmate = (board, side) => {
  // 1. 如果现在根本没被将军，那肯定不是绝杀
  if (!isCheck(board, side)) return false;

  // 2. 遍历棋盘上所有自己的棋子
  for (let fromIndex = 0; fromIndex < board.length; fromIndex++) {
    const piece = board[fromIndex];
    if (piece && piece.side === side) {
      // 3. 尝试这个棋子能走的每一个位置（0-89）
      for (let toIndex = 0; toIndex < 90; toIndex++) {
        // 使用我们之前写的 canMove，它已经包含了：
        // 物理路径检查、王不见王检查、走完后是否还被将军的检查
        if (canMove(fromIndex, toIndex, board)) {
          // 只要找到【任何一个棋子】有【任何一种走法】能通过 canMove
          // 就说明还没绝杀，还有救！
          return false;
        }
      }
    }
  }
  // 4. 试遍了所有棋子的所有走法，发现全都返回 false
  // 也就是怎么走都会死，这就是绝杀！
  return true;
};

/**
 * 这是一个纯粹的物理路径检查，不涉及“送将”逻辑
 * 仅仅判断 piece[from] 是否能按照规则走到 to
 */
const canPieceReach = (from, to, board) => {
  const piece = board[from];
  if (!piece) return false;

  switch (piece.type) {
    case '车':
      return checkJu(from, to, board);
    case '马':
      return checkMa(from, to, board);
    case '炮':
      return checkPao(from, to, board);
    case '兵':
      return checkBing(from, to, board);
    case '象':
      return checkXiang(from, to, board);
    case '士':
      return checkShi(from, to, board);
    case '将':
      return checkJiang(from, to, board);
    default:
      return false;
  }
};

/**
 * 将 规则  只能走直线一格，且不能吃对方的将 (王不见王)
 */
export const checkJiang = (from, to, board) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);
  const piece = board[from];
  const target = board[to];

  // 特殊情况：吃对方的将 (王不见王)
  if (target && target.type === '将') {
    // 必须在同一列
    if (x1 !== x2) return false;
    // 中间不能有任何棋子
    if (countPiecesInRange(from, to, board) === 0) return true;
  }

  // 普通情况 1：必须在九宫格内
  if (!isInPalace(x2, y2, piece.side)) return false;

  // 普通情况 2：走直线一格
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

/**
 * 士 规则  只能走斜线一格
 */
export const checkShi = (from, to, board) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);
  const piece = board[from];

  // 1. 必须在九宫格内
  if (!isInPalace(x2, y2, piece.side)) return false;

  // 2. 必须走斜线一格
  return Math.abs(x2 - x1) === 1 && Math.abs(y2 - y1) === 1;
};

/**
 * 象 规则  只能走田字 象眼中不能有其他棋子
 * @param {number} from - 起始索引
 * @param {number} to - 目标索引
 * @param {*} board
 * @returns
 */
export const checkXiang = (from, to, board) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);
  const piece = board[from];

  // 1. 田字格检查 (dx=2, dy=2)
  if (Math.abs(x1 - x2) !== 2 || Math.abs(y1 - y2) !== 2) return false;

  // 2. 塞象眼 (中点)
  const midIndex = ((y1 + y2) / 2) * 9 + (x1 + x2) / 2;
  if (board[midIndex]) return false;

  // 3. 楚河汉界限制
  // 红方在下 (y=5~9)，不能去 y < 5 的地方
  if (piece.side === 'red' && y2 < 5) return false;
  // 黑方在上 (y=0~4)，不能去 y > 4 的地方
  if (piece.side === 'black' && y2 > 4) return false;

  return true;
};

/** 马 规则  只能走日字，且没有蹩脚*/
// rules.js 里的 checkMa 逻辑改进版
export const checkMa = (from, to, board) => {
  const x1 = from % 9;
  const y1 = Math.floor(from / 9);
  const x2 = to % 9;
  const y2 = Math.floor(to / 9);
  const dx = x2 - x1; // 水平方向变化
  const dy = y2 - y1; // 垂直方向变化

  // 1. 验证是否为日字 (2x1 或 1x2)
  if (!(Math.abs(dx) * Math.abs(dy) === 2)) return false;

  // 2. 找到蹩腿点
  let hurdleIndex;
  if (Math.abs(dx) === 2) {
    // 横向跳，腿在起点的左右
    const hurdleX = x1 + (dx > 0 ? 1 : -1);
    const hurdleY = y1;
    hurdleIndex = hurdleY * 9 + hurdleX;
  } else {
    // 纵向跳，腿在起点的上下
    const hurdleX = x1;
    const hurdleY = y1 + (dy > 0 ? 1 : -1);
    hurdleIndex = hurdleY * 9 + hurdleX;
  }

  // 3. 检查棋盘该位置
  if (board[hurdleIndex]) {
    return false; // 有棋子，蹩腿
  }

  return true;
};

/**
 * 炮 规则  只能水平或垂直移动，不能斜着走，不能停留在原地，吃子时只能跨过一个棋子，移动时路径上不能有棋子
 */
const checkPao = (from, to, board) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);
  const target = board[to]; // 目标格子的棋子

  // 1. 几何检查
  if (x1 !== x2 && y1 !== y2) return false; // 必须在同一直线上
  if (x1 === x2 && y1 === y2) return false; // 不能原地不动

  // 2. 障碍检查：统计路径中间有多少个棋子
  const count = countPiecesInRange(from, to, board);

  // 3. 走棋检查
  if (!target) {
    // 情况 A：目标位置是空的 -> 走子，中间必须 0 个棋子
    return count === 0;
  } else {
    // 情况 B：目标位置有对方棋子 -> 吃子，中间必须 1 个棋子
    return count === 1;
  }
};

/**
 * 车 规则 只能水平或垂直移动，不能斜着走，不能停留在原地，不能跨过其他棋子
 */
const checkJu = (from, to, board) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);

  // 1. 几何检查
  if (x1 !== x2 && y1 !== y2) return false; // 必须在同一直线上
  if (x1 === x2 && y1 === y2) return false; // 不能原地不动

  // 2. 障碍检查：统计路径中间有多少个棋子
  const count = countPiecesInRange(from, to, board);

  // 对于“车”，路径中间的棋子数必须为 0
  return count === 0;
};

/**
 * 兵 规则  只能前进一步，不能后退，过了楚河汉界后可以左右移动一步
 * @param from - 起始索引
 * @param to - 目标索引
 * @param side - 阵营（'red' 或 'black'）
 */
const checkBing = (from, to, side) => {
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);
  const dx = x2 - x1; // 水平方向变化
  const dy = y2 - y1; // 垂直方向变化
  const absDx = Math.abs(dx); // 水平方向变化的绝对值

  if (side === 'red') {
    // 红方向上走 (y 减小)
    if (y2 >= y1) return false; // 不能后退或原地不动
    if (y1 >= 5) {
      // 未过河
      return dy === -1 && dx === 0;
    } else {
      // 已过河
      return (dy === -1 && dx === 0) || (dy === 0 && absDx === 1);
    }
  } else {
    // 黑方向下走 (y 增大)
    if (y2 <= y1) return false;
    if (y1 <= 4) {
      // 未过河
      return dy === 1 && dx === 0;
    } else {
      // 已过河
      return (dy === 1 && dx === 0) || (dy === 0 && absDx === 1);
    }
  }
};

/**
 * 计算两个索引点之间（不含首尾）的棋子数量
 */
const countPiecesInRange = (from, to, board) => {
  let count = 0;
  const [x1, y1] = getPos(from);
  const [x2, y2] = getPos(to);

  if (x1 === x2) {
    // 垂直方向上有多少个棋子
    const min = Math.min(y1, y2);
    const max = Math.max(y1, y2);
    for (let i = min + 1; i < max; i++) {
      if (board[i * 9 + x1]) count++;
    }
  } else {
    // 水平方向上有多少个棋子
    const min = Math.min(x1, x2);
    const max = Math.max(x1, x2);
    for (let i = min + 1; i < max; i++) {
      if (board[y1 * 9 + i]) count++;
    }
  }
  return count;
};

/**
 * 是否可以移动
 * @param from - 起始索引
 * @param to - 目标索引
 * @param board - 当前棋盘数据
 */

export const canMove = (from, to, board) => {
  const piece = board[from];
  const target = board[to];

  // 基础检查：不能吃自己人
  if (target && target.side === piece.side) return false;

  // 第一步：物理规则检查 (原来的 switch 逻辑)
  if (!canPieceReach(from, to, board)) return false;

  // 第二步：模拟演练 (虚拟走位)
  const nextBoard = [...board];
  nextBoard[to] = nextBoard[from];
  nextBoard[from] = null;

  // 第三步：王不见王判定 (之前写的逻辑)
  if (!isKingSafe(nextBoard)) return false;

  // 第四步：【新增】检查走完后，自己是否处于被将军状态
  // 如果走完这步，我的王被对方瞄准了，那就是“送将”，判定非法
  if (isCheck(nextBoard, piece.side)) {
    return false;
  }

  return true;
};
