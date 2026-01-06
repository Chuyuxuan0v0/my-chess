// src/constants.js

// 棋子类型
export const TYPE = {
  JU: '车',
  MA: '马',
  XIANG: '象',
  SHI: '士',
  JIANG: '将',
  PAO: '炮',
  BING: '兵',
};

// 阵营颜色
export const SIDE = {
  RED: 'red',
  BLACK: 'black',
};

// 初始棋盘布局 (9x10)
// 我们用简写来代表：R=Red, B=Black
export const INITIAL_BOARD = [
  // 0-8: 黑方底线
  {type: "车", side: "black"}, {type: "马", side: "black"}, {type: "象", side: "black"}, {type: "士", side: "black"}, {type: "将", side: "black"}, {type: "士", side: "black"}, {type: "象", side: "black"}, {type: "马", side: "black"}, {type: "车", side: "black"},
  // 9-17: 空行
  null, null, null, null, null, null, null, null, null,
  // 18-26: 炮行
  null, {type: "炮", side: "black"}, null, null, null, null, null, {type: "炮", side: "black"}, null,
  // 27-35: 兵行
  {type: "兵", side: "black"}, null, {type: "兵", side: "black"}, null, {type: "兵", side: "black"}, null, {type: "兵", side: "black"}, null, {type: "兵", side: "black"},
  // 36-44: 楚河上方
  null, null, null, null, null, null, null, null, null,
  // 45-53: 汉界下方
  null, null, null, null, null, null, null, null, null,
  // 54-62: 兵行
  {type: "兵", side: "red"}, null, {type: "兵", side: "red"}, null, {type: "兵", side: "red"}, null, {type: "兵", side: "red"}, null, {type: "兵", side: "red"},
  // 63-71: 炮行
  null, {type: "炮", side: "red"}, null, null, null, null, null, {type: "炮", side: "red"}, null,
  // 72-80: 空行
  null, null, null, null, null, null, null, null, null,
  // 81-89: 红方底线
  {type: "车", side: "red"}, {type: "马", side: "red"}, {type: "象", side: "red"}, {type: "士", side: "red"}, {type: "将", side: "red"}, {type: "士", side: "red"}, {type: "象", side: "red"}, {type: "马", side: "red"}, {type: "车", side: "red"}
];