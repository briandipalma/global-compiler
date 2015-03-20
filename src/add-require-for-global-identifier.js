const {builders, namedTypes} = require('recast').types;

import {createRequireDeclaration} from './utils/utilities';

/**
 * This transform adds CJS requires for specified global identifiers.
 */
export const addRequireForGlobalIdentifierVisitor = {
	/**
	 * @param {Map<Sequence<string>, string>} identifiersToRequire - The identifiers that should be required.
	 * @param {AstNode[]} programStatements - Program body statements.
	 */
	initialize(identifiersToRequire, programStatements) {
		this._matchedGlobalIdentifiers = new Map();
		this._programStatements = programStatements;
		this._identifiersToRequire = identifiersToRequire;
	},

	/**
	 * @param {NodePath} identifierNodePath - Identifier NodePath.
	 */
	visitIdentifier(identifierNodePath) {
		for (let [identifierSequence, libraryID] of this._identifiersToRequire) {
			if (isIdentifierToRequire(identifierNodePath, identifierSequence)) {
				this._matchedGlobalIdentifiers.set(identifierNodePath, identifierSequence);
			}
		}

		this.traverse(identifierNodePath);
	},

	/**
	 * @param {NodePath} programNodePath - Program NodePath.
	 */
	visitProgram(programNodePath) {
		this.traverse(programNodePath);

		addRequiresForGlobalIdentifiers(this._matchedGlobalIdentifiers, this._identifiersToRequire, this._programStatements);
	}
}

/**
 * Checks if identifier is an identifier to create a require for.
 *
 * @param {NodePath} identifierNodePath - An identifier NodePath.
 * @param {Sequence<string>} identifierSequence - The identifier sequence to check.
 * @returns {boolean} true if identifier should be required.
 */
function isIdentifierToRequire(identifierNodePath, identifierSequence) {
	const isPartOfIdentifierToRequire = (identifierNodePath.node.name === identifierSequence.last());

	if (isPartOfIdentifierToRequire && identifierSequence.count() > 1) {
		const [nextNodePathInSequence, remainingSequence] = getNextNodePath(identifierNodePath, identifierSequence);

		if (nextNodePathInSequence) {
			return isIdentifierToRequire(nextNodePathInSequence, remainingSequence);
		}
	} else if (isPartOfIdentifierToRequire) {
		return isStandaloneIdentifier(identifierNodePath);
	}

	return false;
}

/**
 * Returns the next NodePath to check against a sequence if there is one that matches the values
 * in the Sequence.
 *
 * @param {NodePath} identifierNodePath - An identifier NodePath.
 * @param {Sequence<string>} identifierSequence - The identifier sequence to check.
 * @returns {([NodePath, Sequence<string>]|undefined)} Next NodePath to check.
 */
function getNextNodePath(identifierNodePath, identifierSequence) {
	const remainingSequence = identifierSequence.butLast();
	const identifierParentNodePath = identifierNodePath.parent;

	if (namedTypes.MemberExpression.check(identifierParentNodePath.node)) {
		const object = identifierParentNodePath.get('object');

		if (namedTypes.CallExpression.check(object.node) && remainingSequence.last() === '()') {
			return [object.get('callee'), remainingSequence.butLast()];
		}

		return [object, remainingSequence];
	}
}

/**
 * We don't want to match an identifier if by coincidence it's part of a larger expression.
 * i.e. my.expression.jQuery.shouldnt.match.
 *
 * @param {NodePath} identifierNodePath - An identifier NodePath.
 * @returns {boolean} true if identifier is the root of an expression.
 */
function isStandaloneIdentifier(identifierNodePath) {
	const identifierParentNodePath = identifierNodePath.parent;

	if (namedTypes.CallExpression.check(identifierParentNodePath.node)) {
		return true;
	} else if (namedTypes.MemberExpression.check(identifierParentNodePath.node)) {
		return identifierParentNodePath.get('object') === identifierNodePath;
	}

	return false;
}

/**
 * Add any requires to the module head that are deemed to be required for the global identifiers in the module.
 *
 * @param {Map<AstNode, Sequence<string>>} matchedGlobalIdentifiers - The identifiers that should be required.
 * @param {Map<Sequence<string>, string>} identifiersToRequire - The identifiers that should be required.
 * @param {AstNode[]} programStatements - Program body statements.
 */
function addRequiresForGlobalIdentifiers(matchedGlobalIdentifiers, identifiersToRequire, programStatements) {
	const moduleIdentifiersToRequire = new Set(matchedGlobalIdentifiers.values());

	//TODO: You have a match on the longer and a match on the shorter of two libraries using the same identifiers.
	//The longer needs the shorter as it's a plugin so all you need to do is require the longer as it should
	//require the shorter itself. The require statement will have a variable with a name equals to the shorter.
	for (let sequenceToRequire of moduleIdentifiersToRequire) {
		const moduleID = identifiersToRequire.get(sequenceToRequire);
		const moduleIdentifier = builders.identifier(sequenceToRequire.first());
		const importDeclaration = createRequireDeclaration(moduleIdentifier, moduleID);

		console.log('Adding require for', moduleID, 'with variable name', sequenceToRequire.first());
		programStatements.unshift(importDeclaration);
	}
}
