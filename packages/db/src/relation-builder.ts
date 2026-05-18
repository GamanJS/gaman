type RelationType = 'hasOne' | 'hasMany' | 'belongsTo';

export class RelationBuilder<T> {
	constructor(private currentTable: string) {}

	hasMany(target: any, config: { foreignKey: string }) {
		return {
			type: 'hasMany' as RelationType,
			target,
			foreignKey: config.foreignKey,
		};
	}

	belongsTo(target: any, config: { foreignKey: string }) {
		return {
			type: 'belongsTo' as RelationType,
			target,
			foreignKey: config.foreignKey,
		};
	}

	hasOne(target: any, config: { foreignKey: string }) {
		return {
			type: 'hasOne' as RelationType,
			target,
			foreignKey: config.foreignKey,
		};
	}
}