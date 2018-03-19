// const assert = require('chai').assert;
const assert = require('assert');

const Container = require('./index');

describe('Test', () => {
	it('registration & instantiation', () => {
		const container = new Container();

		container.registerClass('a', A);
		container.registerClass('b', B, true);
		container.registerClass('c', C);
		container.registerClass('d', D);
		container.registerClass('s', S);

		container.registerFactory('factoryA', factoryA);
		container.registerFactory('factoryC', factoryC);

		container.registerValue('myValue', 'hello world!');

		const aFactory = container.getInstance('factoryA');
		const a = aFactory.create();
		a.hello();

		const s = container.getInstance('s');
		s.hello();
	});

	it('check duplicate names', () => {
		const container = new Container();

		container.registerClass('a', A);

		assert.throws(() => {
			container.registerClass('a', B);
		});

		assert.throws(() => {
			container.registerFactory('a', factoryA);
		});

		assert.throws(() => {
			container.registerValue('a', 'hello');
		});
	});

	it('check registered entities', () => {
		const container = new Container();
		container.registerClass('a', 123);


		assert.throws(() => {
			container.checkDependencies();
		});
	});

	it('duplicate name with parent container', () => {
		const parentContainer = new Container();
		const container = new Container(parentContainer);

		parentContainer.registerClass('myClass', D);
		container.registerClass('myClass', E);

		const myClass1 = parentContainer.getInstance('myClass');
		const myClass2 = container.getInstance('myClass');

		assert.ok(myClass1 instanceof D);
		assert.ok(myClass2 instanceof E);
	});

	it('instantiate with parent container', () => {
		const parentContainer = new Container();
		const container = new Container(parentContainer);

		parentContainer.registerClass('a', A);
		parentContainer.registerClass('b', B, true);
		parentContainer.registerClass('c', C);
		parentContainer.registerClass('d', D);

		parentContainer.registerValue('myValue', 'hello world!');
		container.registerClass('myValue', 'another value');

		const a1 = parentContainer.getInstance('a');
		const a2 = container.getInstance('a');

		assert.ok(a1 instanceof A);
		assert.ok(a2 instanceof A);
	});

	it('check registered entities with parent container', () => {
		const parentContainer = new Container();
		const container = new Container(parentContainer);

		parentContainer.registerClass('a', 123);
		container.registerValue('b', 456);

		assert.throws(() => {
			container.checkDependencies();
		});
	});
});

class Base {
	constructor() {
		console.log('new Instance', this.constructor.name);
	}

	_hello() {
		console.log('this is', this.constructor.name);
	}
}

class A extends Base {
	constructor(b, c) {
		super();

		this._b = b;
		this._c = c;
	}

	hello() {
		this._hello();
		this._b.hello();
		this._c.hello();
	}
}

class B extends Base {
	constructor(myValue) {
		super();

		this._myValue = myValue;
	}

	hello() {
		console.log(this._myValue);
		this._hello();
	}
}

class C extends Base {
	constructor(b, d) {
		super();

		this._b = b;
		this._d = d;
	}

	hello() {
		this._hello();
		this._b.hello();
		this._d.hello();
	}
}

class D extends Base {
	hello() {
		this._hello();
	}
}

class E extends Base {
	hello() {
		this._hello();
	}
}

class S extends Base {
	constructor(factoryC) {
		super();

		this._factoryC = factoryC;
	}

	hello() {
		const c = this._factoryC.create();
		this._hello();
		c.hello();
	}
}


function factoryA(b, c) {
	console.log('factoryA with', b, c);
	return {create: () => new A(b, c)}
}

function factoryC(b, d) {
	console.log('factoryC with', b, d);
	return {create: () => new C(b, d)}
}
