'use strict';

const create2DArray = (rows, columns, value = false) => {
  let array = new Array(rows);
  for (var i = 0; i < rows; i++) {
    array[i] = new Array(columns);
    for (let j = 0; j < columns; j++) {
      array[i][j] = value;
    }
  }

  return array;
}

const rotateMatrix = (matrix) => {
  let result = [];
  for (let i = 0; i < matrix[0].length; i++) {
    let row = matrix.map(e => e[i]).reverse();
    result.push(row);
  }
  return result;
}

const divByCoordinate = (x, y) => {
  return $(`.column[data-x='${x}'] [data-y='${y}']`);
}

const drawField = () => {
  for (let x = 0; x < settings.field.width; x++) {
    $('main').append($(settings.html.columnDiv).attr('data-x', x));
    for (let y = 0; y < settings.field.height; y++) {
      $('main').children().last().append($(settings.html.squareDiv).attr('data-y', y));
    }
  }

  root.style.setProperty('--squareWidth', settings.field.width);
  root.style.setProperty('--squareHeight', settings.field.height);
  root.style.setProperty('--squareColor', settings.field.squareColor);
  root.style.setProperty('--squareBorderColor', settings.field.squareBorderColor);
}

const drawSquare = (x, y, color) => {
  divByCoordinate(x, y).css('background-color', color).css('background-color', color);
}

const drawObject = (inputObject, offsetX = 0, offsetY = 1, rotate = false) => {
  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0] - offsetX,
          y + inputObject.coordinate[1] - offsetY
        ]
        drawSquare(coordinate[0], coordinate[1], settings.field.squareColor);
      }
    }
  }

  if (rotate) {
    inputObject.object.appearance = rotateMatrix(inputObject.object.appearance);
  }

  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0],
          y + inputObject.coordinate[1]
        ]
        drawSquare(coordinate[0], coordinate[1], inputObject.object.color);
      }
    }
  }
}

const updateField = (inputObject) => {
  for (let x = 0; x < inputObject.object.appearance[0].length; x++) {
    for (let y = 0; y < inputObject.object.appearance.length; y++) {
      if (inputObject.object.appearance[y][x]) {
        const coordinate = [
          x + inputObject.coordinate[0],
          y + inputObject.coordinate[1]
        ];
        field.appearance[coordinate[1]][coordinate[0]] = true;
      }
    }
  }
}

const resetField = () => {
  field = {
    appearance: create2DArray(settings.field.height, settings.field.width)
  }
}

const resetMovingObject = () => {
  const min = 0;
  const max = objects.length - 1;
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  movingObject = {
    object: objects[random],
    coordinate: [
      Math.floor(settings.field.width / 2 - settings.object.maxWidth / 2),
      -settings.moving.offsetY
    ]
  }
}

const objectBelowMovingObject = (inputObject) => {

}

const refresh = () => {
  if (!waiting) {
    movingObject.coordinate[1] += settings.moving.offsetY;
    drawObject(movingObject, 0, settings.moving.offsetY);

    movingObject.object.appearance.length + movingObject.coordinate[1] >= settings.field.height ?
      waiting = true :
      waiting = false;
  } else {
    updateField(movingObject);
    resetMovingObject();
    waiting = false;
  }
  setTimeout(refresh, 1000 / settings.moving.fps)
}

const settings = {
  field: {
    width: 10,  //squares in one row
    height: 20, //squares in one column
    squareColor: '#000000',
    squareBorderColor: '#ffffff'
  },
  object: {
    maxWidth: 4,
    maxHeight: 4
  },
  moving: {
    offsetX: 1,
    offsetY: 1,
    baseFps: 2.75,
    fasterFps: 20,
    fps: undefined
  },
  control: {
    rotateLeft: undefined,
    rotateRight: 38,
    moveLeft: 37,
    moveRight: 39,
    faster: 40
  },
  html: {
    columnDiv: '<div class="column">',  //column divs in playing area
    squareDiv: '<div class="square">',  //div for the small squares
    columnDivNext: '<div>', //column divs in the next object area
    squareDivNext: '<div>'  //div for the small squares in the next object area
  }
};

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
]

//#region
let root = document.documentElement;

let field;
resetField();

let movingObject;
resetMovingObject();

let waiting = false;
settings.moving.fps = settings.moving.baseFps;
//#endregion

$(document).ready(() => {
  drawField();
  refresh();

  $(document).keydown((e) => {
    switch (e.which) {
      case settings.control.rotateLeft:
        rotate(0);
        break;
      case settings.control.rotateRight:
        if (
          movingObject.coordinate[0] + rotateMatrix(movingObject.object.appearance)[0].length <= settings.field.width &&
          movingObject.coordinate[1] + rotateMatrix(movingObject.object.appearance).length < settings.field.height
        ) {
          drawObject(movingObject, 0, 0, true);
        }
        if (!(movingObject.object.appearance.length + movingObject.coordinate[1] >= settings.field.height)) waiting = false;
        break;
      case settings.control.moveLeft:
        if (movingObject.coordinate[0] - settings.moving.offsetX > -1) {
          movingObject.coordinate[0] -= settings.moving.offsetX;
          drawObject(movingObject, -settings.moving.offsetX, 0);
        }
        break;
      case settings.control.moveRight:
        if (movingObject.coordinate[0] + movingObject.object.appearance[0].length < settings.field.width) {
          movingObject.coordinate[0] += settings.moving.offsetX;
          drawObject(movingObject, settings.moving.offsetX, 0);
        }
        break;
      case settings.control.faster:
        settings.moving.fps = settings.moving.fasterFps;
        console.log(settings.moving.fps);
        break;
    }
  });

  $(document).keyup((e) => {
    switch (e.which) {
      case settings.control.faster:
        settings.moving.fps = settings.moving.baseFps;
        console.log(settings.moving.fps);
        break;
    }
  });
});