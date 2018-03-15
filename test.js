// const assert = require('chai').assert;
const assert = require('assert');

const IocContainer = require('./index');

describe('Test', () => {
	it('registration & instantiation', () => {
		const ioc = new IocContainer();

		ioc.registerClass('a', A);
		ioc.registerClass('b', B, true);
		ioc.registerClass('c', C);
		ioc.registerClass('d', D);
		ioc.registerClass('s', S);

		ioc.registerFactory('factoryA', factoryA);
		ioc.registerFactory('factoryC', factoryC);

		ioc.registerValue('myValue', 'hello world!');

		const aFactory = ioc.getInstance('factoryA');
		const a = aFactory.create();
		a.hello();

		const s = ioc.getInstance('s');
		s.hello();
	});

	it('check duplicate names', () => {
		const ioc = new IocContainer();

		ioc.registerClass('a', A);

		assert.throws(() => {
			ioc.registerClass('a', B);
		});

		assert.throws(() => {
			ioc.registerFactory('a', factoryA);
		});

		assert.throws(() => {
			ioc.registerValue('a', 'hello');
		});
	});

	it('check registered entities', () => {
		const ioc = new IocContainer();
		ioc.registerClass('a', 123);


		assert.throws(() => {
			ioc.checkDependencies();
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
