'use strict';

class IocContainer {
	constructor() {
		this._classes = new Map();
		this._factories = new Map();
		this._instances = new Map();
	}

	registerClass(name, Class, isSingleton = false) {
		this._classes.set(name, {Class, isSingleton});
	}

	registerFactory(name, factory) {
		this._factories.set(name, factory);
	}

	getInstance(name) {
		const instance = this._instances.get(name);
		if(instance){
			return instance;
		}

		const classItem = this._classes.get(name);
		const factory = this._factories.get(name);

		if(classItem) {
			const args = this._getConstructorArgNames(classItem.Class);
			const dependencies = this._getDependencies(args);

			const instance = new classItem.Class(...dependencies);

			if(classItem.isSingleton){
				this._instances.set(name, instance);
			}

			return instance;
		}
		else if(factory) {
			const args = this._getFunctionArgNames(factory);
			const dependencies = this._getDependencies(args);

			return factory(...dependencies);
		}

		throw new Error('Dependency ' + name + ' not found');
	}

	_getDependencies(args) {
		return args.map((argName) => {
			return this.getInstance(argName);
		});
	}

	_getFunctionArgNames(funcName) {
		const regex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
		return this._parseArgs(funcName, regex);
	};

	_getConstructorArgNames(className) {
		const regex = /constructor\s*[^\(]*\(\s*([^\)]*)\)/m;
		return this._parseArgs(className, regex);
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
