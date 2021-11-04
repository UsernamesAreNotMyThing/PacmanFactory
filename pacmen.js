/** This array holds all the Pac-Men
 *  @type {PacMan[]} */
const pacMen = [];

class Vector {
	constructor(x = 0, y = 0) {
	  /** X coordinate
	   * @type number */
    	this.x = x;
		/** Y coordinate
		 * @type number*/
		this.y = y;
		this[Symbol.iterator] = () => {
			let coord = 0;
			return {
				next: () => {
					return {value: coord ? this.y : this.x, done: coord++ > 1};
				}
			}
		}
	}
  /** Increase value
   * @param {number | Vector} dx X value to add
   * @param {number | undefined} dy Y value to add
   * @returns itself
   */
	inc(dx = 1, dy) {
		if (dx instanceof Vector || (dx.x !== undefined && dx.y !== undefined)) {
			this.x += dx.x; this.y += dx.y;
		} else {
			if (typeof dy == 'number') {
				this.x += dx; this.y += dy;
			} else {
				this.x += dx; this.y += dx;
			}
		} return this;
	}
	/** Decrease value
	 * @param {Vector | number} dx X value to subtract
	 * @param {number | undefined} dy Y value to subtract
	 * @returns itself
	 */
	dec(dx = 1, dy) {
		if (dx instanceof Vector) {
			this.x -= dx.x; this.y -= dx.y;
		} else if (typeof dy == 'number') {
			this.x -= dx; this.y -= dy;
		} else {
			this.x -= dx; this.y -= dx;
		} return this;
	}
	
	toString() { return `(${this.x}, ${this.y})`; }
	/**
	 * @param {Vector | {x: number; y: number;}} a 
	 * @param {Vector | {x: number; y: number;}} b 
	 * @returns A new vector */
	static add(a, b) {
		return new Vector(a.x + b.x, a.y + b.y);
	}
	/** Subtract
	 * @param {Vector} a
	 * @param {Vector} b*/
	static subtract(a, b) {
		return new Vector(a.x - b.x, a.y - b.y);
	}
  /** Multiplies
   * @param {Vector} a 
   * @param {Vector | number | {x: number; y: number;}} b 
   * @returns A new vector*/
	static multiply(a, b) {
		if (b instanceof Vector || (typeof b == 'object' && 'x' in b && 'y' in b))
			return new Vector(a.x * b.x, a.y * b.y);
		else if (typeof b == 'number') return new Vector(a.x * b, a.y * b);
		else throw new TypeError();
	}
	/** Divides
	* @param {Vector} a
	* @param {Vector | number} b
	@returns A new vector were the `x` and `y` values have been divided by `b`*/
	static divide(a, b) {
		if (b instanceof Vector)
			return new Vector(a.x / b.x, a.y / b.y);
		else return new Vector(a.x / b, a.y / b);
	}
	/** @param {Vector} a
	 * @param {Vector} b
	 * @returns Are the vectors equal?
	 */
	static equal(a, b) { return a.x == b.x && a.y == b.y; }
}

class PacMan {
	/**
	 * 
	 * @param {number} scale 
	 * @param {number} speed 
	 * @param {Vector} startWhere 
	 */
	constructor(scale = undefined, speed = 50, startWhere = undefined) {
		pacMen.push(this);
		this.position = startWhere instanceof Vector ? startWhere : new Vector(
			Math.random() * (scale !== undefined ? scale : innerWidth),
			Math.random() * (scale !== undefined ? scale : innerHeight));
		this.velocity = new Vector(Math.random() * speed, Math.random() * speed);
		this.element = document.createElement('img');
		this.element.className = 'pacman';
		this.element.src = 'images/PacMan1.png';
		this.element.style.left	= `${this.position.x}px`;
		this.element.style.top	= `${this.position.y}px`;
		document.body.append(this.element);
		this.frame = 0;
		this.speed = 1;
		/**
		 * @type {'normal' | 'follow-mouse'}
		 */
		this.behavior = 'normal';
		/** Interval timer
		 * @type number @deprecated*/
		this.interval = null;
	}
	/** @deprecated */
	start() {
		throw 'This is not implemented';
	}
	update() {
		switch (this.behavior) {
			case 'normal':
				this.position.inc(Vector.multiply(this.velocity, this.speed));
				this.element.style.left = this.position.x + 'px';
				this.element.style.top = this.position.y + 'px';
				if ((this.velocity.x < 0 && this.position.x - 50 <= 0) || (this.velocity.x > 0 && this.position.x + 50 >= innerWidth))
				this.velocity.x *= -1;
				if ((this.velocity.y < 0 && this.position.y - 50 <= 0) || (this.velocity.y > 0 && this.position.y + 50 >= innerHeight))
				this.velocity.y *= -1;
				this.element.style.transform = `/*scaleY(${this.velocity.x > 0 ? 1 : -1})*/ rotate(${Math.atan2(this.velocity.y, this.velocity.x)}rad)`;
				this.element.src = `images/PacMan${Math.floor((this.frame += .5) % 2 + 1)}.png`;
				break;
			case 'follow-mouse':
				break;
		}
	}
	stop() {
		return pacMen.splice(pacMen.indexOf(this), 1).length == 1;
	}
}
setInterval(() => pacMen.forEach((pm) => pm.update()), 50, 50);
/**
 * @param {MouseEvent} event
 * @param {Vector} where 
 * @param {{behavior: 'normal' | 'follow-mouse'; speed: number; size: number;}} extras
 */
function makeOne(event, where = undefined, extras = {
	behavior: /*document.getElementById('behavior').value*/ 'normal',
	speed: Number.parseFloat(document.getElementById('speed-slider').value),
	size: document.getElementById('size-slider').value
}) {
	if (where) console.assert(where instanceof Vector && typeof where.x == 'number' && typeof where.y == 'number');
	else where = new Vector(event.clientX, event.clientY);
	const pm = new PacMan(undefined, 50, where); // add a new PacMan
	if (extras) {
		if ('behavior' in extras) pm.behavior = extras.behavior;
		if (typeof extras.speed == 'number') pm.speed = extras.speed;
		if ('size' in extras) pm.element.style.width = `${extras.size}px`;
	}
	return pm;
}
/**
 * 
 * @param {string} fromString 
 */
function getNumber(fromString) {
	return Number.parseFloat(/^(?<value>\d(?:\.\d*)?)/s.exec(fromString).groups.value);
}
/**
 * 
 * @param {HTMLElement} element 
 * @param {DragEvent} event 
 */
function startDrag(element, event) {
	if (element.tagName != 'FIELDSET') return;
	else event.preventDefault();
	element.style.top	= `${event.clientY - element.style.height / 2}px`;
	element.style.left	= `${event.clientX}px`;
}
/**
 * 
 * @param {HTMLElement} element 
 * @param {DragEvent} event 
 */
/*function stopDrag(element, event) {
	element.style.
}*/