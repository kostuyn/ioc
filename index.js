'use strict';

class Container {
	constructor(parentContainer) {
		this._parentContainer = parentContainer;

		this._classes = new Map();
		this._factories = new Map();
		this._instances = new Map();
		this._values = new Map();

		this._uniqueNames = new Set();
	}

	classesGet(name){
		return this._classes.get(name) || this._parentContainer && this._parentContainer.classesGet(name);
	}

	factoriesGet(name){
		return this._factories.get(name) || this._parentContainer && this._parentContainer.factoriesGet(name);
	}

	instancesGet(name){
		return this._instances.get(name) || this._parentContainer && this._parentContainer.instancesGet(name);
	}

	valuesGet(name){
		return this._values.get(name) || this._parentContainer && this._parentContainer.valuesGet(name);
	}

	registerClass(name, Class, isSingleton = false) {
		this._setName(name);
		this._classes.set(name, {Class, isSingleton});
	}

	registerFactory(name, factory) {
		this._setName(name);
		this._factories.set(name, factory);
	}

	registerValue(name, value) {
		this._setName(name);
		this._values.set(name, value);
	}

	getInstance(name) {
		const instance = this.instancesGet(name);
		if(instance) {
			return instance;
		}

		const value = this.valuesGet(name);
		if(value) {
			return value;
		}

		const classItem = this.classesGet(name);
		if(classItem) {
			const args = this._getConstructorArgNames(classItem.Class);
			const dependencies = this._getDependencies(args);

			const instance = new classItem.Class(...dependencies);

			if(classItem.isSingleton) {
				this._instances.set(name, instance);
			}

			return instance;
		}

		const factory = this.factoriesGet(name);
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

		if(this._parentContainer){
			this._parentContainer.checkDependencies();
		}
	}

	checkDuplicateName(name){
		if(this._uniqueNames.has(name)) {
			throw new Error('Duplicate dependency name:' + name);
		}
	}

	_setName(name) {
		this.checkDuplicateName(name);
		this._uniqueNames.add(name);
	}

	_getDependencies(args) {
		return args.map((argName) => {
			return this.getInstance(argName);
		});
	}

	_getFunctionArgNames(func) {
		const regex = /^(?:function)?\s*[^\(]*\(\s*([^\)]*)\)(?:=>)?/m;
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

module.exports = Container;
