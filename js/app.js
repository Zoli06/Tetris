"use strict";

//create a matrix and fill it
function createMatrix(rows, columns, value = false) {
  let array = new Array(rows);
  for (let i = 0; i < rows; i++) {
    array[i] = new Array(columns);
    for (let j = 0; j < columns; j++) {
      array[i][j] = value;
    }
  }

  return array;
}

//rotate a given matrix
function rotateMatrix(matrix, direction = 'right') {
  let result = [];

  if (direction == 'left') {
    for (let i = 0; i < 3; i++) {
      if (result.length != 0) matrix = [...result];
      result = [];
      for (let i = 0; i < matrix[0].length; i++) {
        let row = matrix.map(e => e[i]).reverse();
        result.push(row);
      }
    }
  } else {
    for (let i = 0; i < matrix[0].length; i++) {
      let row = matrix.map(e => e[i]).reverse();
      result.push(row);
    }
  }

  return result;
}

//generates random numbers
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//get the cell by coordinates
function divByCoordinate(x, y, field = 'main') {
  return $(`.column[${field}-data-x='${x}'] [${field}-data-y='${y}']`);
}

//draw the starting field
function drawField(field = 'main') {
  let width;
  let height;
  switch (field) {
    case 'main':
      width = settings.field.main.width;
      height = settings.field.main.height;
      break;
    case 'nexts':
      width = settings.field.nexts.width;
      height = settings.field.nexts.height;
      break;
    case 'hold':
      //width = settings.field.main.width;
      //height = settings.field.main.height;
      break;
  }
  for (let x = 0; x < width; x++) {
    $(`#${field}`).append($(settings.html.columnDiv).attr(`${field}-data-x`, x));
    for (let y = 0; y < height; y++) {
      $(`#${field}`).children().last().append($(settings.html.squareDiv).attr(`${field}-data-y`, y));
    }
  }

  root.style.setProperty('--squareWidth', settings.field.main.width);
  root.style.setProperty('--squareHeight', settings.field.main.height);
  root.style.setProperty('--squareColor', settings.field.squareColor);
  root.style.setProperty('--squareBorderColor', settings.field.squareBorderColor);
}

//color a cell
function drawSquare(x, y, color, field = 'main') {
  divByCoordinate(x, y, field).css('background-color', color);
}

//remove an object from its prevous place
function removeObject(inputObject, offsetX, offsetY, field) {
  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0] - offsetX,
          y + inputObject.coordinate[1] - offsetY
        ]
        drawSquare(coordinate[0], coordinate[1], settings.field.squareColor, field);
      }
    }
  }
}

//draw an object and remove the from the previous place if we want
function drawObject(inputObject, offsetX = 0, offsetY = 1, rotate = false, direction = 'left', field = 'main', remove = true) {
  if (remove) removeObject(inputObject, offsetX, offsetY, field);

  if (rotate) {
    inputObject.object.appearance = rotateMatrix(inputObject.object.appearance, direction);
  }

  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0],
          y + inputObject.coordinate[1]
        ]
        drawSquare(coordinate[0], coordinate[1], inputObject.object.color, field);
      }
    }
  }
}

//add the moving object to the locked objects
function updateField(inputObject) {
  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0],
          y + inputObject.coordinate[1]
        ]
        //drawSquare(coordinate[0], coordinate[1], 'white')
        field.appearance[coordinate[1]][coordinate[0]] = movingObject.object.color;
      }
    }
  }
}

//rewrite the variable of the locked objects but doesn't redraw the field
function resetField(_field = 'main') {
  field = {
    appearance: createMatrix(settings.field.main.height, settings.field.main.width),
    coordinate: [0, 0]
  }
}

//generate new moving object
function resetMovingObject() {
  movingObject = {
    object: { ...objects[gameplay.nexts[0]] },
    coordinate: [
      Math.floor(settings.field.main.width / 2 - settings.object.maxWidth / 2),
      -settings.moving.offsetY
    ]
  }
}

//validate moves
function checkObstruction(inputObjectOriginal, offsetX, offsetY, rotate = false) {
  let inputObject = JSON.parse(JSON.stringify(inputObjectOriginal));
  if (inputObject.coordinate[0] < 0) inputObject.coordinate[0] = 0;
  if (inputObject.coordinate[1] < 0) inputObject.coordinate[1] = 0;
  if (rotate) inputObject.object.appearance = rotateMatrix(inputObject.object.appearance);
  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        let coordinate = [
          x + inputObject.coordinate[0],
          y + inputObject.coordinate[1]
        ]
        if (coordinate[0] < 0) coordinate[0] = 0;
        if (coordinate[1] < 0) coordinate[1] = 0;
        if (field.appearance[coordinate[1]][coordinate[0]] != false) return true;
        coordinate = [
          x + inputObject.coordinate[0] + offsetX,
          y + inputObject.coordinate[1] + offsetY
        ]
        if (coordinate[0] > settings.field.main.width - 1) coordinate[0] = settings.field.main.width - 1;
        if (coordinate[1] > settings.field.main.height - 1) coordinate[1] = settings.field.main.height - 1;
        if (field.appearance[coordinate[1]][coordinate[0]] != false) return true;
      }
    }
  }
  return false;
}

//check if we need to wait for move before lock
function doWeWait() {
  return movingObject.object.appearance.length + movingObject.coordinate[1] >= settings.field.main.height || checkObstruction(movingObject, 0, settings.moving.offsetY);
}

//remove a row from the locked objects
function removeRow(row) {
  field.appearance.splice(row, 1);
  field.appearance.unshift(new Array(settings.field.main.width).fill(false));
}

//check if a row full
function isARowFilled(remove = true) {
  let filled = false;
  let filledRows = [];

  for (let row = 0; row < settings.field.main.height; row++) {
    for (let column = 0; column < settings.field.main.width; column++) {
      if (field.appearance[row][column] == false) break;
      if (column == settings.field.main.width - 1) {
        filled = true;
        filledRows.push(row);
      }
    }
  }

  if (remove) {
    for (let row = 0; row < filledRows.length; row++) {
      removeRow(filledRows[row]);
    }
  }

  increaseRewards(filledRows.length);

  return { filled };
}

//incrase the score proportional to the cleared lines
function increaseRewards(lines) {
  if (lines <= 0 || lines > 4) return;
  let baseScore = settings.scoring[lines - 1];

  let increaseScore = baseScore * (Number(gameplay.level) + 1);

  gameplay.rewards.score += increaseScore;
  gameplay.rewards.lines += lines;
  $('#score-span').text(gameplay.rewards.score);
  $('#lines-span').text(gameplay.rewards.lines);
}

//redraw the updated field. Call it when you updated the locked objects
function redrawField() {
  for (let x = 0; x < field.appearance[0].length; x++) {
    for (let y = 0; y < field.appearance.length; y++) {
      const coordinate = [
        x,
        y
      ];
      let color;
      field.appearance[y][x] !== false ?
        color = field.appearance[y][x] :
        color = settings.field.squareColor;
      drawSquare(coordinate[0], coordinate[1], color);
    }
  }
}

//reset next objects
function fillNexts() {
  for (let i = 0; i < 3; i++) {
    gameplay.nexts[i] = randomIntFromInterval(0, objects.length - 1);
  }
}

//generate new object to the nexts field
function generateNewNext() {
  gameplay.nexts.shift();
  gameplay.nexts.push(randomIntFromInterval(0, objects.length - 1));

  fullResetField('nexts');

  for (let i = 0; i < gameplay.nexts.length; i++) {
    let nextObject = {
      object: objects[gameplay.nexts[i]],
      coordinate: [1, (i * 3 + 1)]
    }

    drawObject(nextObject, 0, 0, false, undefined, 'nexts');
  }
}

//fully resset the field
function fullResetField(field = 'main') {
  let fieldReset = {
    coordinate: [0, 0],
    object: {
      appearance: createMatrix(settings.field[field].height, settings.field[field].width, true),
      color: '#000000',
      name: undefined
    }
  }
  drawObject(fieldReset, 0, 0, false, undefined, field);
}

//reflect to actions
function action(e) {
  switch (e) {
    case 'rotateRight':
      if (
        movingObject.coordinate[0] + rotateMatrix(movingObject.object.appearance, 'right')[0].length <= settings.field.main.width &&
        movingObject.coordinate[1] + rotateMatrix(movingObject.object.appearance, 'right').length < settings.field.main.height
      ) {
        let jumpY = rotateMatrix(movingObject.object.appearance, 'right').length - movingObject.object.appearance.length;
        if (!checkObstruction(movingObject, 0, -jumpY, true)) {
          movingObject.coordinate[1] -= jumpY;
          drawObject(movingObject, 0, -jumpY, true, 'right');
        }
      }
      break;
    case 'rotateLeft':
      if (
        movingObject.coordinate[0] + rotateMatrix(movingObject.object.appearance, 'left')[0].length <= settings.field.main.width &&
        movingObject.coordinate[1] + rotateMatrix(movingObject.object.appearance, 'left').length < settings.field.main.height
      ) {
        let jumpY = rotateMatrix(movingObject.object.appearance, 'left').length - movingObject.object.appearance.length;
        if (!checkObstruction(movingObject, 0, -jumpY, true)) {
          movingObject.coordinate[1] -= jumpY;
          drawObject(movingObject, 0, -jumpY, true, 'left');
        }
      }
      break;
    case 'moveLeft':
      if (movingObject.coordinate[0] - settings.moving.offsetX > -1 && !checkObstruction(movingObject, -settings.moving.offsetX, 0)) {
        movingObject.coordinate[0] -= settings.moving.offsetX;
        drawObject(movingObject, -settings.moving.offsetX, 0);
      }
      break;
    case 'moveRight':
      if (movingObject.coordinate[0] + movingObject.object.appearance[0].length < settings.field.main.width && !checkObstruction(movingObject, settings.moving.offsetX, 0)) {
        movingObject.coordinate[0] += settings.moving.offsetX;
        drawObject(movingObject, settings.moving.offsetX, 0);
      }
      break;
    case 'faster':
      gameplay.fps = 60 / settings.moving.speeds[gameplay.level] * 3;
      clearTimeout(refreshTimeOut);
      refresh();
      break;
    case 'pause':
      if (gameplay.paused) {
        refreshTimeOut = setTimeout(refresh, 1000 / gameplay.fps);
        gameplay.paused = false
      } else {
        clearTimeout(refreshTimeOut);
        gameplay.paused = true;
      }
      break;
    case 'hold':
    /*if (!gameplay.holding) {
    if (
      movingObject.coordinate[0] + objects[gameplay.nexts[0]].appearance[0].length <= settings.field.main.width &&
      movingObject.coordinate[1] + objects[gameplay.nexts[0]].appearance.length < settings.field.main.height
    ) {
      let jumpX = movingObject.object.appearance.length - objects[gameplay.nexts[0]].appearance.length;
      let jumpY = movingObject.object.appearance[0].length - objects[gameplay.nexts[0]].appearance[0].length;
      console.log(objects[gameplay.nexts[0]]);
      let checkObject = {
        coordinate: movingObject.coordinate,
        object: objects[gameplay.nexts[0]]
      } 
      if (!checkObstruction(checkObject, -jumpX, -jumpY, true)) {
        removeObject(movingObject, 0, 0, 'main');
        //holdingObject = movingObject;
        movingObject.coordinate[0] -= jumpX;
        movingObject.coordinate[1] -= jumpY;
        movingObject.object = objects[gameplay.nexts[0]];
        generateNewNext();
        drawObject(movingObject, 0, 0, false, 'right', 'main', false);
      }
    }
  } else {
    if (
      movingObject.coordinate[0] + holdingObject.object.appearance[0].length <= settings.field.main.width &&
      movingObject.coordinate[1] + holdingObject.object.appearance.length < settings.field.main.height
    ) {
      let jumpX = holdingObject.object.appearance.length - objects[gameplay.nexts[0]].appearance.length;
      let jumpY = holdingObject.object.appearance[0].length - objects[gameplay.nexts[0]].appearance[0].length;
      if (!checkObstruction(holdingObject, -jumpX, -jumpY, true)) {
        removeObject(movingObject, 0, 0, 'main');
        holdingObject = movingObject;
        movingObject.coordinate[0] -= jumpX;
        movingObject.coordinate[1] -= jumpY;
        movingObject.object = objects[gameplay.nexts[0]];
        generateNewNext();
        drawObject(movingObject, 0, 0, false, 'right', 'main', false);
      }
    }
  }*/
      break;
    case 'slower':
      gameplay.fps = 60 / settings.moving.speeds[gameplay.level];
  }
}

//call it every frame. One frame = one cell lower
let refreshTimeOut;

function refresh() {
  //wait a frame before lock
  doWeWait() ?
    waiting = true :
    waiting = false;
  if (!waiting) {
    movingObject.coordinate[1] += settings.moving.offsetY;
    drawObject(movingObject, 0, settings.moving.offsetY);

    doWeWait() ?
      waiting = true :
      waiting = false;
  } else {
    //next object.
    if (movingObject.coordinate[1] >= 0) {
      //add the moving object to the locked elements
      updateField(movingObject);
      //check if a row full and delete it
      isARowFilled(true);
      //redraw field with the deleted row
      redrawField();
      //load the next object
      resetMovingObject();
      //update the next objects
      generateNewNext();
    }

    waiting = false;
  }
  refreshTimeOut = setTimeout(refresh, 1000 / gameplay.fps);
}

//settings are here
const settings = {
  field: {
    main: {
      width: 10,
      height: 20
    },
    nexts: {
      width: 6,
      height: 10
    },
    hold: {
      width: 6,
      height: 6
    },
    squareColor: '#000000',
    squareBorderColor: '#000000'
  },
  object: {
    maxWidth: 4,
    maxHeight: 4
  },
  moving: {
    offsetX: 1,
    offsetY: 1,
    speeds: [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]
  },
  control: {
    rotateLeft: 90,
    rotateRight: 38,
    moveLeft: 37,
    moveRight: 39,
    faster: 40,
    pause: 80,
    hold: 67
  },
  html: {
    columnDiv: '<div class="column">',  //column divs in playing area
    squareDiv: '<div class="square">',  //div for the small squares
    columnDivNext: '<div>', //column divs in the next object area
    squareDivNext: '<div>',  //div for the small squares in the next object area
  },
  scoring: [
    40,
    100,
    300,
    1200
  ]
};

//we store objects here
const objects = [
  {
    name: 'I',
    appearance:
      [
        [true, true, true, true],
      ],
    color: '#00f0f0',
  },
  {
    name: 'J',
    appearance:
      [
        [true, false, false],
        [true, true, true],
      ],
    color: '#0000f0',
  },
  {
    name: 'L',
    appearance:
      [
        [false, false, true],
        [true, true, true,],
      ],
    color: '#f0a000',
  },
  {
    name: 'O',
    appearance:
      [
        [true, true],
        [true, true],
      ],
    color: '#f0f000',
  },
  {
    name: 'S',
    appearance:
      [
        [false, true, true],
        [true, true, false],
      ],
    color: '#00f000',
  },
  {
    name: 'T',
    appearance:
      [
        [false, true, false],
        [true, true, true],
      ],
    color: '#a000f0',
  },
  {
    name: 'Z',
    appearance:
      [
        [true, true, false],
        [false, true, true],
      ],
    color: '#f00000',
  },
];

//live variables
let gameplay = {
  fps: undefined,
  level: 0,
  rewards: {
    score: 0,
    lines: 0
  },
  nexts: [],
  paused: false
};

//preparations
//#region
let root = document.documentElement;

let field;
resetField();

fillNexts();

let movingObject;
resetMovingObject();

let waiting = false;
gameplay.level = prompt('Level (0, 29):', 0);
gameplay.fps = 60 / settings.moving.speeds[gameplay.level];
//#endregion

$(document).ready(() => {
  $('#level-span').text(gameplay.level);
  drawField();
  drawField('nexts');
  generateNewNext();
  refresh();

  //events
  $(document).keydown((e) => {
    switch (e.which) {
      case settings.control.rotateRight:
        action('rotateRight');
        break;
      case settings.control.rotateLeft:
        action('rotateLeft');
      case settings.control.moveLeft:
        action('moveLeft');
        break;
      case settings.control.moveRight:
        action('moveRight');
        break;
      case settings.control.faster:
        action('faster');
        break;
      case settings.control.pause:
        action('pause');
        break;
      case settings.control.hold:
        action('hold');
      break;
    }
  });

  $(document).keyup((e) => {
    switch (e.which) {
      case settings.control.faster:
        action('slower');
        break;
    }
  });
});