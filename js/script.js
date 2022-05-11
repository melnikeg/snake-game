//  Настройки "холста"
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//  Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;

//  Вычисляем ширину и высоту в ячейках
var blockSize = 10;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

//  Устанавливаем счет 0
var score = 0;
// Устанавливаем скорость 1
var speedGame = 1;

//  Рисуем рамку
function drawBorder () {
    ctx.fillStyle = "Gray";
    //ctx.fillRect(0, 0, width, blockSize); // Верхняя полоса рамки
    ctx.fillRect(0, 30, width, blockSize);// Верхняя граница
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 30, blockSize, height); // Левая граница
    ctx.fillRect(width - blockSize, 30, blockSize, height); //Правая граница
};

//  Выводим счет игры в левом верхнем углу
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Счёт: " + score, blockSize, blockSize);		
};
function drawSpeed() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Скорость: " + speedGame, width - blockSize, blockSize);
};

//  Отменяем действие setTimeout и печатаем сообщение "Конец игры"
function gameOver() {        
    clearTimeout(timeoutId);
    ctx.font = "60px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры", width / 2, height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Чтобы сыграть ещё раз,", width / 2, height / 2 + 70);
    ctx.fillText("просто, перезагрузите страницу", width / 2, height / 2 + 100);
    ctx.globalCompositeOperation='destination-over';
};

    
//  Рисуем окружность (использя функцию из главы 14)
function circle (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

//  Задаем конструктор Block (ячейка)
var Block = function (col, row) {
    this.col = col;
    this.row = row;
};

//  Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

//  Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

//  Проверяем, находится ли эта ячейка в той же позиции, что и ячейка otherBlock
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

//  Задаем конструктор Snake (змейка)
var Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5),
    ];
    this.direction = "right";
    this.nextDirection = "right";      
    this.oldDirection;
};

//  Рисуем квадратик для каждого сегмента тела змейки 
//  Добалена проверка на деление без остатка. %2 - это остаток от деления на 2.
//  То есть, если есть остаток не равен 0, будет присвоен другой цвет
Snake.prototype.draw = function () {
    color = "Green";
    for (var i = 0; i < this.segments.length; i++) {
        if (i == 0) {
            this.segments[i].drawSquare("Green");
        }else if (i % 2 == 0) {
            this.segments[i].drawSquare("Blue");				
        } else {
            this.segments[i].drawSquare("Yellow");			
        }
    }
};

//  Создаем новую голову и добаляем её к началу змейки, чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;		
    this.direction = this.nextDirection;
    
    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
        this.oldDirection = this.direction;			
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
        this.oldDirection = this.direction;			
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
        this.oldDirection = this.direction;			
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
        this.oldDirection = this.direction;			
    } else if (this.direction === "stop") {
        // Попытки сделать остановку анимации по нажатию на пробел						
        ctx.font = "60px Arial";
        ctx.fillStyle = "Black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Пауза", width / 2, height / 2);			
        ctx.font = "20px Arial";
        ctx.fillText("Для продолжения жмите стрелки или пробел", width / 2, height / 2 + 50);
        ctx.globalCompositeOperation='destination-over';			
        return;			
    } 
    
    if (this.checkCollision(newHead)) {
        gameOver();
        gameStop = false;
        return;			
    }
    
    this.segments.unshift(newHead);
    
    if (newHead.equal(apple.position)) {
        score++;		
        if (score % 10 === 0) {
        animationTime -= 10; //Ускоряем игру после каждого съеденного яблока, уменьшая animationTime на 1
        speedGame++; // Переменная для отображения скорости игры
        };
        apple.move();
    } else {
        this.segments.pop();
    }    
};

//  Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollision = function (head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 3);
    var rightCollision = (head.col === widthInBlocks - 1);
    var buttomCollision = (head.row === heightInBlocks -1);
    
    var wallCollision = leftCollision || topCollision || rightCollision || buttomCollision;
    
    var selfCollision = false;
    
    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }
    return wallCollision || selfCollision;
};

//  Задаём следующее направление движения змейки на основе нажатой клавиши
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }
/* Серия проверок. Если нажат пробел (пауза), то чтобы "голова" не вернулась назад и не совпала с телом
иначе игра будет завершена при выполнении метода checkCollision*/        
    else if (newDirection === "left" && this.oldDirection === "right") {
     return;
    } else if (newDirection === "right" && this.oldDirection === "left") {
     return;
    } else if (newDirection === "up" && this.oldDirection === "down") {
     return;
    } else if (newDirection === "down" && this.oldDirection === "up") {
     return;
    } 
/* Это условие позволяет запусить игру заново после нажатия на пробел*/
    else if (this.nextDirection === newDirection) {
        this.nextDirection = this.oldDirection;
    } else {		
        this.nextDirection = newDirection;
    }
};

//  Задаём конструктор Apple (яблоко)
var Apple = function () {
    this.position = new Block(10, 10);
};

//  Рисуем кружок в позиции яблока    
Apple.prototype.draw = function () {
    this.position.drawCircle("LimeGreen");
};
//  Перемещаем яблоко в случайную позицию
Apple.prototype.move = function () {
    for (var i = 0; i < snake.segments.length; i++) {
        if (this.position.equal(snake.segments[i])) {
            var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
            var randomRow = Math.floor(Math.random() * (heightInBlocks - 6)) + 5;
            this.position = new Block(randomCol, randomRow);
        }
    }		
};

//  Создаем объект-змейку и объект-яблоко
var snake = new Snake();
var apple = new Apple();

//  Запускаем функцию анимации через setTimeout
var animationTime = 100;
var timeoutId;
var gameStop = true;	
function gameLoop() {    
    ctx.clearRect(0, 0, width, height);
    drawScore();
    drawSpeed();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
    timeoutId = setTimeout(gameLoop, animationTime);		
};
gameLoop();

//  Назначаем переменные для кнопок управления
    let btnTop = document.querySelector('.btn-top');
    let btnRight = document.querySelector('.btn-right');
    let btnBottom = document.querySelector('.btn-bottom');
    let btnLeft = document.querySelector('.btn-left');
    let btnStop = document.querySelector('.btn-stop');

//  Преобразуме коды клавиш в направления
var directions = {        
    32: "stop",
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};
//  При нажатии на определенную кнопку управления сохраняем событие в переменную
//  Тело функции пишем тут
//  Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function (event) {
    var newDirection = directions[event.keyCode];// для упраления с кнопок на странице нужно добавить условие сюда и написать функцию обработки нажатия на кнопки управления
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }		
});

btnStop.addEventListener('click', () => {
    var newDirection = "stop";
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }	
});
btnTop.addEventListener('click', () => {
    var newDirection = "up";
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }	
});
btnRight.addEventListener('click', () => {
    var newDirection = "right";
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }	
});
btnBottom.addEventListener('click', () => {
    var newDirection = "down";
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }	
});
btnLeft.addEventListener('click', () => {
    var newDirection = "left";
    
    if (newDirection !== undefined && gameStop) {
        snake.setDirection(newDirection);
    }	
});
