'use strict';

class IocContainer {
	constructor() {
		this._classes = new Map();
		this._factories = new Map();
		this._instances = new Map();
		this._values = new Map();

		this._uniqueNames = new Set();
	}

	registerClass(name, Class, isSingleton = false) {
		this._checkDuplicateName(name);
		this._classes.set(name, {Class, isSingleton});
	}

	registerFactory(name, factory) {
		this._checkDuplicateName(name);
		this._factories.set(name, factory);
	}

	registerValue(name, value) {
		this._checkDuplicateName(name);
		this._values.set(name, value);
	}

	getInstance(name) {
		const instance = this._instances.get(name);
		if(instance) {
			return instance;
		}

		const value = this._values.get(name);
		if(value) {
			return value;
		}

		const classItem = this._classes.get(name);
		if(classItem) {
			const args = this._getConstructorArgNames(classItem.Class);
			const dependencies = this._getDependencies(args);

			const instance = new classItem.Class(...dependencies);

			if(classItem.isSingleton) {
				this._instances.set(name, instance);
			}

			return instance;
		}

		const factory = this._factories.get(name);
		if(factory) {
			const args = this._getFunctionArgNames(factory);
			const dependencies = this._getDependencies(args);

			return factory(...dependencies);
		}

		throw new Error('Dependency ' + name + ' not found');
	}

	checkDependencies() {
		this._uniqueNames.forEach((name) => {
			try{
				this.getInstance(name);
			} catch(e) {
				throw new Error('Dependency "' + name + '" fail: ' + e.message);
			}
		});
	}

	_checkDuplicateName(name) {
		if(this._uniqueNames.has(name)) {
			throw new Error('Duplicate dependency name:' + name);
		}

		this._uniqueNames.add(name);
	}

	_getDependencies(args) {
		return args.map((argName) => {
			return this.getInstance(argName);
		});
	}

	_getFunctionArgNames(func) {
		const regex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
		return this._parseArgs(func, regex);
	};

	_getConstructorArgNames(cls) {
		const regex = /constructor\s*[^\(]*\(\s*([^\)]*)\)/m;
		return this._parseArgs(cls, regex);
	};

	_parseArgs(method, regex) {
		const matched = method.toString().match(regex);
		const args = (matched) ? matched[1].trim().split(/[\s,]+/) : [''];

		if(args[0] === '') {
			return [];
		}

		return args;
	}
}

module.exports = IocContainer;
