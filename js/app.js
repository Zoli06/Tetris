const make2DArray = (height, width) => {
  let arr = [];

  for (let i = 0; i < width; i++) {
    arr.push(new Array(height));
  }

  arr.fill(false);

  return arr;
}

const divByCoordinate = (x, y) => {
  return $(`.column[data-x='${x}'] [data-y='${y}']`);
}

const getObjectAppearance = (x, y, object) => {
  return object.appearance[y][x];
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
}

const drawSquare = (x, y, color) => {
  divByCoordinate(x, y).css('background-color', color).css('background-color', color);
}

const drawObject = (objectX, objectY, object) => {
  for(x = 0; x < settings.object.width; x++) {
    for(y = 0; y < settings.object.height; y++) {
      if(getObjectAppearance(x, y, object)) {
        drawSquare(x + objectX, y + objectY, object.color)
      }
    }
  }
}

const settings = {
  field: {
    width: 10,  //squares in one row
    height: 20, //squares in one column
  },
  object: {
    width: 4,
    height: 4
  },
  html: {
    columnDiv: '<div class="column">',  //column divs in playing area
    squareDiv: '<div class="square">',  //div for the small squares
    columnDivNext: '<div>', //column divs in the next object area
    squareDivNext: '<div>',  //div for the small squares in the next object area
  }
};

const objects = [
  {
    name: 'I',
    appearance:
      [
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#00f0f0'
  },
  {
    name: 'J',
    appearance:
      [
        [true, false, false, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#0000f0'
  },
  {
    name: 'L',
    appearance:
      [
        [false, false, true, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#f0a000'
  },
  {
    name: 'O',
    appearance:
      [
        [true, true, false, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#f0f000'
  },
  {
    name: 'Z',
    appearance:
      [
        [false, true, true, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#00f000'
  },
  {
    name: 'T',
    appearance:
      [
        [false, true, false, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#a000f0'
  },
  {
    name: 'Z',
    appearance:
      [
        [true, true, false, false],
        [false, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ],
    color: '#f00000'
  },
]

//#region
let root = document.documentElement;
let field = make2DArray(settings.field.height, settings.field.width);
let movingObject = make2DArray(4, 4);
//#endregion

$(document).ready(() => {
  drawField();
  drawObject(5, 6, objects[1])
});